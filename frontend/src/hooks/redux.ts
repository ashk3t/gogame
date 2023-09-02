import {TypedUseSelectorHook, useDispatch} from "react-redux"
import {AppDispatch, RootState} from "../store"
import {useSelector} from "react-redux"
import {bindActionCreators} from "redux"
import actionCreators from "../action-creators"

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useActions = () => {
  const dispatch = useAppDispatch()
  return bindActionCreators(actionCreators, dispatch)
}