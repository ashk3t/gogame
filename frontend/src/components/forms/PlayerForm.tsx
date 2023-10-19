import {useState} from "react"
import {useActions, useAppSelector} from "../../redux/hooks"
import {getRandomNicknameLabel} from "../../utils"
import CenteringContainer from "../containers/CenteringContainer"
import NiceInput from "../inputs/NiceInput"

export default function PlayerForm() {
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)
  const {setNickname} = useActions()
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [nicknameLabel] = useState(getRandomNicknameLabel())

  if (settings.offline) return <></>

  return (
    <CenteringContainer vertical={true}>
      <h3>{nicknameLabel}'s name:</h3>
      <NiceInput value={nickname} onChange={(e) => setNickname(e.target.value)}></NiceInput>
    </CenteringContainer>
  )
}