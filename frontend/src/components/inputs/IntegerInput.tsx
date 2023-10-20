import {CSSProperties} from "react"
import styles from "../../styles/base.module.css"

interface IntegerInputProps extends React.ComponentProps<"input"> {
  value: number
  setValue: (arg0: number) => any
  setExternalValue?: (arg0: number) => any
  style?: CSSProperties
  limits?: {min?: number; max?: number}
}

export default function IntegerInput(props: IntegerInputProps) {
  const {setValue, setExternalValue, limits, onBlur, onKeyDown, ...rest} = props

  function validate() {
    if (!limits) return props.value
    let value = props.value
    if (limits.min) value = Math.max(limits.min, value)
    if (limits.max) value = Math.min(limits.max, value)
    setValue(value)
    return value
  }

  return (
    <input
      style={{width: "2em"}}
      type="text"
      {...rest}
      onChange={(event) => {
        setValue(parseInt(event.target.value) || 0)
      }}
      onBlur={(event) => {
        const value = validate()
        if (onBlur) onBlur(event)
        if (setExternalValue) setExternalValue(value)
      }}
      onKeyDown={(event) => {
        if (event.key == "Enter") {
          const value = validate()
          if (onKeyDown) onKeyDown(event)
          if (setExternalValue) setExternalValue(value)
        }
      }}
      className={styles.niceInput}
    />
  )
}