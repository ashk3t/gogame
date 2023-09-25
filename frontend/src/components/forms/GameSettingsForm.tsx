import {useActions, useAppSelector} from "../../hooks/redux"
import styles from "../../styles/base.module.css"
import {GameMode} from "../../types/game"
import IntegerInput from "../inputs/IntegerInput"

export default function GameSettingsForm() {
  const settings = useAppSelector((state) => state.gameReducer.gameSettings)
  const {updateGameSettings} = useActions()

  console.log(settings)

  return (
    <div className={styles.vcenteringContainer}>
      <br />
      <h3>Game settings</h3>
      <div className={styles.centeringContainer}>
        <h5>Width:</h5>
        <IntegerInput
          value={settings.xSize}
          setValue={(value: number) => updateGameSettings({...settings, xSize: value})}
          limits={{min: 5, max: 25}}
        />
        <h5>Height:</h5>
        <IntegerInput
          value={settings.ySize}
          setValue={(value: number) => updateGameSettings({...settings, ySize: value})}
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
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className={styles.centeringContainer}>
        <h5>Offline:</h5>
        {/* TODO: https://frontips.ru/css-stili-dlya-checkbox/ */}
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