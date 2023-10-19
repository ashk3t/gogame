import {useEffect, useState} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import GameTiles from "../components/lists/GameTiles"
import NiceButton from "../components/buttons/NiceButton"
import {GameResponse} from "../types/game"
import {gameExample, searchGameExample} from "../consts/test"
import NiceCheckbox from "../components/inputs/NiceCheckbox"
import Space from "../components/Space"
import NiceInput from "../components/inputs/NiceInput"

export default function GameListPage() {
  // const games = useAppSelector((state) => state.gameListReducer.games)
  const {loadGames} = useActions()
  const [filterByNickname, setFilterByNickname] = useState("")
  const [filterBySettings, setfilterBySettings] = useState(false)
  const [skipSearch, setSkipSearch] = useState(false)

  const [games, setGames] = useState<Array<GameResponse>>([])
  useEffect(() => {
    // loadGames()
    const data = new Array(6).fill(gameExample)
    data[1] = searchGameExample
    data[2] = searchGameExample
    data[5] = searchGameExample
    setGames(data)
  }, [])

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     loadGames()
  //   }, 5000)
  //   return () => clearTimeout(timer)
  // }, [games])

  return (
    <MainContainer>
      <CenteringContainer vertical={true}>
        <CenteringContainer style={{flexWrap: "wrap"}}>
          <NavButton path={START_PATH} scary={true}>
            Back
          </NavButton>
          <Space />
          <h6>By nickname:</h6>
          <NiceInput
            value={filterByNickname}
            onChange={(e) => setFilterByNickname(e.target.value)}
          ></NiceInput>
          <Space />
          <h6>By settings:</h6>
          <NiceCheckbox
            checked={filterBySettings}
            onChange={(event) => setfilterBySettings(event.target.checked)}
          />
          <Space />
          <h6>Skip search:</h6>
          <NiceCheckbox
            checked={skipSearch}
            onChange={(event) => setSkipSearch(event.target.checked)}
          />
        </CenteringContainer>
        <GameTiles games={games} />
        <CenteringContainer>
          <NiceButton very={true}>First</NiceButton>
          <NiceButton very={true}>Prev</NiceButton>
          <h4>228/420</h4>
          <NiceButton very={true}>Next</NiceButton>
        </CenteringContainer>
      </CenteringContainer>
    </MainContainer>
  )
}