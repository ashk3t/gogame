import {capitalize} from "lodash"
import {nicknameLabels} from "./consts"

// Utils
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
  return ['a', 'e', 'i', 'o', 'u'].indexOf(word[0].toLowerCase()) !== -1
}