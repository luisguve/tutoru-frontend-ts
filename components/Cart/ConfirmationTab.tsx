import { useContext } from "react"

import AuthContext from "../../context/AuthContext"
import CartContext from "../../context/CartContext"
import { useData } from "../../hooks/cart"

import ItemsList from "./ItemsList"

// Paso 1: ventana de confirmacion
// En esta ventana se pueden quitar los articulos
const ConfirmationTab = () => {

  const { data } = useData()

  const { user } = useContext(AuthContext)
  const { clean } = useContext(CartContext)

  const noItems = !user || !data || !data.items.length
  const modalFooterClass = noItems ? "" : " d-flex justify-content-between"
  return (
    <div
      className="modal fade"
      id="cartModal"
      aria-hidden="true"
      aria-labelledby="cartModalLabel"
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="cartModalLabel">Step 1: select items</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {
            (!user) ?
              <p className="text-center my-3">Login to purchase courses</p>
              :
              data && data.items.length ?
                <>
                  <ItemsList data={data} editable />
                  <h4 className="text-center mt-4">Total: ${data.total}</h4>
                </>
              :
                <p className="text-center my-3">Here will appear the courses you add</p>
            }
          </div>
          <div className={"modal-footer".concat(modalFooterClass)}>
            {
              noItems ? (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >Close</button>
              ) : (
                <>
                  <button
                    className="btn btn-outline-primary me-1"
                    onClick={clean}
                    data-bs-toggle="modal"
                    data-bs-target="#cartModalStep0"
                  >Clear cart</button>
                  <button
                    className="btn btn-primary"
                    data-bs-target="#cartModalStep2"
                    data-bs-toggle="modal"
                    data-bs-dismiss="modal"
                  >Next</button>
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationTab