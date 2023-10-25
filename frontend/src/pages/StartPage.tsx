import PlayerForm from "../components/forms/PlayerForm"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import StartButtonBox from "../components/buttons/StartButtonBox"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import {useAppSelector} from "../redux/hooks"
import {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {GAME_PATH, SEARCH_PATH} from "../consts/pages"

export default function StartPage() {
  const navigate = useNavigate()
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const rep = useAppSelector((state) => state.gameReducer.rep)

  useEffect(() => {
    if (connectedPlayers.length > 0) navigate(SEARCH_PATH)
    if (rep) navigate(GAME_PATH)
  }, [connectedPlayers, rep])

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