import {useEffect, useState} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import MainContainer from "../components/containers/MainContainer"
import CenteringContainer from "../components/containers/CenteringContainer"
import GameTiles from "../components/lists/GameTiles"
import NiceButton from "../components/buttons/NiceButton"
import {stripGameSettings} from "../types/game"
import NiceCheckbox from "../components/inputs/NiceCheckbox"
import Space from "../components/Space"
import NiceInput from "../components/inputs/NiceInput"
import PageInput from "../components/inputs/PageInput"
import GameService from "../services/GameService"
import useUpdater from "../hooks/useUpdater"
import {DEFAULT_PAGE_SIZE} from "../consts/api"
import useUpdateOutGamePath from "../hooks/useUpdateOutGamePath"

export default function GameListPage() {
  useUpdateOutGamePath()
  const {firstLoadGames, updateLoadedGames} = useActions()

  const games = useAppSelector((state) => state.gameListReducer.games)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [nicknameFilter, setNicknameFilter] = useState("")
  const [settingsFilter, setSettingsFilter] = useState(false)
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loader, loadData] = useUpdater()

  const filters = {
    nickname: nicknameFilter || undefined,
    searching: searching || undefined,
    ...(settingsFilter ? stripGameSettings(settings) : {}),
  }

  async function updatePageCount() {
    const count = await GameService.count(filters)
    setPageCount(Math.ceil(count / DEFAULT_PAGE_SIZE))
  }

  useEffect(() => {
    firstLoadGames(page, filters)
    updatePageCount()
  }, [page, settingsFilter, searching, loader])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page != 1 && games.length > 0) updateLoadedGames(games.map((g) => g.id))
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
            onChange={(event) => setNicknameFilter(event.target.value)}
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
          <h6>Searching:</h6>
          <NiceCheckbox
            checked={searching}
            onChange={(event) => setSearching(event.target.checked)}
          />
        </CenteringContainer>
        <GameTiles games={games} />
        <CenteringContainer>
          {pageCount > 1 && (
            <>
              <NiceButton
                very={true}
                onClick={() => setPage(page - 1)}
                style={{visibility: page == 1 ? "hidden" : "visible"}}
              >
                Prev
              </NiceButton>
              <PageInput page={page} setPage={setPage} pageCount={pageCount} />
              <NiceButton
                very={true}
                onClick={() => setPage(page + 1)}
                style={{visibility: page == pageCount ? "hidden" : "visible"}}
              >
                Next
              </NiceButton>
            </>
          )}
        </CenteringContainer>
      </CenteringContainer>
    </MainContainer>
  )
}