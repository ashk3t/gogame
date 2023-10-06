import styles from "../styles/Header.module.css"
import {Link} from "react-router-dom"
import {defaultRoutes} from "../consts/pages"

export default function Header() {
  return (
    <header>
      <div className={styles.menu}>
        {defaultRoutes.map(({path, title}) => (
          <Link key={path} to={path}>
            {title}
          </Link>
        ))}
      </div>
    </header>
  )
}