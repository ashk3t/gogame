export interface RequestState {
  isLoading: boolean
  errorMessage: string | null
  completedLabel: string | null
}

export enum RequestActionTypes {
  SET_STATUS = "SET_REQUEST_STATUS",
  CLEAR = "CLEAR_REQUEST",
}