import {CSSProperties} from "react"
import styles from "../../styles/base.module.css"

export default function IntegerInput(props: {
  value: number
  setValue: any
  style?: CSSProperties
  limits?: {min?: number; max?: number}
}) {
  const {setValue, limits, ...rest} = props

  return (
    <input
      style={{width: "2em"}}
      {...rest}
      type="text"
      onChange={(event) => {
        setValue(parseInt(event.target.value) || 0)
      }}
      onBlur={(event) => {
        if (!limits) return
        let value = parseInt(event.target.value)
        if (limits.min) value = Math.max(limits.min, value)
        if (limits.max) value = Math.min(limits.max, value)
        setValue(value)
      }}
      className={styles.niceInput}
    />
  )
}