import {round, countBy, zip, range} from "lodash"

export function joinIJ(i: number, j: number): string {
  return `${i} ${j}`
}

export function splitIJ(ij: string): [number, number] {
  const [i, j] = ij.split(" ").map((xory) => Number(xory))
  return [i, j]
}

export class InvalidTurnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidTurnError"
  }
}

export enum StoneColor {
  // Absence of stone marked as `None` object, NOT a `Stone` with `color == StoneColor.NONE`
  NONE = -1,
  RED = 0,
  YELLOW = 1,
  GREEN = 2,
  CYAN = 3,
  PEACH = 4,
  PURPLE = 5,
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

  get frontierGroups() {
    return new Set(Object.values(this.frontierStones).map((stone) => stone.group))
  }

  add(ij: string, stone: Stone | null) {
    if (stone) {
      if (stone.color == this.color) {
        this.memberStones[ij] = stone
        if (stone.group == Group.UNGROUPED) stone.group = this
      } else this.frontierStones[ij] = stone
    } else this.liberties.add(ij)
  }

  update(stones: Record<string, Stone | null>) {
    for (const [ij, stone] of Object.entries(stones)) this.add(ij, stone)
  }

  clear() {
    this.memberStones = {}
    this.frontierStones = {}
    this.liberties = new Set()
  }

  merge(group: Group) {
    this.memberStones = {...this.memberStones, ...group.memberStones}
    this.frontierStones = {...this.frontierStones, ...group.frontierStones}
    this.liberties = new Set([...this.liberties, ...group.liberties])
    for (const stone of Object.values(group.memberStones)) stone.group = this
    group.clear()
  }

  free(ij: string) {
    if (ij in this.frontierStones) {
      delete this.frontierStones[ij]
      this.liberties.add(ij)
    }
  }
}

export class Stone {
  color: StoneColor
  group: Group

  constructor(color: StoneColor, group: Group = Group.UNGROUPED) {
    this.color = color
    this.group = group
  }

  static fromString(char: string): Stone {
    return new Stone((parseInt(char) - 1) as StoneColor)
  }

  toString() {
    return (this.color + 1).toString()
  }

  toInt() {
    return Number(this.color)
  }
}

export class GameBoard {
  height: number
  width: number
  players: number
  stones: Array<Array<Stone | null>>
  allGroups: Group[]
  turnColor: StoneColor
  _scoreAdjustment: number[]
  scores: number[]
  passCounter: number
  koPosition: string
  finishedPlayers: Set<StoneColor>
  killer: StoneColor | null
  occupationColors: Array<Array<StoneColor>>

  constructor(height: number = 19, width: number = 19, players: number = 2) {
    this.height = height
    this.width = width
    this.players = players
    this.stones = Array.from(Array(height), () => new Array(width).fill(null))
    this.allGroups = []
    this.turnColor = StoneColor.RED
    this._scoreAdjustment = new Array(players).fill(0).map((_, i) => round(i * (8.1 - players), 1))
    this.scores = [...this._scoreAdjustment]
    this.passCounter = 0
    this.koPosition = ""
    this.finishedPlayers = new Set()
    this.killer = null
    this.occupationColors = Array.from(Array(height), () => new Array(width).fill(StoneColor.NONE))
  }

  toString() {
    return this.stones
      .map((row) => row.map((stone) => stone?.toString() ?? "0").join(""))
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
    this.allGroups = this.allGroups.filter((el) => el != secondGroup)
  }

  updateTurnColor() {
    if (this.finishedPlayers.size >= this.players) {
      this.turnColor = StoneColor.NONE
      return
    }
    this.turnColor = (this.turnColor + 1) % this.players
    while (this.finishedPlayers.has(this.turnColor))
      this.turnColor = (this.turnColor + 1) % this.players
  }

  estimateOccupationColor(i: number, j: number): StoneColor {
    const R = 3.5
    const stoneColorScores = new Array(this.players).fill(0.0)

    for (const di of range(-3, 4))
      for (const dj of range(-3, 4))
        if (this.isValid(i + di, j + dj)) {
          const stone = this.stones[i + di][j + dj]
          if (stone) {
            const weight = Math.max(R - Math.hypot(di, dj), 0)
            stoneColorScores[stone.color] += weight
          }
        }

    const maxScore = Math.max(...stoneColorScores)
    if (countBy(stoneColorScores)[maxScore] == 1) return stoneColorScores.indexOf(maxScore)
    return StoneColor.NONE
  }

  updateScores() {
    this.scores = [...this._scoreAdjustment]
    for (let i = 0; i < this.height; i++)
      for (let j = 0; j < this.width; j++) {
        const color = this.estimateOccupationColor(i, j)
        if (color != StoneColor.NONE) {
          this.scores[color]++
          this.occupationColors[i][j] = color
        }
      }
  }

  isValid(i: number, j: number) {
    return 0 <= i && i < this.height && 0 <= j && j < this.width
  }

  getAdjacent(i: number, j: number): Record<string, Stone | null> {
    const adjacent: Record<string, Stone | null> = {}
    for (const [di, dj] of [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ])
      if (this.isValid(i + di, j + dj))
        adjacent[joinIJ(i + di, j + dj)] = this.stones[i + di][j + dj]
    return adjacent
  }

  clearGroups() {
    for (const column of this.stones)
      for (const stone of column) if (stone) stone.group = Group.UNGROUPED
    this.allGroups = []
  }

  estimateGroups() {
    this.clearGroups()
    for (const [i, row] of this.stones.entries())
      for (const [j, stone] of row.entries())
        if (stone && stone.group == Group.UNGROUPED) {
          const ij = joinIJ(i, j)
          const group = this.createGroup(stone.color)
          group.add(ij, stone)
          let newMemberPositions = new Set([ij])

          while (newMemberPositions.size > 0) {
            const [nextMemberPosition] = newMemberPositions
            newMemberPositions.delete(nextMemberPosition)
            const adjacent = this.getAdjacent(...splitIJ(nextMemberPosition))
            newMemberPositions = new Set([
              ...newMemberPositions,
              ...Object.entries(adjacent).flatMap(([ij, stone]) =>
                stone && stone.color == group.color && !(ij in group.memberStones) ? [ij] : [],
              ),
            ])
            group.update(adjacent)
          }
        }
  }

  kill(group: Group) {
    for (const ij of Object.keys(group.memberStones)) {
      const [i, j] = splitIJ(ij)
      this.stones[i][j] = null
    }

    // Loose frontier groups
    for (const frontierGroup of group.frontierGroups)
      for (const memberIJ of Object.keys(group.memberStones)) frontierGroup.free(memberIJ)

    if (Object.keys(group.memberStones).length == 1)
      this.koPosition = Object.keys(group.memberStones)[0]
    this.deleteGroup(group)
  }

  takeTurn(i: number, j: number) {
    const ij = joinIJ(i, j)
    if (!this.isValid(i, j)) throw new InvalidTurnError("Invalid (X, Y)")
    if (this.stones[i][j]) throw new InvalidTurnError("Position is already occupied")
    if (this.koPosition == joinIJ(i, j)) throw new InvalidTurnError("Ko rule")

    const stone = new Stone(this.turnColor)
    this.stones[i][j] = stone

    const group = this.createGroup(stone.color)
    group.update(this.getAdjacent(i, j))
    const allyGroups = new Set(Object.values(group.memberStones).map((s) => s.group))
    const opponentGroups = group.frontierGroups
    group.add(ij, stone)

    // Check suicide
    if (
      Array.from(opponentGroups).every((g: Group) => g.liberties.size > 1) &&
      Array.from(allyGroups).every((g: Group) => g.liberties.size == 1) &&
      group.liberties.size == 0
    ) {
      this.stones[i][j] = null
      this.deleteGroup(group)
      throw new InvalidTurnError("Suicide")
    }

    // Merge ally groups
    for (const allyGroup of allyGroups) this.mergeGroups(group, allyGroup)
    if (allyGroups.size > 0) group.liberties.delete(ij)

    // Reset ko position
    this.koPosition = ""

    // Update opponent liberties
    for (const opponentGroup of opponentGroups) {
      opponentGroup.liberties.delete(ij)
      opponentGroup.frontierStones[ij] = stone
      if (opponentGroup.liberties.size == 0) {
        this.kill(opponentGroup)
        this.killer = stone.color
      }
    }

    this.passCounter = 0
    this.updateScores()
    this.updateTurnColor()
  }

  passTurn() {
    this.passCounter++
    this.updateTurnColor()
  }

  finishTurnsTurn(color: StoneColor | null = null) {
    if (color == StoneColor.NONE) return

    if (color == null || color == this.turnColor) {
      this.finishedPlayers.add(this.turnColor)
      this.updateTurnColor()
    } else {
      for (let i = 1; i <= this.passCounter; i++) {
        // Pass + Finish != accident win
        if ((this.turnColor - i) % this.players == color) {
          this.passCounter--
          break
        }
      }
      this.finishedPlayers.add(color)
    }
  }

  static fromRep(rep: string): GameBoard {
    const repSplit = rep.split(";")
    const [koPosition, finishedPlayers, boardRep] = repSplit.splice(-3)
    const [height, width, players, turnColor, passCounter] = repSplit.map((v) => parseInt(v))
    const board = new GameBoard(height, width, players)
    board.turnColor = turnColor - 1
    board.passCounter = passCounter
    board.koPosition = koPosition.replace(",", " ")
    board.finishedPlayers = new Set(finishedPlayers.split("").map((v) => parseInt(v) - 1))

    let pos = 0
    let leftParenthesisIdx: number | null = null
    for (let idx = 0; idx < boardRep.length; idx++) {
      const char = boardRep[idx]
      if (char == "(") {
        leftParenthesisIdx = idx
      } else if (leftParenthesisIdx == null) {
        if (char != "0") {
          const stone = Stone.fromString(char)
          board.stones[Math.floor(pos / width)][pos % width] = stone
        }
        pos++
      } else if (char == ")") {
        pos += parseInt(boardRep.substring(leftParenthesisIdx + 1, idx))
        leftParenthesisIdx = null
      }
    }

    board.estimateGroups()
    board.updateScores()
    return board
  }

  toRep(): string {
    return [
      this.height,
      this.width,
      this.players,
      this.turnColor + 1,
      this.passCounter,
      this.koPosition.replace(" ", ","),
      Array.from(this.finishedPlayers)
        .map((v) => v + 1)
        .join(""),
      this.toBoardRep(),
    ].join(";")
  }

  toBoardRep(): string {
    let boardRep = ""
    let zerosCombo = 0
    for (const row of this.stones)
      for (const stone of row) {
        if (stone) {
          boardRep +=
            (zerosCombo > 3 ? `(${zerosCombo})` : "0".repeat(zerosCombo)) + stone.toString()
          zerosCombo = 0
        } else zerosCombo++
      }
    return boardRep
  }
}