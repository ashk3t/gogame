import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
import Board from "../components/Board"

export default function GamePage() {
  const board = Array.from({length: 19}, () => new Array(19).fill(0))

  return (
    <main>
      <section>
        <h3>This page in development:</h3>
        <Board />
      </section>
    </main>
  )
}