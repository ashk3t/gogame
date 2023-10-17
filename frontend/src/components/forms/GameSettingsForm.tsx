import {useActions, useAppSelector} from "../../redux/hooks"
import {capitalize} from "lodash"
import styles from "../../styles/forms/GameSettingsForm.module.css"
import {GameMode} from "../../types/game"
import IntegerInput from "../inputs/IntegerInput"
import Space from "../Space"
import NiceCheckbox from "../inputs/NiceCheckbox"
import NiceSelect from "../inputs/NiceSelect"
import VCenteringContainer from "../containers/VCenteringContainer"
import CenteringContainer from "../containers/CenteringContainer"

export default function GameSettingsForm() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const {setGameSettings} = useActions()

  function setSettingsNew(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked
    setGameSettings({...settings, new: checked, offline: !checked && settings.offline})
  }

  function setSettingsOffline(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked
    setGameSettings({...settings, offline: checked, new: !checked && settings.new})
  }

  return (
    <VCenteringContainer>
      <CenteringContainer>
        <h3>Custom game</h3>
        <NiceCheckbox
          checked={settings.custom}
          onChange={(event) => setGameSettings({...settings, custom: event.target.checked})}
        />
      </CenteringContainer>
      {settings.custom && (
        <div className={styles.settingsContainer}>
          <div>
            <h6>Height:</h6>
            <IntegerInput
              value={settings.height}
              setValue={(value: number) => setGameSettings({...settings, height: value})}
              limits={{min: 5, max: 25}}
            />
          </div>
          <div>
            <h6>Mode:</h6>
            <NiceSelect
              value={settings.mode}
              onChange={(event) =>
                setGameSettings({...settings, mode: event.target.value as GameMode})
              }
              options={GameMode}
            />
          </div>
          <div>
            <h6>Width:</h6>
            <IntegerInput
              value={settings.width}
              setValue={(value: number) => setGameSettings({...settings, width: value})}
              limits={{min: 5, max: 25}}
            />
          </div>
          <div>
            <h6>New:</h6>
            <NiceCheckbox checked={settings.new} onChange={setSettingsNew} />
          </div>
          <div>
            <h6>Players:</h6>
            <IntegerInput
              value={settings.players}
              setValue={(value: number) => setGameSettings({...settings, players: value})}
              limits={{min: 2, max: 6}}
            />
          </div>
          <div>
            <h6>Offline:</h6>
            <NiceCheckbox checked={settings.offline} onChange={setSettingsOffline} />
          </div>
        </div>
      )}
    </VCenteringContainer>
  )
}