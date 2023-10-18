import styles from "../../styles/base.module.css"

export default function MainContainer(props: React.ComponentProps<"main">) {
  const {children, ...rest} = props
  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      {children}
    </main>
  )
}