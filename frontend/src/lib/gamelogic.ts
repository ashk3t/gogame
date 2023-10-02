function joinXY(x: number, y: number): string {
  return `${x} ${y}`
}

function splitXY(dot: string): [number, number] {
  const [x, y] = dot.split(" ").map((xory) => Number(xory))
  return [x, y]
}

enum StoneColor {
  NONE = 0,
  WHITE = 1,
  BLACK = 2,
}

class Group {
  static UNGROUPED: Group = new Group(StoneColor.NONE)

  color: StoneColor
  memberStones: Record<string, Stone> = {}
  frontierStones: Record<string, Stone> = {}
  liberties: Set<string> = new Set()

  constructor(color: StoneColor) {
    this.color = color
  }

  add(coordinates: string, point: Stone | null) {
    if (point) {
      if (point.color == this.color) {
        this.memberStones[coordinates]
        point.group = this
      } else {
        this.frontierStones[coordinates]
      }
    } else {
      this.liberties.add(coordinates)
    }
  }

  update(points: Record<string, Stone | null>) {
    for (const [coordinates, point] of Object.entries(points)) {
      this.add(coordinates, point)
    }
  }

  clear() {
    this.memberStones = {}
    this.frontierStones = {}
    this.liberties = new Set()
  }

  merge(group: Group) {
    this.memberStones = {...this.memberStones, ...group.memberStones}
    this.frontierStones = {...this.frontierStones, ...group.frontierStones}
    this.liberties = new Set(...this.liberties, ...group.liberties)
    for (const stone of Object.values(group.memberStones)) {
      stone.group = this
    }
  }

  free(coordinates: string, y: number) {
    if (coordinates in this.frontierStones) {
      delete this.frontierStones[coordinates]
      this.liberties.add(coordinates)
    }
  }
}

class Stone {
  color: StoneColor
  group: Group

  constructor(color: StoneColor, group: Group = Group.UNGROUPED) {
    this.color = color
    this.group = group
  }

  toString() {
    return this.color.toString()
  }

  toInt() {
    return Number(this.color)
  }
}

class GameBoard {
  sides: Array<StoneColor>
  xSize: number
  ySize: number
  stones: Array<Array<Stone | null>>
  allGroups: Array<Group>
  turnCounter: number
  #prevTurn: Array<[number, number]>

  constructor(xSize: number = 19, ySize: number = 19) {
    this.sides = [StoneColor.WHITE, StoneColor.BLACK]
    this.xSize = xSize
    this.ySize = ySize
    this.stones = Array.from(Array(xSize), () => new Array(ySize).fill(0))
    this.allGroups = []
    this.turnCounter = 0
    this.#prevTurn = [[-1, -1], [-1, -1]]
  }

  toString() {
    return this.stones.map(
      column => column.map(
        stone => stone?.toString ?? "0"
      ).join("")
    ).join("\n")
  }

  createGroup(color: StoneColor): Group {
    const group = new Group(color)
    this.allGroups.push(group)
    return group
  }

  deleteGroup(group: Group) {
    group.clear()
    this.allGroups.filter(el => el != group)
  }

  mergeGroups(firstGroup: Group, secondGroup: Group) {
    firstGroup.merge(secondGroup)
    this.deleteGroup(secondGroup)
  }

  get turnColor(): StoneColor {
    return this.sides[this.turnCounter % this.sides.length]
  }

  get prevTurn(): [number, number] {
    return this.#prevTurn[this.turnCounter % this.sides.length]
  }

  set prevTurn(position: [number, number]) {
    this.#prevTurn[this.turnCounter % this.sides.length] = position
  }

  isValid(x: number, y: number) {
    return 0 <= x && x < this.xSize && 0 <= y && y < this.ySize
  }

  getAdjacent(x: number, y: number): Record<[number, number], Stone | null> {}

  clearGroups() {}

  estimateGroups() {}

  kill(group: Group) {}

  takeTurn(x: number, y: number) {}

  static fromRep(rep: string): GameBoard {}

  toRep(): string {}
}