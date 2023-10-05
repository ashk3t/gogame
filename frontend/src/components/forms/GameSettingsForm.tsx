import {useActions, useAppSelector} from "../../hooks/redux"
import {capitalize} from "lodash"
import styles from "../../styles/base.module.css"
import {GameMode} from "../../types/game"
import IntegerInput from "../inputs/IntegerInput"

export default function GameSettingsForm() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const {updateGameSettings} = useActions()

  return (
    <div className={styles.vcenteringContainer}>
      <br />
      <h3>Game settings</h3>
      <div className={styles.centeringContainer}>
        <h5>Height:</h5>
        <IntegerInput
          value={settings.height}
          setValue={(value: number) => updateGameSettings({...settings, height: value})}
          limits={{min: 5, max: 25}}
        />
        <h5>Width:</h5>
        <IntegerInput
          value={settings.width}
          setValue={(value: number) => updateGameSettings({...settings, width: value})}
          limits={{min: 5, max: 25}}
        />
      </div>
      <div className={styles.centeringContainer}>
        <h5>Players:</h5>
        <IntegerInput
          value={settings.players}
          setValue={(value: number) => updateGameSettings({...settings, players: value})}
          limits={{min: 2, max: 6}}
        />
        <h5>Mode:</h5>
        <select
          value={settings.mode}
          onChange={(event) =>
            updateGameSettings({...settings, mode: event.target.value as GameMode})
          }
          className={styles.niceSelect}
        >
          {Object.values(GameMode).map((value) => (
            <option key={value} value={value}>{capitalize(value)}</option>
          ))}
        </select>
      </div>
      <div className={styles.centeringContainer}>
        <h5>Offline:</h5>
        <input
          type="checkbox"
          checked={settings.offline}
          onChange={(event) => {
            updateGameSettings({...settings, offline: event.target.checked})
          }}
          className={styles.niceCheckbox}
        />
      </div>
    </div>
  )
}