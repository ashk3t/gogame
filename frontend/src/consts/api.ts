const API_PATH_PREFIX = import.meta.env.MODE == "production" ? "/gogame/api" : ""
export const API_URL = "http://localhost:8000" + API_PATH_PREFIX
export const WS_API_URL = "ws://localhost:8000" + API_PATH_PREFIX

export const DEFAULT_PAGE_SIZE = 18