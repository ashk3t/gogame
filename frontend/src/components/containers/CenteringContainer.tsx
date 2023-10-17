import styles from "../../styles/base.module.css"

export default function CenteringContainer(props: React.ComponentProps<"div">) {
  const {children, ...rest} = props
  return (
    <div className={styles.centeringContainer} {...rest}>
      {children}
    </div>
  )
}