import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCartShopping } from "@fortawesome/free-solid-svg-icons"

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
      <span>
        <FontAwesomeIcon icon={faCartShopping} size="sm" />
        <span> ({data ? data.items.length : 0})</span>
      </span>
    </button>
  )
}

export default BasketButton