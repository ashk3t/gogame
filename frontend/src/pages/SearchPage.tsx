import {useAppSelector} from "../redux/hooks"
import {defaultGameSettings} from "../types/game"
import PlayerList from "../components/lists/PlayerList"
import {useEffect} from "react"
import {ContainerMargins} from "../types/component"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import useGoBack from "../hooks/useGoBack"
import {useNavigate} from "react-router-dom"
import {GAME_PATH} from "../consts/pages"
import ScaryButton from "../components/buttons/ScaryButton"
import GameService from "../services/GameService"

export default function SearchPage() {
  const goBack = useGoBack()
  const navigate = useNavigate()
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const rep = useAppSelector((state) => state.gameReducer.rep)

  useEffect(() => {
    if (rep || connectedPlayers.length == 0 || !GameService.connection) goBack()
  }, [])

  useEffect(() => {
    if (rep) navigate(GAME_PATH)
  }, [rep])

  return (
    <MainContainer vertical={true} margin={ContainerMargins.EVERYTHING}>
      <h1>Search...</h1>
      <CenteringContainer vertical={true} frame={true}>
        <h3>
          {connectedPlayers.length}/
          {settings.custom ? settings.players : defaultGameSettings.players}
        </h3>
        <PlayerList players={connectedPlayers} big={true} />
      </CenteringContainer>
      <ScaryButton onClick={goBack}>Cancel</ScaryButton>
    </MainContainer>
  )
}