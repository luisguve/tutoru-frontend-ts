import { useContext, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import { loadStripe } from "@stripe/stripe-js"

import AuthContext from "../context/AuthContext"
import BasketContext, { IItem } from "../context/BasketContext"
import { useData, IData } from "../hooks/basket"
import { cleanSession } from "../context/MyLearningContext"
import styles from "../styles/Carrito.module.scss"
import { STRIPE_PK, STRAPI } from "../lib/urls"
import BasketButton from "./BasketButton"

const stripePromise = loadStripe(STRIPE_PK)

export default function Basket() {
  const {
    remove,
    step1,
    setStep1,
    step2,
    setStep2,
    classBasketContainer,
    setClass,
  } = useContext(BasketContext)
  const router = useRouter()
  const close = () => {
    setStep1(false)
    setStep2(false)
    setClass(styles.Contenedor__Carrito)
  }
  const goStep1 = () => {
    setStep1(true)
    setStep2(false)
    const className = `${styles.Contenedor__Carrito} ${styles.abierto}`
    setClass(className)
  }
  const goStep2 = () => {
    setStep2(true)
    setStep1(false)
  }
  const { data } = useData()

  const renderList = (editable: boolean) => {
    if (!data) {
      return null
    }
    const btnRemove = (item: IItem) => {
      return (
        <button
          className="btn btn-outline-danger py-0"
          onClick={() => remove(item.id)}
        >Remove</button>
      )
    }
    return data.items.map(item => {
      const label = item.title
      return (
        <div
          className="w-100 d-flex justify-content-between align-items-center mb-1"
          key={item.slug}
        >
          <span>${item.price}</span>
          <span className="mx-2 mx-lg-4">{label}</span>
          {
            editable && <span>{btnRemove(item)}</span>
          }
        </div>
      )
    })
  }

  // No mostrar el icono si estamos en la pagina de reproduccion de un curso
  if (router.asPath.endsWith("/ver")) {
    return null
  }

  return (
    <>
      <div className={classBasketContainer}>
        <div className={styles.Contenedor__Ventana}>
          <button
            className={styles.closeBtn.concat(" btn btn-secondary px-2 py-0")}
            onClick={close}
          >X</button>
          {/* Ventana de confirmacion: */}
          {/* En esta ventana se pueden quitar los articulos */}
          <Confirmation
            hide={!step1}
            data={data}
            list={renderList(true)}
            back={close}
            next={goStep2}
          />
          {/* Ventana de checkout: */}
          {/* Se selecciona el metodo de pago y se redirige al checkout */}
          <Checkout
            hide={!step2}
            data={data}
            list={renderList(false)}
            back={goStep1}
          />
        </div>
      </div>
      <span className="d-none d-md-inline"><BasketButton /></span>
    </>
  )
}

interface BasketTabProps {
 hide: boolean,
 data: IData | null,
 list: React.ReactNode[] | null,
 back: () => void,
 next?: () => void
}

// Paso 1: ventana de confirmacion
// En esta ventana se pueden quitar los articulos
const Confirmation = (props: BasketTabProps) => {
  const { user } = useContext(AuthContext)
  const { clean } = useContext(BasketContext)
  const { hide, data, list, next, back } = props
  return (
    <div className={styles.Ventana} data-ocultar={hide}>
      {
      (!user) ?
        <p className="text-center">Login to purchase courses</p>
        :
        data && data.items.length ?
          <>
            {list}
            <h4 className="text-center">Total: ${data.total}</h4>
            <div className="d-flex flex-column w-75 mt-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => clean()}
              >Clear cart</button>
              <button
                className="btn btn-primary my-2"
                onClick={next}
              >Next</button>
            </div>
          </>
          :
          <p className="text-center">Here will appear the courses you add</p>
      }
      <button className="btn btn-secondary w-75 mb-2" onClick={back}>Back</button>
    </div>
  )
}

// Paso 2: ventana de checkout
// En esta ventana no se pueden quitar los articulos
// El usuario selecciona el metodo de pago y se redirige al checkout
const Checkout = (props: BasketTabProps) => {
  const { hide, data, list, back } = props

  const { user } = useContext(AuthContext)
  const { itemsIDs, clean: cleanBasket } = useContext(BasketContext)
  // Opcion de pago por defecto: tarjeta de credito
  const [checkedCC, setCheckedCC] = useState(true)
  const [method, setPaymentMethod] = useState<string>("CC")

  const [disabled, setDisabled] = useState("")

  const pay = async () => {
    if (!user) {
      return
    }
    setDisabled("disabled")
    try {
      const IDs: number[] = itemsIDs.map(({ id }) => id)
      const stripe = await stripePromise
      if (!stripe) {
        throw "Null Stripe"
      }

      const url = `${STRAPI}/api/masterclass/orders`
      const orderOptions = {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          courses: IDs
        })
      }

      toast("Creando orden de compra")
      const res = await fetch(url, orderOptions)
      const data = await res.json()
      if (!res.ok) {
        throw data
      }
      const { id } = data
      if (id) {
        toast("Redireccionando a stripe")
        cleanBasket()
        cleanSession()
        await stripe.redirectToCheckout({
          sessionId: id
        })
      } else {
        throw "No id"
      }
    } catch (err) {
      console.log(err)
      toast("Something went wrong. View console")
    } finally {
      setDisabled("")
    }
  }
  return (
    <div className={styles.Ventana} data-ocultar={hide}>
      {
        data && data.items.length ?
        <>
          {list}
          <h4>Total: ${data.total}</h4>
          <p>Choose payment method</p>
          <label>
            <input
              type="radio"
              name="method"
              value="CC"
              checked={checkedCC ? true : undefined}
              onChange={e => setPaymentMethod(e.target.value)}
            />
            Credit card
          </label>
          {
            <button
              className={disabled.concat(" btn btn-primary w-75 my-2")}
              onClick={pay}
            >{disabled ? "Creating order..." : "Complete purchase"}</button>
          }
        </>
        :
        <p>Here will appear the courses you add</p>
      }
      <button className="btn btn-secondary w-75" onClick={back}>Back</button>
    </div>
  )
}
