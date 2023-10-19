import styles from "../../styles/base.module.css"

interface ContainerProps extends React.ComponentProps<"div"> {
  vertical: boolean
  frame: boolean
  hoverable: boolean
}

function CenteringContainer(props: ContainerProps) {
  const {vertical, frame, hoverable, children, ...rest} = props
  return (
    <div
      className={`${vertical ? styles.vcenteringContainer : styles.centeringContainer} ${
        frame && styles.frame
      } ${hoverable && styles.hoverable}`}
      {...rest}
    >
      {children}
    </div>
  )
}

CenteringContainer.defaultProps = {
  vertical: false,
  frame: false,
  hoverable: false,
}

export default CenteringContainer