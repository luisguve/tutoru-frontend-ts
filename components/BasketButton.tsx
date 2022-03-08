
import styles from "../styles/Carrito.module.scss"
import { useData } from "../hooks/basket"

const BasketButton = () => {
  const { data } = useData()
  return (
    <button
      type="button"
      className={styles.Icono.concat(" btn btn-outline-success")}
      data-bs-toggle="modal"
      data-bs-target="#cartModal"
    >
      Cart {
        (data && data.items.length) ? `(${data.items.length})`: null
      }
    </button>
  )
}

export default BasketButton