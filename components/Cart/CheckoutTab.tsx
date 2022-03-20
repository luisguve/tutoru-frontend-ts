import { useContext, useState } from "react"
import { useRouter } from "next/router"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "react-toastify"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faPaypal } from '@fortawesome/free-brands-svg-icons'

import AuthContext from "../../context/AuthContext"
import CartContext, { COURSE_PREFIX } from "../../context/CartContext"
import { useData } from "../../hooks/cart"
import { STRIPE_PK, STRAPI } from "../../lib/urls"
import { cleanSession } from "../../context/MyLearningContext"

import ItemsList from "./ItemsList"

import styles from "../../styles/Carrito.module.scss"

const stripePromise = loadStripe(STRIPE_PK)

// Paso 2: ventana de checkout
// En esta ventana no se pueden quitar los articulos
// El usuario selecciona el metodo de pago y se redirige al checkout
const CheckoutTab = () => {
  const { data } = useData()
  const { user } = useContext(AuthContext)
  const { itemsIDs, clean: cleanCart } = useContext(CartContext)
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
      cleanCart()
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
                <div className="d-flex flex-column mt-3 mb-1">
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
          <div className="modal-footer justify-content-start">
            <button
              className={"btn btn-secondary btn-sm".concat(sending ? " disabled" : "")}
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

export default CheckoutTab
