import { useContext } from "react"

import BasketContext from "../context/BasketContext"
import styles from "../styles/Carrito.module.scss"
import { useData } from "../hooks/basket"

const BasketButton = () => {
  const { data } = useData()
  const { setStep1, setClass } = useContext(BasketContext)
  const openBasket = () => {
    setStep1(true)
    const className = `${styles.Contenedor__Carrito} ${styles.abierto}`
    setClass(className)
  }
  return (
    <button className={styles.Icono.concat(" btn btn-outline-success")} onClick={openBasket}>
      Cart {
        (data && data.items.length) ? `(${data.items.length})`: null
      }
    </button>
  )
}

export default BasketButton