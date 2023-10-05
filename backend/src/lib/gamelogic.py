from __future__ import annotations
from enum import Enum


class InvalidTurnException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class StoneColor(int, Enum):
    NONE = 0
    RED = 1
    YELLOW = 2
    PEACH = 3
    GREEN = 4
    CYAN = 5
    PURPLE = 6


class Group:
    UNGROUPED: Group

    def __init__(self, color: StoneColor):
        self.color = color
        self.member_stones: dict[tuple[int, int], Stone] = {}
        self.frontier_stones: dict[tuple[int, int], Stone] = {}
        self.liberties: set[tuple[int, int]] = set()

    @property
    def frontier_groups(self) -> set[Group]:
        return {stone.group for stone in self.frontier_stones.values()}

    def add(self, i: int, j: int, stone: Stone | None):
        if stone:
            if stone.color == self.color:
                self.member_stones[(i, j)] = stone
                if stone.group is Group.UNGROUPED:
                    stone.group = self
            else:
                self.frontier_stones[(i, j)] = stone
        else:
            self.liberties.add((i, j))

    def update(self, stones: dict[tuple[int, int], Stone | None]):
        for (i, j), stone in stones.items():
            self.add(i, j, stone)

    def clear(self):
        self.member_stones.clear()
        self.frontier_stones.clear()
        self.liberties.clear()

    def merge(self, group: Group):
        self.member_stones.update(group.member_stones)
        self.frontier_stones.update(group.frontier_stones)
        self.liberties.update(group.liberties)
        for stone in group.member_stones.values():
            stone.group = self
        group.clear()

    def free(self, i: int, j: int):
        if (i, j) in self.frontier_stones:
            self.frontier_stones.pop((i, j))
            self.liberties.add((i, j))


Group.UNGROUPED = Group(StoneColor.NONE)


class Stone:
    def __init__(self, color: StoneColor, group: Group = Group.UNGROUPED):
        self.color = color
        self.group = group

    def __str__(self):
        return str(self.color.value)

    def __int__(self):
        return int(self.color.value)


class GameBoard:
    def __init__(self, height: int = 19, width: int = 19, players: int = 2):
        self.height = height
        self.width = width
        self.players = players
        self.stones: list[list[Stone | None]] = [
            [None for _ in range(width)] for _ in range(height)
        ]
        self.all_groups: list[Group] = []
        self.turn_counter = 0
        self.scores: list[int] = [0] * players
        self.__prev_turn: list[tuple[int, int]] = [(-1, -1)] * players

    def __str__(self):
        return "\n".join(
            "".join(str(stone) if stone else "0" for stone in row)
            for row in self.stones
        )

    def create_group(self, color: StoneColor) -> Group:
        group = Group(color)
        self.all_groups.append(group)
        return group

    def delete_group(self, group: Group):
        group.clear()
        self.all_groups.remove(group)

    def merge_groups(self, first_group: Group, second_group: Group):
        first_group.merge(second_group)
        self.all_groups.remove(second_group)

    @property
    def turn_color(self) -> StoneColor:
        return StoneColor(self.turn_counter % self.players + 1)

    @property
    def prev_turn(self) -> tuple[int, int]:
        return self.__prev_turn[self.turn_counter % self.players]

    @prev_turn.setter
    def prev_turn(self, point: tuple[int, int]):
        self.__prev_turn[self.turn_counter % self.players] = point

    def increment_score(self, color: StoneColor, value: int = 1):
        self.scores[int(color) - 1] += value

    def is_valid(self, i: int, j: int):
        return 0 <= i < self.height and 0 <= j < self.width

    def get_adjacent(self, i: int, j: int) -> dict[tuple[int, int], Stone | None]:
        return {
            (i + di, j + dj): self.stones[i + di][j + dj]
            for di, dj in ((-1, 0), (0, -1), (1, 0), (0, 1))
            if self.is_valid(i + di, j + dj)
        }

    def clear_groups(self):
        for column in self.stones:
            for stone in column:
                if stone:
                    stone.group = Group.UNGROUPED
        self.all_groups.clear()

    def estimate_groups(self):
        self.clear_groups()
        for i, row in enumerate(self.stones):
            for j, stone in enumerate(row):
                if stone and stone.group is Group.UNGROUPED:
                    group = self.create_group(stone.color)
                    group.add(i, j, stone)
                    new_member_positions = {(i, j)}

                    while new_member_positions:
                        next_member_position = new_member_positions.pop()
                        adjacent = self.get_adjacent(*next_member_position)
                        new_member_positions.update(
                            (i, j)
                            for (i, j), stone in adjacent.items()
                            if stone
                            and stone.color == group.color
                            and (i, j) not in group.member_stones
                        )
                        group.update(adjacent)

    def kill(self, group: Group):
        for i, j in group.member_stones.keys():
            self.stones[i][j] = None

        # Loose frontier groups
        for frontier_group in group.frontier_groups:
            for member_i, member_j in group.member_stones.keys():
                frontier_group.free(member_i, member_j)

        self.increment_score(group.color, -len(group.member_stones))
        self.delete_group(group)

    def take_turn(self, i: int, j: int):
        if not self.is_valid(i, j):
            raise InvalidTurnException("Invalid (I, J)")
        if self.stones[i][j]:
            raise InvalidTurnException("Point is already occupied")
        if self.prev_turn == (i, j):
            raise InvalidTurnException("Ko rule")

        stone = Stone(self.turn_color)
        self.stones[i][j] = stone

        group = self.create_group(stone.color)
        group.update(self.get_adjacent(i, j))
        ally_groups = {s.group for s in group.member_stones.values()}
        opponent_groups = group.frontier_groups
        group.add(i, j, stone)

        # Check suicide
        if (
            all(len(g.liberties) > 1 for g in opponent_groups)
            and all(len(g.liberties) == 1 for g in ally_groups)
            and len(group.liberties) == 0
        ):
            self.stones[i][j] = None
            self.delete_group(group)
            raise InvalidTurnException("Suicide")

        # Merge ally groups
        for ally_group in ally_groups:
            self.merge_groups(group, ally_group)
        if ally_groups:
            group.liberties.remove((i, j))

        # Update opponent liberties
        for opponent_group in opponent_groups:
            opponent_group.liberties.remove((i, j))
            opponent_group.frontier_stones[(i, j)] = stone
            if len(opponent_group.liberties) == 0:
                self.kill(opponent_group)

        self.prev_turn = (i, j)
        self.turn_counter += 1
        self.increment_score(stone.color)

    @staticmethod
    def from_rep(rep: str) -> GameBoard:
        """Format:
        height;width;<board_rep>

        Where <board_rep> is the sequence of numbers,
        which represents the color of stone on a specific point
        OR vacant point if 0
        OR length of sequence of vacant points if in ().
        Last vacant points can be skipped"""

        height, width, board_rep = rep.split(";")
        height, width = int(height), int(width)
        board = GameBoard(height, width)

        pos = 0
        left_parenthesis_idx: int | None = None
        for idx, char in enumerate(board_rep):
            if char == "(":
                left_parenthesis_idx = idx
            elif left_parenthesis_idx is None:
                if char != "0":
                    color = StoneColor(int(char))
                    board.stones[pos // width][pos % width] = Stone(color)
                    board.increment_score(color)
                pos += 1
            elif char == ")":
                pos += int(board_rep[(left_parenthesis_idx + 1) : idx])
                left_parenthesis_idx = None

        board.estimate_groups()
        return board

    def to_rep(self) -> str:
        rep = ""
        zeros_combo = 0
        for row in self.stones:
            for stone in row:
                if stone:
                    rep += (
                        f"({zeros_combo})" if zeros_combo > 3 else ("0" * zeros_combo)
                    ) + str(stone)
                    zeros_combo = 0
                else:
                    zeros_combo += 1
        return f"{self.height};{self.width};{rep}"

    to_rep.__doc__ = from_rep.__doc__