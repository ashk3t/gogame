import {useState} from "react"

export default function useUpdater(): [number, () => void] {
  const [updater, update] = useState(false)

  function triggerUpdater() {
    update(updater + 1)
  }

  return [updater, triggerUpdater]
}