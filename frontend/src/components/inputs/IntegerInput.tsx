import {CSSProperties, FocusEvent} from "react"
import {useActions, useAppSelector} from "../../hooks/redux"
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
        const value = Number(event.target.value.replace(/[^\-\d]/, "")) || 0
        setValue(value)
      }}
      onBlur={(event) => {
        if (!limits) return
        let value = Number(event.target.value)
        if (limits.min) value = Math.max(limits.min, value)
        if (limits.max) value = Math.min(limits.max, value)
        setValue(value)
      }}
      className={styles.niceInput}
    />
  )
}