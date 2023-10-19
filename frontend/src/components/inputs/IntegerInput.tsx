import {CSSProperties} from "react"
import styles from "../../styles/base.module.css"

interface IntegerInputProps extends React.ComponentProps<"input"> {
  value: number
  setValue: React.Dispatch<React.SetStateAction<number>>
  style?: CSSProperties
  limits?: {min?: number; max?: number}
}

export default function IntegerInput(props: IntegerInputProps) {
  const {setValue, limits, onBlur, ...rest} = props

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
        onBlur?.(event)
      }}
      className={styles.niceInput}
    />
  )
}