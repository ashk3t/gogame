function joinXY(x: number, y: number): string {
  return `${x} ${y}`
}

function splitXY(dot: string): [number, number] {
  const [x, y] = dot.split(" ").map((xory) => Number(xory))
  return [x, y]
}

class InvalidTurnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidTurnError"
  }
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

  get memberGroups() {
    return new Set(Object.values(this.memberStones).map((stone) => stone.group))
  }

  get frontierGroups() {
    return new Set(Object.values(this.frontierStones).map((stone) => stone.group))
  }

  add(xy: string, stone: Stone | null) {
    if (stone) {
      if (stone.color == this.color) {
        this.memberStones[xy]
        stone.group = this
      } else this.frontierStones[xy]
    } else this.liberties.add(xy)
  }

  update(stones: Record<string, Stone | null>) {
    for (const [xy, stone] of Object.entries(stones)) this.add(xy, stone)
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
    for (const stone of Object.values(group.memberStones)) stone.group = this
  }

  free(xy: string) {
    if (xy in this.frontierStones) {
      delete this.frontierStones[xy]
      this.liberties.add(xy)
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
  #prevTurn: Array<string>

  constructor(xSize: number = 19, ySize: number = 19) {
    this.sides = [StoneColor.WHITE, StoneColor.BLACK]
    this.xSize = xSize
    this.ySize = ySize
    this.stones = Array.from(Array(xSize), () => new Array(ySize).fill(0))
    this.allGroups = []
    this.turnCounter = 0
    this.#prevTurn = ["", ""]
  }

  toString() {
    return this.stones
      .map((column) => column.map((stone) => stone?.toString ?? "0").join(""))
      .join("\n")
  }

  createGroup(color: StoneColor): Group {
    const group = new Group(color)
    this.allGroups.push(group)
    return group
  }

  deleteGroup(group: Group) {
    group.clear()
    this.allGroups = this.allGroups.filter((el) => el != group)
  }

  mergeGroups(firstGroup: Group, secondGroup: Group) {
    firstGroup.merge(secondGroup)
    this.deleteGroup(secondGroup)
  }

  get turnColor(): StoneColor {
    return this.sides[this.turnCounter % this.sides.length]
  }

  get prevTurn(): string {
    return this.#prevTurn[this.turnCounter % this.sides.length]
  }

  set prevTurn(xy: string) {
    this.#prevTurn[this.turnCounter % this.sides.length] = xy
  }

  isValid(x: number, y: number) {
    return 0 <= x && x < this.xSize && 0 <= y && y < this.ySize
  }

  getAdjacent(x: number, y: number): Record<string, Stone | null> {
    const adjacent: Record<string, Stone | null> = {}
    for (const [dx, dy] of [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ])
      if (this.isValid(x + dx, y + dy))
        adjacent[joinXY(x + dx, y + dy)] = this.stones[x + dx][y + dy]
    return adjacent
  }

  clearGroups() {
    for (const column of this.stones)
      for (const stone of column) if (stone) stone.group = Group.UNGROUPED
    this.allGroups = []
  }

  estimateGroups() {
    this.clearGroups()
    for (const [x, column] of this.stones.entries())
      for (const [y, stone] of column.entries())
        if (stone && stone.group == Group.UNGROUPED) {
          const xy = joinXY(x, y)
          const group = this.createGroup(stone.color)
          group.add(xy, stone)
          let newMemberPositions = new Set(xy)

          while (newMemberPositions) {
            const [nextMemberPosition] = newMemberPositions
            newMemberPositions.delete(nextMemberPosition)
            const adjacent = this.getAdjacent(...splitXY(nextMemberPosition))
            newMemberPositions = new Set(
              ...newMemberPositions,
              Object.entries(adjacent).flatMap(([xy, stone]) =>
                stone && stone.color == group.color && !(xy in group.memberStones) ? [xy] : [],
              ),
            )
            group.update(adjacent)
          }
        }
  }

  kill(group: Group) {
    for (const xy of Object.keys(group.memberStones)) {
      const [x, y] = splitXY(xy)
      this.stones[x][y] = null
    }

    // Loose frontier groups
    for (const frontierGroup of group.frontierGroups)
      for (const memberXY of Object.keys(group.memberStones)) frontierGroup.free(memberXY)

    this.deleteGroup(group)
  }

  takeTurn(x: number, y: number) {
    const xy = joinXY(x, y)
    if (!this.isValid(x, y)) throw new InvalidTurnError("Invalid (X, Y)")
    if (this.stones[x][y]) throw new InvalidTurnError("Point is already occupied")
    if (this.prevTurn == xy) throw new InvalidTurnError("Ko rule")

    const stone = new Stone(this.turnColor)
    this.stones[x][y] = stone

    const group = this.createGroup(stone.color)
    group.update(this.getAdjacent(x, y))
    const allyGroups = group.memberGroups
    const opponentGroups = group.frontierGroups
    group.add(xy, stone)

    // Check suicide
    if (
      Object.values(opponentGroups).every((g: Group) => g.liberties.size > 1) &&
      group.liberties.size == 0
    )
      throw new InvalidTurnError("Suicide")

    // Merge ally groups
    for (const allyGroup of allyGroups) this.mergeGroups(group, allyGroup)
    if (allyGroups.size > 0) group.liberties.delete(xy)

    // Update opponent liberties
    for (const opponentGroup of opponentGroups) {
      opponentGroup.liberties.delete(xy)
      opponentGroup.frontierStones[xy] = stone
      if (opponentGroup.liberties.size == 0) this.kill(opponentGroup)
    }

    this.prevTurn = xy
    this.turnCounter++
  }

  static fromRep(rep: string): GameBoard {
    const repSplit = rep.split(";")
    const xSize = parseInt(repSplit[0])
    const ySize = parseInt(repSplit[1])
    const boardRep = repSplit[2]
    const board = new GameBoard(xSize, ySize)

    let pos = 0
    let leftParenthesisIdx: number | null = null
    for (let i = 0; i < boardRep.length; i++) {
      const char = boardRep[i]
      if (char == "(") {
        leftParenthesisIdx = i
      } else if (leftParenthesisIdx == null) {
        if (char != "0") {
          board.stones[pos % xSize][Math.floor(pos / xSize)] = new Stone(
            parseInt(char) as StoneColor,
          )
        }
        pos++
      } else if (char == ")") {
        pos += parseInt(boardRep.substring(leftParenthesisIdx + 1, i))
        leftParenthesisIdx = null
      }
    }

    board.estimateGroups()
    return board
  }

  toRep(): string {
    let rep = ""
    let zerosCombo = 0
    for (let y = 0; y < this.ySize; y++)
      for (let x = 0; x < this.xSize; x++) {
        const stone = this.stones[x][y]
        if (stone) {
          rep += (zerosCombo > 3 ? `(${zerosCombo})` : "0".repeat(zerosCombo)) + stone.toString()
          zerosCombo = 0
        } else zerosCombo++
      }
    return ""
  }
}