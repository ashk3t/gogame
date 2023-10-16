import {useAppSelector} from "../redux/hooks"

export default function SpectatorsSection() {
  const connectedSpectators = useAppSelector((state) => state.playerReducer.spectators)

  const maxNicknameLength = Math.max(...connectedSpectators.map((player) => player.nickname.length))

  if (connectedSpectators.length == 0) return <></>

  return (
    <section>
      <h4>Spectators: {connectedSpectators.length}</h4>
      {connectedSpectators.length <= 6 &&
        connectedSpectators.map((spectator, idx) => (
          <h6 key={idx}>{spectator.nickname.padStart(maxNicknameLength)}</h6>
        ))}
    </section>
  )
}