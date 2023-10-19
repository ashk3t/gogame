import styles from "../styles/base.module.css"

export enum ContainerMargins {
  NONE = "NONE",
  DEFAULT = "DEFAULT",
  EVERYTHING = "EVERYTHING",
}

export const availableMargins = {
  NONE: "",
  DEFAULT: styles.defaultMargin,
  EVERYTHING: styles.marginEverything,
}