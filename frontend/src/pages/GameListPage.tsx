import {useEffect, useState} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import GameTiles from "../components/lists/GameTiles"
import NiceButton from "../components/buttons/NiceButton"
import {GameResponse, stripGameSettings} from "../types/game"
import {gameExample, searchGameExample} from "../consts/test"
import NiceCheckbox from "../components/inputs/NiceCheckbox"
import Space from "../components/Space"
import NiceInput from "../components/inputs/NiceInput"
import PageInput from "../components/inputs/PageInput"
import GameService from "../services/GameService"
import useUpdater from "../hooks/useUpdater"

export default function GameListPage() {
  const {firstLoadGames, updateLoadedGames} = useActions()

  const games = useAppSelector((state) => state.gameListReducer.games)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [nicknameFilter, setNicknameFilter] = useState("")
  const [settingsFilter, setSettingsFilter] = useState(false)
  const [skipSearch, setSkipSearch] = useState(false)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loader, loadData] = useUpdater()

  const filters = {
    nickname: nicknameFilter || undefined,
    skip_search: skipSearch || undefined,
    ...(settingsFilter ? stripGameSettings(settings) : {}),
  }

  async function updatePageCount() {
    const count = await GameService.count(filters)
    setPageCount(count)
  }

  useEffect(() => {
    firstLoadGames(page, filters)
    updatePageCount()
  }, [page, settingsFilter, skipSearch, loader])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (games.length > 0) updateLoadedGames(games.map((g) => g.id))
      else firstLoadGames(page, filters)
      updatePageCount()
    }, 5000)
    return () => clearTimeout(timer)
  }, [games])

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
            value={nicknameFilter}
            onChange={(e) => setNicknameFilter(e.target.value)}
            onBlur={loadData}
            onKeyDown={(event) => {
              if (event.key == "Enter") loadData()
            }}
          ></NiceInput>
          <Space />
          <h6>By settings:</h6>
          <NiceCheckbox
            checked={settingsFilter}
            onChange={(event) => setSettingsFilter(event.target.checked)}
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
          {page != 1 && (
            <NiceButton very={true} onClick={() => setPage(page - 1)}>
              Prev
            </NiceButton>
          )}
          <PageInput page={page} setPage={setPage} pageCount={pageCount} />
          {page != pageCount && (
            <NiceButton very={true} onClick={() => setPage(page + 1)}>
              Next
            </NiceButton>
          )}
        </CenteringContainer>
      </CenteringContainer>
    </MainContainer>
  )
}