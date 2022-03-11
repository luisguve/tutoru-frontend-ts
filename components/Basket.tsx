import { useContext, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import { loadStripe } from "@stripe/stripe-js"

import AuthContext from "../context/AuthContext"
import BasketContext, { IItem, COURSE_PREFIX } from "../context/BasketContext"
import { useData, IData } from "../hooks/basket"
import { cleanSession } from "../context/MyLearningContext"
import { STRIPE_PK, STRAPI } from "../lib/urls"
import BasketButton from "./BasketButton"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard } from '@fortawesome/free-regular-svg-icons'
import { faCheck, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { faPaypal } from '@fortawesome/free-brands-svg-icons'

import styles from "../styles/Carrito.module.scss"

const stripePromise = loadStripe(STRIPE_PK)

interface ItemsListProps {
  data: IData | null;
  editable?: boolean;
}
const ItemsList = (props: ItemsListProps): React.ReactElement | null => {
  const { data, editable } = props
  const { remove } = useContext(BasketContext)

  if (!data || !data.items.length) {
    return null
  }
  const btnRemove = (item: IItem) => {
    return (
      <FontAwesomeIcon
        className="btn p-0 text-danger" icon={faTrashCan} onClick={() => remove(item)}
      />
    )
  }
  const list = data.items.map(item => {
    // if the item is a ejercicio, display it's category
    const label = item.kind === "course" ? item.title : `${item.category.title} - ${item.title}`
    return (
      <tr key={item.slug}>
        <th scope="row">${item.price}</th>
        <td className="small mb-0">{label}</td>
        {editable && <td>{btnRemove(item)}</td>}
      </tr>
    )
  })
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Price</th>
          <th scope="col">Name</th>
          {editable && <th scope="col">Edit</th>}
        </tr>
      </thead>
      <tbody>
        {list}
      </tbody>
    </table>
  )
}

export default function Basket() {
  const router = useRouter()
  const { data } = useData()

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
      <Confirmation data={data} />
      {/* Ventana de checkout: */}
      {/* Se selecciona el metodo de pago y se redirige al checkout */}
      <Checkout data={data} />
      <span className="d-none d-md-inline"><BasketButton /></span>
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

interface BasketTabProps {
 data: IData | null;
}
// Paso 1: ventana de confirmacion
// En esta ventana se pueden quitar los articulos
const Confirmation = (props: BasketTabProps) => {
  const { user } = useContext(AuthContext)
  const { clean } = useContext(BasketContext)
  const { data } = props
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

// Paso 2: ventana de checkout
// En esta ventana no se pueden quitar los articulos
// El usuario selecciona el metodo de pago y se redirige al checkout
const Checkout = (props: BasketTabProps) => {
  const { data } = props
  const { user } = useContext(AuthContext)
  const { itemsIDs, clean: cleanBasket } = useContext(BasketContext)
  const router = useRouter()

  const [sending, setSending] = useState(false)

  const [ccSelected, setCcSelected] = useState(true)
  const [paypalSelected, setPaypalSelected] = useState(false)

  const selectMethod = (method: "cc" | "paypal") => {
    if (sending) {
      return
    }
    switch(method) {
      case "cc":
      if (paypalSelected) {
        setPaypalSelected(false)
        setCcSelected(true)
      }
      break;
      case "paypal":
      if (ccSelected) {
        setCcSelected(false)
        setPaypalSelected(true)
      }
      break;
    }
  }

  const pay = async () => {
    if (!user) {
      return
    }
    const coursesIDs: string[] = []
    const ejerciciosIDs: string[] = []
    itemsIDs.map(({id}) => {
      if (id.startsWith(COURSE_PREFIX)) {
        coursesIDs.push(id.replace(COURSE_PREFIX, ""))
      } else {
        ejerciciosIDs.push(id)
      }
    })
    setSending(true)
    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw "Null Stripe"
      }

      const url = `${STRAPI}/api/masterclass/orders`
      const options = {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          courses: coursesIDs,
          ejercicios: ejerciciosIDs,
          method: ccSelected? "cc" : "paypal"
        })
      }

      toast("Creando orden de compra")
      const res = await fetch(url, options)
      const data = await res.json()
      if (!res.ok) {
        throw data
      }
      if (ccSelected) {
        const { id } = data
        if (!id) {
          throw "No id"
        }
        toast("Redireccionando a stripe")
        await stripe.redirectToCheckout({
          sessionId: id
        })
      } else {
        // Paying with paypal
        const { links } = data
        if (!links) {
          throw "No links"
        }
        const link = links.find((l: any) => l.rel === "approve")
        if (!link) {
          throw "No approve link"
        }
        toast("Redireccionando a PayPal")
        router.push(link.href)
      }
      cleanBasket()
      cleanSession()
    } catch (err) {
      console.log(err)
      toast("Something went wrong. View console")
      setSending(false)
    }
  }
  return (
    <div
      className="modal fade"
      id="cartModalStep2"
      aria-hidden="true"
      aria-labelledby="cartModalLabel2"
      data-bs-backdrop={sending ? "static" : "true"}
      data-bs-keyboard={sending ? "false" : "true"}
      tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="cartModalLabel2">Step 2: choose payment method</h5>
            <button
              type="button"
              className={"btn-close".concat(sending ? " disabled" : "")}
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {
              data && data.items.length ?
              <>
                <ItemsList data={data} />
                <h4>Total: ${data.total}</h4>
                <div className="d-flex flex-column my-3">
                  <div className="d-flex flex-column align-items-center mb-2">
                    <p className="fw-bold fs-6 mb-4">Choose payment method</p>
                    <div
                      className={
                        "d-flex justify-content-between ".concat(sending ? styles["sending"] : "")
                      }
                    >
                      <div
                        className={styles["type"].concat(ccSelected ? " " + styles["selected"] : "")}
                        onClick={() => selectMethod("cc")}
                      >
                        <div className={styles["logo"]}>
                          <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                        <div>
                          <p>Pay with Credit Card</p>
                        </div>
                        {
                          ccSelected && (
                            <div className={styles["check"]}>
                              <FontAwesomeIcon icon={faCheck} />
                            </div>
                          )
                        }
                      </div>
                      <div
                        className={
                          styles["type"].concat(paypalSelected ? " "+styles["selected"] : "")
                        }
                        onClick={() => selectMethod("paypal")}
                      >
                        <div className={styles["logo"]}>
                          <FontAwesomeIcon icon={faPaypal} />
                        </div>
                        <div>
                          <p>Pay with PayPal</p>
                        </div>
                        {
                          paypalSelected && (
                            <div className={styles["check"]}>
                              <FontAwesomeIcon icon={faCheck} />
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                  {
                    <button
                      className={"btn btn-success my-2".concat(sending ? " disabled" : "")}
                      onClick={pay}
                    >{sending ? "Creating order..." : "Complete purchase"}</button>
                  }
                </div>
              </>
              :
              <p>Here will appear the courses you add</p>
            }
          </div>
          <div className="modal-footer">
            <button
              className={"btn btn-primary".concat(sending ? " disabled" : "")}
              data-bs-target="#cartModal"
              data-bs-toggle="modal"
              data-bs-dismiss="modal"
            >Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}
