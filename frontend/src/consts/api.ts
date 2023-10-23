const isProd = import.meta.env.MODE == "production"
export const API_URL = isProd ? "https://shket.space/gogame/api" : "http://localhost:8000"
export const WS_API_URL = isProd ? "wss://shket.space/gogame/api/ws" : "ws://localhost:8000"

export const DEFAULT_PAGE_SIZE = 18