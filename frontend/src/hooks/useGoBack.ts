import {useLocation, useNavigate} from "react-router-dom"
import {START_PATH} from "../consts/pages"

export default function useGoBack(defaultPath: string = START_PATH): () => void {
  const location = useLocation()
  const navigate = useNavigate()

  function goBack() {
    if (location.key == "default") navigate(defaultPath)
    else navigate(-1)
  }

  return goBack
}