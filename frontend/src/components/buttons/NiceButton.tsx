import styles from "../../styles/base.module.css"

interface NiceButtonProps extends React.ComponentProps<"button"> {
  very: boolean
}

export default function NiceButton(props: NiceButtonProps) {
  const {very, children, ...rest} = props
  return (
    <button className={`${styles.niceButton} ${very && styles.very}`} {...rest}>
      {children}
    </button>
  )
}

NiceButton.defaultProps = {
  very: false,
}