import PlayerForm from "../components/forms/PlayerForm"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import StartButtonBox from "../components/buttons/StartButtonBox"
import VCenteringContainer from "../components/containers/VCenteringContainer"
import MainContainer from "../components/containers/MainContainer"

export default function StartPage() {
  return (
    <MainContainer>
      <VCenteringContainer>
        <PlayerForm />
        <StartButtonBox />
        <GameSettingsForm />
      </VCenteringContainer>
    </MainContainer>
  )
}