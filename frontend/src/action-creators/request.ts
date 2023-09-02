import {Dispatch} from "react"
import {GenericAction} from "../types/generic"
import {RequestActionTypes} from "../types/request"
import {parseError} from "../utils"
import {AppDispatch} from "../store"
import {requestSlice} from "../reducers/request"

export const makeRequest =
  (requestCallback: () => any, completedLabel: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(requestSlice.actions.setStatus({isLoading: true, completedLabel: null}))
      await dispatch(requestCallback())
      dispatch(requestSlice.actions.setStatus({isLoading: false, completedLabel}))
    } catch (error: any) {
      const errorMessage = parseError(error.response.data)
      dispatch(requestSlice.actions.setStatus({errorMessage, isLoading: false}))
    }
  }

export const setRequestError = (errorMessage: string) => {
  requestSlice.actions.setStatus({errorMessage})
}

export const clearRequest = () => {
  requestSlice.actions.clear({})
}