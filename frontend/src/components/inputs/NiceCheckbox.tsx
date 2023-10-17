import styles from "../../styles/base.module.css"
import {useNavigate} from "react-router-dom"

export default function NiceCheckbox(props: React.ComponentProps<"input">) {
  return <input type="checkbox" className={styles.niceCheckbox} {...props} />
}