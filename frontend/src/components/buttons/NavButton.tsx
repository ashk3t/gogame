import styles from "../../styles/base.module.css"
import {useNavigate} from "react-router-dom"

export default function NavButton(props: {
  path: string
  children: React.ReactNode
  callback?: any
  scary?: boolean
}) {
  const {path, children, callback, scary} = props
  const navigate = useNavigate()

  return (
    <button
      className={scary ? styles.scaryButton : styles.niceButton}
      onClick={() => {
        if (callback) callback()
        navigate(path)
      }}
    >
      {children}
    </button>
  )
}