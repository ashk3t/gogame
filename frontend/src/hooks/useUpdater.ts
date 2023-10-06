import {useState} from "react"

export default function useUpdater(): [number, () => void] {
  const [updater, update] = useState(0)

  function triggerUpdater() {
    update(updater + 1)
  }

  return [updater, triggerUpdater]
}