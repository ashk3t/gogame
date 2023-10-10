import styles from "../../styles/base.module.css"
import {useNavigate} from "react-router-dom"

export default function NiceButton(props: React.ComponentProps<"button">) {
  const {children, ...rest} = props
  return (
    <button className={styles.niceButton} {...rest}>
      {children}
    </button>
  )
}