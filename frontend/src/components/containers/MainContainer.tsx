import styles from "../../styles/base.module.css"
import {ContainerMargins, availableMargins} from "../../types/component"

interface MainContainerProps extends React.ComponentProps<"main"> {
  vertical: boolean
  margin: ContainerMargins
}

function MainContainer(props: MainContainerProps) {
  const {vertical, margin, children, ...rest} = props
  return (
    <main
      className={`${vertical ? styles.vcenteringContainer : styles.centeringContainer} ${
        availableMargins[margin]
      }`}
      {...rest}
    >
      {children}
    </main>
  )
}

MainContainer.defaultProps = {
  vertical: false,
  margin: ContainerMargins.DEFAULT,
}
export default MainContainer