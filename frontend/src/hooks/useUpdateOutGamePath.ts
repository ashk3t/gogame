import {useLocation} from "react-router-dom"
import {useActions} from "../redux/hooks"
import {useEffect} from "react"

export default function useUpdateOutGamePath() {
  const {setOutGamePath} = useActions()
  const location = useLocation()

  useEffect(() => {
    setOutGamePath(location.pathname)
  }, [])
}