import { useRouter } from "next/router"

import CartButton from "./CartButton"
import ConfirmationTab from "./ConfirmationTab"
import CheckoutTab from "./CheckoutTab"
import { BuyNowTab } from "./BuyNowButton"

export default function Cart() {
  const router = useRouter()

  // No mostrar el icono si estamos en la pagina de reproduccion de un curso
  if (router.asPath.endsWith("/view")) {
    return null
  }

  return (
    <>
      {/* Ventana de reinicio: aqui se va cuando se limpia el carrito */}
      {/* Para tener un efecto animado */}
      <Step0 />
      {/* Ventana de confirmacion: */}
      {/* En esta ventana se pueden quitar los articulos */}
      <ConfirmationTab />
      {/* Ventana de checkout: */}
      {/* Se selecciona el metodo de pago y se redirige al checkout */}
      <CheckoutTab />
      {/* Ventana para comprar articulo */}
      <BuyNowTab />
      <span className="d-none d-md-inline"><CartButton /></span>
    </>
  )
}

// Paso 0: todos los items de la cesta han sido limpiados
const Step0 = () => {
  return (
    <div
      className="modal fade"
      id="cartModalStep0"
      aria-hidden="true"
      aria-labelledby="cartModalLabel0"
      tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="cartModalLabel0">Step 1: select items</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p className="text-center my-3">Here will appear the courses you add</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              data-bs-dismiss="modal"
            >Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
