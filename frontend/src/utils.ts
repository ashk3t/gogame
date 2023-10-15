import {capitalize} from "lodash"
import {nicknameLabels} from "./consts/utils"
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

  getBackground(i: number, j: number) {
    const fg = "var(--text)"
    const bg = "var(--base)"
    const w = 3

    const vColors =
      i == 0
        ? `${bg} ${50 - w}%, ${fg} ${50 - w}%`
        : i + 1 == this.height
        ? `${fg} ${50 + w}%, ${bg} ${50 + w}%`
        : `${fg}, ${fg}`

    const hColors =
      j == 0
        ? `${bg} ${50 - w}%, ${fg} ${50 - w}%`
        : j + 1 == this.width
        ? `${fg} ${50 + w}%, ${bg} ${50 + w}%`
        : `${fg}, ${fg}`

    return {
      background: `
        linear-gradient(to bottom, ${vColors}) no-repeat center/${2 * w}% 100%,
        linear-gradient(to right,  ${hColors}) no-repeat center/100% ${2 * w}%
      `,
    }
  }
}

export function turnColor(gameRep: string): StoneColor {
    return parseInt(gameRep.split(";")[3]) - 1
}