import {PayloadAction, createSlice} from "@reduxjs/toolkit"

const initialState = {
  outGameLastPath: "",
}

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setOutGamePath(state, action: PayloadAction<string>) {
      state.outGameLastPath = action.payload
    },
  },
})

export default navigationSlice.reducer