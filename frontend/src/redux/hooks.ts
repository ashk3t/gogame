import {TypedUseSelectorHook, useDispatch} from "react-redux"
import {AppDispatch, RootState} from "../redux/store"
import {useSelector} from "react-redux"
import {bindActionCreators} from "redux"
import actionCreators from "./actions"

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useActions = () => {
  const dispatch = useAppDispatch()
  return bindActionCreators(actionCreators, dispatch)
}