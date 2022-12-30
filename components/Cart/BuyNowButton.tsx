import { useContext, useState } from "react"
import { useRouter } from "next/router"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "react-toastify"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faPaypal } from '@fortawesome/free-brands-svg-icons'

import AuthContext from "../../context/AuthContext"
import CartContext from "../../context/CartContext"
import { IItem } from "../../context/CartContext"
import { STRIPE_PK, STRAPI } from "../../lib/urls"
import { cleanSession } from "../../context/MyLearningContext"

import ItemsList from "./ItemsList"

import styles from "../../styles/Carrito.module.scss"

const stripePromise = loadStripe(STRIPE_PK)

// Paso 2: ventana de checkout
// En esta ventana no se pueden quitar los articulos
// El usuario selecciona el metodo de pago y se redirige al checkout
export const BuyNowTab = () => {
  const { buyNowItem: item } = useContext(CartContext)
  const { user } = useContext(AuthContext)
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
    if (!user || !item) {
      return
    }
    const coursesIDs: string[] = []
    const ejerciciosIDs: string[] = []
    if (item.kind === "course") {
      coursesIDs.push(item.id.toString())
    } else {
      ejerciciosIDs.push(item.id.toString())
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
    setSending(true)
    try {
      toast("Creando orden de compra")
      const res = await fetch(url, options)
      const data = await res.json()
      if (!res.ok) {
        throw data
      }
      if (ccSelected) {
        const stripe = await stripePromise
        if (!stripe) {
          throw "Null Stripe"
        }
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
      id="buyNowModal"
      aria-hidden="true"
      aria-labelledby="buyNowLabel"
      data-bs-backdrop={sending ? "static" : "true"}
      data-bs-keyboard={sending ? "false" : "true"}
      tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="buyNowLabel">
              Buy now {item ? item.title : ""}
            </h5>
            <button
              type="button"
              className={"btn-close".concat(sending ? " disabled" : "")}
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {
              item && (
                <>
                  <ItemsList data={{items: [item], total: item.price.toFixed(2)}} />
                  <h4>Total: ${item.price.toFixed(2)}</h4>
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
              )
            }
          </div>
          <div className="modal-footer justify-content-start">
            <button
              className={"btn btn-secondary btn-sm".concat(sending ? " disabled" : "")}
              data-bs-dismiss="modal"
            >Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BuyNowButtonProps {
  item: IItem;
}

const BuyNowButton = ({ item }: BuyNowButtonProps) => {
  const { user } = useContext(AuthContext)

  const { setBuyNowItem } = useContext(CartContext)

  if (!user) {
    return null
  }
  return (
    <button
      type="button"
      className="btn btn-sm btn-success py-2"
      data-bs-toggle="modal"
      data-bs-target="#buyNowModal"
      onClick={() => setBuyNowItem(item)}
    >Buy now</button>
  )
}

export default BuyNowButton
