import styles from "../../styles/base.module.css"

export default function NiceInput(props: React.ComponentProps<"input">) {
  return <input className={styles.niceInput} {...props}></input>
}