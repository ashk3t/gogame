import {CSSProperties, useEffect, useState} from "react"
import styles from "../../styles/base.module.css"

interface IntegerInputProps extends React.ComponentProps<"input"> {
  value: number
  setValue: (arg0: number) => any
  dynamicStyle?: (arg0: string) => CSSProperties
  limits?: {min?: number; max?: number}
}

export default function IntegerInput(props: IntegerInputProps) {
  const {value, setValue, dynamicStyle, limits, onBlur, onKeyDown, ...rest} = props
  const [internalValue, setInternalValue] = useState(value.toString())

  useEffect(() => {
    setInternalValue(value.toString())
  }, [value])

  function setAllValues(targetValue: number) {
    setInternalValue(targetValue.toString())
    setValue(targetValue)
  }

  function validate() {
    let value = parseInt(internalValue) || 0
    if (!limits) return value
    if (limits.min) value = Math.max(limits.min, value)
    if (limits.max) value = Math.min(limits.max, value)
    return value
  }

  return (
    <input
      style={dynamicStyle ? dynamicStyle(internalValue) : {width: "2em"}}
      type="text"
      value={internalValue}
      onChange={(event) => {
        const intVal = parseInt(event.target.value)
        setInternalValue(intVal ? intVal.toString() : "")
      }}
      onBlur={(event) => {
        const value = validate()
        if (onBlur) onBlur(event)
        setAllValues(value)
      }}
      onKeyDown={(event) => {
        if (event.key == "Enter") {
          const value = validate()
          if (onKeyDown) onKeyDown(event)
          setAllValues(value)
        }
      }}
      className={styles.niceInput}
      {...rest}
    />
  )
}