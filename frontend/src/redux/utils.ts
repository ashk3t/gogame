import {GameSettings} from "../types/game";

// TODO: try classes instead of interface approach
export function isOffline(settings: GameSettings) {
  return settings.custom && settings.offline
}