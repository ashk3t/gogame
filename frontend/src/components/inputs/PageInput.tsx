import {useState} from "react"
import {hexColors} from "../../consts/utils"
import IntegerInput from "./IntegerInput"

export default function PageInput(props: {
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  pageCount: number
}) {
  const {page, setPage, pageCount} = props
  const [isFocus, setIsFocus] = useState(false)

  return (
    <>
      <IntegerInput
        value={page}
        setValue={setPage}
        limits={{min: 1, max: pageCount}}
        style={{
          marginRight: 0,
          width: page.toString().length * 0.5 + "em",
          backgroundColor: hexColors.base,
          fontSize: "1.4em",
          color: isFocus ? hexColors.rose : hexColors.foam,
          fontWeight: "bold",
          padding: 0,
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onKeyDown={(event) => {
          if (event.key == "Enter") alert("NICE")
        }}
      />
      <h4 style={{marginLeft: 0}}>/{pageCount}</h4>
    </>
  )
}