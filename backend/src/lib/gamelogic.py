from __future__ import annotations
from enum import Enum


class InvalidTurnException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


# You can notice +1 and -1 in some color manipulations especially in REP functions
# It is needed for more comfortable board representation: 0 = NONE color, not -1
class StoneColor(int, Enum):
    NONE = -1
    RED = 0
    YELLOW = 1
    PEACH = 2
    GREEN = 3
    CYAN = 4
    PURPLE = 5


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

    @staticmethod
    def from_str(char: str):
        return Stone(StoneColor(int(char) - 1))

    def __str__(self):
        return str(self.color + 1)

    def __int__(self):
        return int(self.color)


class GameBoard:
    def __init__(self, height: int = 19, width: int = 19, players: int = 2):
        self.height: int = height
        self.width: int = width
        self.players: int = players
        self.stones: list[list[Stone | None]] = [
            [None for _ in range(width)] for _ in range(height)
        ]
        self.all_groups: list[Group] = []
        self.turn_color: StoneColor = StoneColor.RED
        self.prev_turns: list[tuple[int, int]] = [(-1, -1)] * players
        self.scores: list[float] = [
            round(i * (8.1 - players), 1) for i in range(players)
        ]
        self.pass_counter: int = 0
        self.finished_players: set[StoneColor] = set()
        self.killer: StoneColor | None = None

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
    def prev_turn(self) -> tuple[int, int]:
        return self.prev_turns[self.turn_color]

    @prev_turn.setter
    def prev_turn(self, point: tuple[int, int]):
        self.prev_turns[self.turn_color] = point

    def update_turn_color(self):
        if len(self.finished_players) >= self.players:
            self.turn_color = StoneColor.NONE  # Avoid inifinity loop
            return
        self.turn_color = StoneColor((self.turn_color + 1) % self.players)
        while self.turn_color in self.finished_players:
            self.turn_color = StoneColor((self.turn_color + 1) % self.players)

    def increment_score(self, color: StoneColor, value: int = 1):
        self.scores[color] += value

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
                self.killer = stone.color

        self.prev_turn = (i, j)
        self.pass_counter = 0
        self.increment_score(self.turn_color)
        self.update_turn_color()

    def pass_turn(self):
        self.prev_turn = (-1, -1)
        self.pass_counter += 1
        self.update_turn_color()

    def finish_turns_turn(self):
        self.finished_players.add(self.turn_color)
        self.update_turn_color()

    @staticmethod
    def from_rep(rep: str) -> GameBoard:
        """Format:
        height;width;players;turn_color;pass_counter;<finished_players>;<board_rep>

        <board_rep> is the sequence of numbers,
        which represent the color of stone on a specific point
        OR vacant point if 0
        OR length of sequence of vacant points if in ().
        Last vacant points can be skipped.

        <finished_players> is sequence of numbers
        which represent the color of a player
        who will no longer take turns in this game
        """

        *rest_params, finished_players, board_rep = rep.split(";")
        height, width, players, turn_color, pass_counter = map(int, rest_params)
        board = GameBoard(height, width, players)
        board.turn_color = StoneColor(turn_color - 1)
        board.pass_counter = pass_counter
        board.finished_players = set(
            map(lambda v: StoneColor(int(v) - 1), finished_players)
        )

        pos = 0
        left_parenthesis_idx: int | None = None
        for idx, char in enumerate(board_rep):
            if char == "(":
                left_parenthesis_idx = idx
            elif left_parenthesis_idx is None:
                if char != "0":
                    stone = Stone.from_str(char)
                    board.stones[pos // width][pos % width] = stone
                    board.increment_score(stone.color)
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
        return ";".join(
            map(
                str,
                [
                    self.height,
                    self.width,
                    self.players,
                    self.turn_color + 1,
                    self.pass_counter,
                    "".join(map(lambda v: str(v + 1), self.finished_players)),
                    rep
                ],
            )
        )

    to_rep.__doc__ = from_rep.__doc__