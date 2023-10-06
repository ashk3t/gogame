import styles from "../../styles/base.module.css"
import {useNavigate} from "react-router-dom"

export default function NavButton(props: {path: string; children: any; callback?: any}) {
  const {path, children, callback} = props
  const navigate = useNavigate()

  return (
    <button
      className={styles.niceButton}
      onClick={() => {
        if (callback) callback()
        navigate(path)
      }}
    >
      {children}
    </button>
  )
}