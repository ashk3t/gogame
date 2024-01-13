from __future__ import annotations
from enum import Enum
import math


class InvalidTurnException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


# You can notice +1 and -1 in some color manipulations especially in REP functions
# It is needed for more comfortable board representation: 0 = NONE color, not -1
class StoneColor(int, Enum):
    # Absence of stone marked as `None` object, NOT a `Stone` with `color == StoneColor.NONE`
    NONE = -1
    RED = 0
    YELLOW = 1
    GREEN = 2
    CYAN = 3
    PEACH = 4
    PURPLE = 5

    @classmethod
    def set(cls) -> set:
        return set(list(cls.__members__.values())[1:])


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
        self._score_adjustment: tuple[float, ...] = tuple(
            round(i * (8.1 - players), 1) for i in range(players)
        )
        self.scores: list[float] = list(self._score_adjustment)
        self.pass_counter: int = 0
        self.ko_position: tuple[int, int] | None = None
        self.finished_players: set[StoneColor] = set()
        self.killer: StoneColor | None = None
        self.occupation_colors: list[list[StoneColor]] = [
            [StoneColor.NONE for _ in range(width)] for _ in range(height)
        ]

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

    def update_turn_color(self):
        if len(self.finished_players) >= self.players:
            self.turn_color = StoneColor.NONE
            return
        self.turn_color = StoneColor((self.turn_color + 1) % self.players)
        while self.turn_color in self.finished_players:
            self.turn_color = StoneColor((self.turn_color + 1) % self.players)

    def estimate_occupation_color(self, i: int, j: int) -> StoneColor:
        R = 3.5
        stone_color_scores = [0.0] * self.players

        for di in range(-3, 4):
            for dj in range(-3, 4):
                if self.is_valid(i + di, j + dj):
                    stone = self.stones[i + di][j + dj]
                    if stone:
                        weight = max(R - math.hypot(di, dj), 0)
                        stone_color_scores[stone.color] += weight

        max_score = max(stone_color_scores)
        if stone_color_scores.count(max_score) == 1:
            return StoneColor(stone_color_scores.index(max_score))
        return StoneColor.NONE

    def update_scores(self):
        self.scores = list(self._score_adjustment)
        for i in range(self.height):
            for j in range(self.width):
                color = self.estimate_occupation_color(i, j)
                if color != StoneColor.NONE:
                    self.scores[color] += 1
                    self.occupation_colors[i][j] = color

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

        if len(group.member_stones) == 1:
            self.ko_position = tuple(group.member_stones.keys())[0]
        self.delete_group(group)

    def take_turn(self, i: int, j: int):
        if not self.is_valid(i, j):
            raise InvalidTurnException("Invalid (I, J)")
        if self.stones[i][j]:
            raise InvalidTurnException("Position is already occupied")
        if self.ko_position == (i, j):
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

        # Reset Ko position
        self.ko_position = None

        # Update opponent liberties
        for opponent_group in opponent_groups:
            opponent_group.liberties.remove((i, j))
            opponent_group.frontier_stones[(i, j)] = stone
            if len(opponent_group.liberties) == 0:
                self.kill(opponent_group)
                self.killer = stone.color

        self.pass_counter = 0
        self.update_scores()
        self.update_turn_color()

    def pass_turn(self):
        self.pass_counter += 1
        self.update_turn_color()

    def finish_turns_turn(self, color: StoneColor | None = None):
        if color == StoneColor.NONE:
            return

        if color is None or color == self.turn_color:
            self.finished_players.add(self.turn_color)
            self.update_turn_color()
        else:
            for i in range(1, self.pass_counter + 1):  # Pass + Finish != accident win
                if (self.turn_color - i) % self.players == color:
                    self.pass_counter -= 1
                    break
            self.finished_players.add(color)

    @staticmethod
    def from_rep(rep: str) -> GameBoard:
        """Format:
        height;width;players;turn_color;pass_counter;<ko_position>;<finished_players>;<rep>

        <rep> is the sequence of numbers,
        which represent the color of stone on a specific position
        OR vacant position if 0
        OR length of sequence of vacant positions if in ().
        Last vacant positions can be skipped.
        format: '0011(5)2'

        <finished_players> is sequence of numbers
        which represent the color of a player
        who will no longer take turns in this game
        format: '235'

        <ko_position> is a turn position that triggers ko rule
        format: '1,7'"""

        *rest_params, ko_position, finished_players, board_rep = rep.split(";")
        height, width, players, turn_color, pass_counter = map(int, rest_params)
        board = GameBoard(height, width, players)
        board.turn_color = StoneColor(turn_color - 1)
        board.pass_counter = pass_counter
        board.ko_position = (
            tuple(map(int, ko_position.split(","))) if ko_position else None
        )  # pyright: ignore
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
                pos += 1
            elif char == ")":
                pos += int(board_rep[(left_parenthesis_idx + 1) : idx])
                left_parenthesis_idx = None

        board.estimate_groups()
        board.update_scores()
        return board

    def to_rep(self) -> str:
        return ";".join(
            map(
                str,
                [
                    self.height,
                    self.width,
                    self.players,
                    self.turn_color + 1,
                    self.pass_counter,
                    f"{self.ko_position[0]},{self.ko_position[1]}"
                    if self.ko_position
                    else "",
                    "".join(map(lambda v: str(v + 1), self.finished_players)),
                    self.to_board_rep(),
                ],
            )
        )

    def to_board_rep(self) -> str:
        board_rep = ""
        zeros_combo = 0
        for row in self.stones:
            for stone in row:
                if stone:
                    board_rep += (
                        f"({zeros_combo})" if zeros_combo > 3 else ("0" * zeros_combo)
                    ) + str(stone)
                    zeros_combo = 0
                else:
                    zeros_combo += 1
        return board_rep

    to_rep.__doc__ = from_rep.__doc__