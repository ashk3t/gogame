import {capitalize, camelCase, isArray, transform, isObject} from "lodash"
import {nicknameLabels, stoneHexColors} from "./consts/utils"
import {StoneColor} from "./lib/gamelogic"

export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.body.appendChild(script)
  })
}

export function posMod(divisible: number, divisor: number) {
  return (divisible + divisor) % divisor
}

export function parseError(error: any): string {
  if (error.detail) return error.detail

  const lines = []
  for (const [key, value] of Object.entries(error)) {
    lines.push(capitalize(key) + ": " + (value as string)[0]) // FIXME
  }
  return lines.join("\n")
}

export function getRandomNicknameLabel(): string {
  const randomIndex = Math.floor(Math.random() * nicknameLabels.length)
  return nicknameLabels[randomIndex]
}

export function startsWithVowel(word: string): boolean {
  return ["a", "e", "i", "o", "u"].indexOf(word[0].toLowerCase()) !== -1
}

export class BoardIntersectionStyler {
  height: number
  width: number

  constructor(height: number, width: number) {
    this.height = height
    this.width = width
  }

  getStyle(i: number, j: number, turnColor: StoneColor, winnerColor: StoneColor | null) {
    const fg = winnerColor == null ? "var(--text)" : stoneHexColors[winnerColor]
    const bg = "var(--base)"
    const accent = stoneHexColors[winnerColor == null ? turnColor : winnerColor]
    const w = 3 // Base inersections width (For estimating final width)
    let reversed = false // Gradient overlay order (For correct border color)
    let fvw = 2 * w // Final vertical intersection width
    let fhw = 2 * w // Final horizontal intersection width

    // Border trimming
    let vColors =
      i == 0
        ? `${bg} ${50 - w}%, ${fg} ${50 - w}%`
        : i + 1 == this.height
        ? `${fg} ${50 + w}%, ${bg} ${50 + w}%`
        : `${fg}, ${fg}`
    let hColors =
      j == 0
        ? `${bg} ${50 - w}%, ${fg} ${50 - w}%`
        : j + 1 == this.width
        ? `${fg} ${50 + w}%, ${bg} ${50 + w}%`
        : `${fg}, ${fg}`

    // Border coloring
    if (i == 0 || i + 1 == this.height) {
      hColors = hColors.replaceAll(fg, accent)
      fvw = 3 * w
      reversed = true
    }
    if (j == 0 || j + 1 == this.width) {
      vColors = vColors.replaceAll(fg, accent)
      fhw = 3 * w
    }

    const gradients = [
      `linear-gradient(to bottom, ${vColors}) no-repeat center/${fhw}% 100%`,
      `linear-gradient(to right,  ${hColors}) no-repeat center/100% ${fvw}%`,
    ]
    return {
      background: (reversed ? gradients.reverse() : gradients).join("\n,"),
    }
  }
}

export function turnColor(gameRep: string): StoneColor {
  return parseInt(gameRep.split(";")[3]) - 1
}

export function finishedPlayers(gameRep: string): Set<number> {
  return new Set(
    gameRep
      .split(";")[6]
      .split("")
      .map((v) => parseInt(v) - 1),
  )
}

export const camelize = (obj: Record<string, unknown>) =>
  transform(obj, (result: Record<string, unknown>, value: unknown, key: string, target) => {
    const camelKey = isArray(target) ? key : camelCase(key)
    result[camelKey] = isObject(value) ? camelize(value as Record<string, unknown>) : value
  })

export function utcNow() {
  return Date.now() + new Date().getTimezoneOffset() * 60 * 1000
}

export function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  return (
    (days ? days.toString() + "d " : "") +
    (hours ? hours.toString() + ":" : "") +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  )
}

export function timePassed(time: Date) {
  return msToTime(utcNow() - time.getTime())
}