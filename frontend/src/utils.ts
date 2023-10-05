import {capitalize} from "lodash"
import {nicknameLabels} from "./consts/utils"

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
  xSize: number
  ySize: number

  constructor(xSize: number, ySize: number) {
    this.xSize = xSize
    this.ySize = ySize
  }

  getBackground(x: number, y: number) {
    const fg = "var(--text)"
    const bg = "var(--base)"
    const w = 3
    let hColors = `${fg}, ${fg}`
    let vColors = `${fg}, ${fg}`

    if (x == 0) {
      hColors = `${bg} ${50 - w}%, ${fg} ${50 - w}%`
    } else if (x + 1 == this.xSize) {
      hColors = `${fg} ${50 + w}%, ${bg} ${50 + w}%`
    }
    if (y == 0) {
      vColors = `${bg} ${50 - w}%, ${fg} ${50 - w}%`
    } else if (y + 1 == this.ySize) {
      vColors = `${fg} ${50 + w}%, ${bg} ${50 + w}%`
    }

    return {
      background: `
        linear-gradient(to bottom, ${vColors}) no-repeat center/${2 * w}% 100%,
        linear-gradient(to right,  ${hColors}) no-repeat center/100% ${2 * w}%
      `,
    }
  }
}