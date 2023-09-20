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
        self.frontier_stones: dict[
            tuple[int, int], Stone
        ] = {}  # TODO: will we need it?
        self.liberties: set[tuple[int, int]] = set()

    def __str__(self):
        return "0"

    def __int__(self):
        return 0

    def add(self, x: int, y: int, point: Stone | None):
        if point:
            if point.color == self.color:
                self.member_stones[(x, y)] = point
                point.group = self
            else:
                self.frontier_stones[(x, y)] = point
        else:
            self.liberties.add((x, y))

    def update(self, points: dict[tuple[int, int], Stone | None]):
        for (x, y), point in points.items():
            self.add(x, y, point)

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
    def __init__(self, color: StoneColor | int | str, group: Group = Group.UNGROUPED):
        self.color: StoneColor = (
            color
            if isinstance(color, StoneColor)
            else (
                StoneColor(color) if isinstance(color, int) else StoneColor(int(color))
            )
        )
        self.group = group

    def __str__(self):
        return str(self.color.value)

    def __int__(self):
        return int(self.color.value)


class GameBoard:
    all_groups: list[Group] = []

    def __init__(self, x_size: int = 19, y_size: int = 19):
        self.x_size = x_size
        self.y_size = y_size
        self.stones: list[list[Stone | None]] = [
            [None for _ in range(y_size)] for _ in range(x_size)
        ]
        self.turn_counter = 0
        self.SIDES = [StoneColor.WHITE, StoneColor.BLACK]
        self.__prev_turn: list[tuple[int, int]] = [(-1, -1)] * 2

    def __str__(self):
        return "\n".join(
            ["".join([str(p) if p else "0" for p in col]) for col in self.stones]
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
        return self.SIDES[self.turn_counter % len(self.SIDES)]

    @property
    def prev_turn(self) -> tuple[int, int]:
        return self.__prev_turn[self.turn_counter % len(self.SIDES)]

    @prev_turn.setter
    def prev_turn(self, position: tuple[int, int]):
        self.__prev_turn[self.turn_counter % len(self.SIDES)] = position

    def is_valid(self, x: int, y: int) -> bool:
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
        for group in self.all_groups:
            group.member_stones.clear()
            group.frontier_stones.clear()
            group.liberties.clear()
        self.all_groups.clear()

    def estimate_groups(self):
        self.clear_groups()
        for x, column in enumerate(self.stones):
            for y, stone in enumerate(column):
                if stone and stone.group is Group.UNGROUPED:
                    current_group = self.create_group(stone.color)
                    current_group.add(x, y, stone)
                    new_member_positions = {(x, y)}

                    while new_member_positions:
                        next_member_position = new_member_positions.pop()
                        adjacent = self.get_adjacent(*next_member_position)
                        new_member_positions.update(
                            (x, y)
                            for (x, y), point in adjacent.items()
                            if point
                            and point.color == current_group.color
                            and (x, y) not in current_group.member_stones
                        )
                        current_group.update(adjacent)

    def kill(self, group: Group):
        for x, y in group.member_stones.keys():
            self.stones[x][y] = None

        # Loose frontier groups
        for frontier_group in {stone.group for stone in group.frontier_stones.values()}:
            for memb_x, memb_y in group.member_stones.keys():
                frontier_group.free(memb_x, memb_y)

        self.delete_group(group)

    def take_turn(self, x: int, y: int):
        if not self.is_valid(x, y):
            raise InvalidTurnException("Invalid (X, Y)")
        if self.stones[x][y]:
            raise InvalidTurnException("Specified point is already occupied")
        if self.prev_turn == (x, y):
            raise InvalidTurnException("Ko rule")

        stone = Stone(self.turn_color)
        self.stones[x][y] = stone

        # Get info about adjacent points
        ally_groups: set[Group] = set()
        opponent_groups: set[Group] = set()
        liberties: set[tuple[int, int]] = set()
        for (adj_x, adj_y), point in self.get_adjacent(x, y).items():
            if point:
                if point.color == stone.color:
                    ally_groups.add(point.group)
                else:
                    opponent_groups.add(point.group)
            else:
                liberties.add((adj_x, adj_y))

        # Check suicide
        if all(len(group.liberties) != 1 for group in opponent_groups) and any(
            len(group.liberties) == 1 for group in ally_groups
        ):
            raise InvalidTurnException("Suicide")

        # Merge Ally groups
        if ally_groups:
            main_ally_group = ally_groups.pop()
            for ally_group in ally_groups:
                self.merge_groups(main_ally_group, ally_group)

            # Update ally liberties
            main_ally_group.liberties.update(liberties)
            main_ally_group.liberties.remove((x, y))
            main_ally_group.member_stones[(x, y)] = stone
            stone.group = main_ally_group

        # Update opponent liberties
        for opponent_group in opponent_groups:
            if opponent_group.liberties == 1:
                self.kill(opponent_group)
            else:
                opponent_group.liberties.remove((x, y))
                opponent_group.frontier_stones[(x, y)] = stone

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
        left_par_i: int | None = None
        for i, char in enumerate(board_rep):
            if char == "(":
                left_par_i = i
            elif left_par_i is None:
                if char != "0":
                    board.stones[pos // y_size][pos % y_size] = Stone(char)
                pos += 1
            elif char == ")":
                pos += int(board_rep[(left_par_i + 1) : i])
                left_par_i = None

        board.estimate_groups()
        return board

    def to_rep(self) -> str:
        rep = ""
        zeros_combo = 0
        for column in self.stones:
            for stone in column:
                if stone:
                    rep += (
                        f"({zeros_combo})" if zeros_combo > 3 else ("0" * zeros_combo)
                    ) + str(stone)
                    zeros_combo = 0
                else:
                    zeros_combo += 1
        return f"{self.x_size};{self.y_size};" + rep

    to_rep.__doc__ = from_rep.__doc__


# TODO: fix orientation
b = GameBoard.from_rep("3;3;")
b.take_turn(1, 2)
print(b.to_rep())
print(b)