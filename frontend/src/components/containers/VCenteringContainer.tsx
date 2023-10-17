import styles from "../../styles/base.module.css"

export default function VCenteringContainer(props: React.ComponentProps<"div">) {
  const {children, ...rest} = props
  return (
    <div className={styles.vcenteringContainer} {...rest}>
      {children}
    </div>
  )
}