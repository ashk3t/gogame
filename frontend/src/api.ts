import axios from "axios"
import {API_URL} from "./consts/api"

export const publicConfig = axios.create({
  baseURL: API_URL,
})