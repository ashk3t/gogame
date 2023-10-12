import {useActions, useAppSelector} from "../../redux/hooks"
import {capitalize} from "lodash"
import styles from "../../styles/base.module.css"
import {GameMode} from "../../types/game"
import IntegerInput from "../inputs/IntegerInput"

export default function GameSettingsForm() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const {updateGameSettings} = useActions()

  return (
    <div className={styles.vcenteringContainer}>
      <div className={styles.centeringContainer}>
        <h3>Custom game</h3>
        <input
          type="checkbox"
          checked={settings.custom}
          onChange={(event) => {
            updateGameSettings({...settings, custom: event.target.checked})
          }}
          className={styles.niceCheckbox}
        />
      </div>
      {settings.custom && (
        <>
          <div className={styles.centeringContainer}>
            <h6>Height:</h6>
            <IntegerInput
              value={settings.height}
              setValue={(value: number) => updateGameSettings({...settings, height: value})}
              limits={{min: 5, max: 25}}
            />
            <h6>Width:</h6>
            <IntegerInput
              value={settings.width}
              setValue={(value: number) => updateGameSettings({...settings, width: value})}
              limits={{min: 5, max: 25}}
            />
          </div>
          <div className={styles.centeringContainer}>
            <h6>Players:</h6>
            <IntegerInput
              value={settings.players}
              setValue={(value: number) => updateGameSettings({...settings, players: value})}
              limits={{min: 2, max: 6}}
            />
            <h6>Mode:</h6>
            <select
              value={settings.mode}
              onChange={(event) =>
                updateGameSettings({...settings, mode: event.target.value as GameMode})
              }
              className={styles.niceSelect}
            >
              {Object.values(GameMode).map((value) => (
                <option key={value} value={value}>
                  {capitalize(value)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.centeringContainer}>
            <h6>Offline:</h6>
            <input
              type="checkbox"
              checked={settings.offline}
              onChange={(event) => {
                updateGameSettings({...settings, offline: event.target.checked})
              }}
              className={styles.niceCheckbox}
            />
          </div>
        </>
      )}
    </div>
  )
}