import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GenericAction} from "../types/generic"
import {RequestState, RequestActionTypes} from "../types/request"

const initialState: RequestState = {
  isLoading: false,
  errorMessage: null,
  completedLabel: null,
}

// function requestReducer(state = initialState, action: GenericAction) {
//   const {errorMessage, isLoading, completedLabel} = action.payload || {}
//   switch (action.type) {
//     case RequestActionTypes.SET_STATUS:
//       if (isLoading) state["isLoading"] = isLoading
//       if (errorMessage) state["errorMessage"] = errorMessage
//       if (completedLabel) state["completedLabel"] = completedLabel
//       return {...state}
//     case RequestActionTypes.CLEAR:
//       return {...state, errorMessage: null, completedLabel: null}
//     default:
//       return state
//   }
// }

export const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<any>) {
      if (action.payload.isLoading) state.isLoading = action.payload.isLoading
      if (action.payload.errorMessage) state.errorMessage = action.payload.errorMessage
      if (action.payload.completedLabel) state.completedLabel = action.payload.completedLabel
    },
    clear(state, action: PayloadAction<any>) {
      state.errorMessage = null
      state.completedLabel = null
    },
  },
})

export default requestSlice.reducer