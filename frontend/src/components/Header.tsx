import styles from "../styles/Header.module.css"
import {Link} from "react-router-dom"
import {routes} from "../consts"

export default function Header() {
  return (
    <header>
      <div className={styles.menu}>
        {routes.map(({path, title}) => (
          <Link key={path} to={path}>
            {title}
          </Link>
        ))}
      </div>
    </header>
  )
}