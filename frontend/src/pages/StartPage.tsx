import PlayerForm from "../components/forms/PlayerForm"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import StartButtonBox from "../components/buttons/StartButtonBox"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import useUpdateOutGamePath from "../hooks/useUpdateOutGamePath"

export default function StartPage() {
  useUpdateOutGamePath()

  return (
    <MainContainer>
      <CenteringContainer vertical={true}>
        <PlayerForm />
        <StartButtonBox />
        <GameSettingsForm />
      </CenteringContainer>
    </MainContainer>
  )
}