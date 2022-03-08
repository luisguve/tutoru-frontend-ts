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

const stripePromise = loadStripe(STRIPE_PK)

export default function Basket() {
  const { remove } = useContext(BasketContext)
  const router = useRouter()
  const { data } = useData()

  const renderList = (editable: boolean) => {
    if (!data) {
      return null
    }
    const btnRemove = (item: IItem) => {
      return (
        <button
          className="btn btn-outline-danger py-0"
          onClick={() => remove(item)}
        >Remove</button>
      )
    }
    return data.items.map(item => {
      // if the item is a ejercicio, display it's category
      const label = item.kind === "course" ? item.title : `${item.category.title} - ${item.title}`
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
      <Confirmation
        data={data}
        list={renderList(true)}
      />
      {/* Ventana de checkout: */}
      {/* Se selecciona el metodo de pago y se redirige al checkout */}
      <Checkout
        data={data}
        list={renderList(false)}
      />
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
 list: React.ReactNode[] | null;
}
// Paso 1: ventana de confirmacion
// En esta ventana se pueden quitar los articulos
const Confirmation = (props: BasketTabProps) => {
  const { user } = useContext(AuthContext)
  const { clean } = useContext(BasketContext)
  const { data, list } = props
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
                  {list}
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
  const { data, list } = props

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
      const coursesIDs: string[] = []
      const ejerciciosIDs: string[] = []
      itemsIDs.map(({id}) => {
        if (id.startsWith(COURSE_PREFIX)) {
          coursesIDs.push(id.replace(COURSE_PREFIX, ""))
        } else {
          ejerciciosIDs.push(id)
        }
      })
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
          courses: coursesIDs,
          ejercicios: ejerciciosIDs
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
    <div
      className="modal fade"
      id="cartModalStep2"
      aria-hidden="true"
      aria-labelledby="cartModalLabel2"
      tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="cartModalLabel2">Step 2: choose payment method</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {
              data && data.items.length ?
              <>
                {list}
                <h4>Total: ${data.total}</h4>
                <div className="d-flex flex-column my-3">
                  <div className="d-flex flex-column align-items-center mb-2">
                    <p className="mb-1">Choose payment method</p>
                    <label>
                      <input
                        type="radio"
                        name="method"
                        value="CC"
                        checked={checkedCC}
                        onChange={e => setPaymentMethod(e.target.value)}
                      />
                      Credit card
                    </label>
                  </div>
                  {
                    <button
                      className={disabled.concat(" btn btn-success my-2")}
                      onClick={pay}
                    >{disabled ? "Creating order..." : "Complete purchase"}</button>
                  }
                </div>
              </>
              :
              <p>Here will appear the courses you add</p>
            }
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-primary"
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
