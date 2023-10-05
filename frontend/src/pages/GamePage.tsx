import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
import Board from "../components/Board"

export default function GamePage() {
  return (
    <main>
      <section>
        <Board />
      </section>
    </main>
  )
}