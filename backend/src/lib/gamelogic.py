from __future__ import annotations
from enum import Enum


class InvalidTurnException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class StoneColor(int, Enum):
    NONE = 0
    WHITE = 1
    BLACK = 2


class Group:
    UNGROUPED: Group

    def __init__(self, color: StoneColor):
        self.color = color
        self.member_stones: dict[tuple[int, int], Stone] = {}
        self.frontier_stones: dict[tuple[int, int], Stone] = {}
        self.liberties: set[tuple[int, int]] = set()

    @property
    def member_groups(self) -> set[Group]:
        return {stone.group for stone in self.member_stones.values()}

    @property
    def frontier_groups(self) -> set[Group]:
        return {stone.group for stone in self.frontier_stones.values()}

    def add(self, x: int, y: int, stone: Stone | None):
        if stone:
            if stone.color == self.color:
                self.member_stones[(x, y)] = stone
                stone.group = self
            else:
                self.frontier_stones[(x, y)] = stone
        else:
            self.liberties.add((x, y))

    def update(self, stones: dict[tuple[int, int], Stone | None]):
        for (x, y), stone in stones.items():
            self.add(x, y, stone)

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

    def free(self, x: int, y: int):
        if (x, y) in self.frontier_stones:
            self.frontier_stones.pop((x, y))
            self.liberties.add((x, y))


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
    def __init__(self, x_size: int = 19, y_size: int = 19):
        self.sides = [StoneColor.WHITE, StoneColor.BLACK]
        self.x_size = x_size
        self.y_size = y_size
        self.stones: list[list[Stone | None]] = [
            [None for _ in range(y_size)] for _ in range(x_size)
        ]
        self.all_groups: list[Group] = []
        self.turn_counter = 0
        self.__prev_turn: list[tuple[int, int]] = [(-1, -1)] * 2

    def __str__(self):
        return "\n".join(
            "".join(
                str(stone) if (stone := self.stones[x][y]) else "0"
                for x in range(self.x_size)
            )
            for y in range(self.y_size)
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
        self.delete_group(second_group)

    @property
    def turn_color(self) -> StoneColor:
        return self.sides[self.turn_counter % len(self.sides)]

    @property
    def prev_turn(self) -> tuple[int, int]:
        return self.__prev_turn[self.turn_counter % len(self.sides)]

    @prev_turn.setter
    def prev_turn(self, position: tuple[int, int]):
        self.__prev_turn[self.turn_counter % len(self.sides)] = position

    def is_valid(self, x: int, y: int):
        return 0 <= x < self.x_size and 0 <= y < self.y_size

    def get_adjacent(self, x: int, y: int) -> dict[tuple[int, int], Stone | None]:
        return {
            (x + dx, y + dy): self.stones[x + dx][y + dy]
            for dx, dy in ((-1, 0), (0, -1), (1, 0), (0, 1))
            if self.is_valid(x + dx, y + dy)
        }

    def clear_groups(self):
        for column in self.stones:
            for stone in column:
                if stone:
                    stone.group = Group.UNGROUPED
        self.all_groups.clear()

    def estimate_groups(self):
        self.clear_groups()
        for x, column in enumerate(self.stones):
            for y, stone in enumerate(column):
                if stone and stone.group is Group.UNGROUPED:
                    group = self.create_group(stone.color)
                    group.add(x, y, stone)
                    new_member_positions = {(x, y)}

                    while new_member_positions:
                        next_member_position = new_member_positions.pop()
                        adjacent = self.get_adjacent(*next_member_position)
                        new_member_positions.update(
                            (x, y)
                            for (x, y), stone in adjacent.items()
                            if stone
                            and stone.color == group.color
                            and (x, y) not in group.member_stones
                        )
                        group.update(adjacent)

    def kill(self, group: Group):
        for x, y in group.member_stones.keys():
            self.stones[x][y] = None

        # Loose frontier groups
        for frontier_group in group.frontier_groups:
            for member_x, member_y in group.member_stones.keys():
                frontier_group.free(member_x, member_y)

        self.delete_group(group)

    def take_turn(self, x: int, y: int):
        if not self.is_valid(x, y):
            raise InvalidTurnException("Invalid (X, Y)")
        if self.stones[x][y]:
            raise InvalidTurnException("Point is already occupied")
        if self.prev_turn == (x, y):
            raise InvalidTurnException("Ko rule")

        stone = Stone(self.turn_color)
        self.stones[x][y] = stone

        group = self.create_group(stone.color)
        group.update(self.get_adjacent(x, y))
        ally_groups = group.member_groups
        opponent_groups = group.frontier_groups
        group.add(x, y, stone)

        # Check suicide
        if (
            all(len(g.liberties) > 1 for g in opponent_groups)
            and len(group.liberties) == 0
        ):
            raise InvalidTurnException("Suicide")

        # Merge ally groups
        for ally_group in ally_groups:
            self.merge_groups(group, ally_group)
        if ally_groups:
            group.liberties.remove((x, y))

        # Update opponent liberties
        for opponent_group in opponent_groups:
            opponent_group.liberties.remove((x, y))
            opponent_group.frontier_stones[(x, y)] = stone
            if len(opponent_group.liberties) == 0:
                self.kill(opponent_group)

        self.prev_turn = (x, y)
        self.turn_counter += 1

    @staticmethod
    def from_rep(rep: str) -> GameBoard:
        """Format:
        x_size;y_size;<board_rep>

        Where <board_rep> is the sequence of numbers,
        which represents the color of stone on a specific point
        OR vacant point if 0
        OR length of sequence of vacant points if in ().
        Last vacant points can be skipped"""

        x_size, y_size, board_rep = rep.split(";")
        x_size, y_size = int(x_size), int(y_size)
        board = GameBoard(x_size, y_size)

        pos = 0
        left_parenthesis_idx: int | None = None
        for i, char in enumerate(board_rep):
            if char == "(":
                left_parenthesis_idx = i
            elif left_parenthesis_idx is None:
                if char != "0":
                    board.stones[pos % x_size][pos // x_size] = Stone(
                        StoneColor(int(char))
                    )
                pos += 1
            elif char == ")":
                pos += int(board_rep[(left_parenthesis_idx + 1) : i])
                left_parenthesis_idx = None

        board.estimate_groups()
        return board

    def to_rep(self) -> str:
        rep = ""
        zeros_combo = 0
        for y in range(self.y_size):
            for x in range(self.x_size):
                stone = self.stones[x][y]
                if stone:
                    rep += (
                        f"({zeros_combo})" if zeros_combo > 3 else ("0" * zeros_combo)
                    ) + str(stone)
                    zeros_combo = 0
                else:
                    zeros_combo += 1
        return f"{self.x_size};{self.y_size};" + rep

    to_rep.__doc__ = from_rep.__doc__