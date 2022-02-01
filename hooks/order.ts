import { useState, useEffect, useContext } from "react"
import { toast } from "react-toastify"

import AuthContext from "../context/AuthContext"
import { cleanSession } from "../context/MyLearningContext"
import { STRAPI } from "../lib/urls"

export interface IOrder {
  createdAt: string,
  updatedAt: string,
  id: number,
  total: number,
  confirmed: boolean
}

/**
* Este hook verifica si el checkout_session es valido y por lo tanto la orden de compra
* se completó exitosamente.
* De ser asi, limpia los ejercicios IDS del localStorage para que en el proximo reload
* se carguen nuevamente.
*/
export const useOrder = (checkout_session: string  | string[] | undefined) => {
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loadingOrder, setLoading] = useState(true)

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && checkout_session) {
        try {
          setLoading(true)
          toast("Confirming payment")
          const orderUrl = `${STRAPI}/api/masterclass/orders/confirm`
          const options = {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${user.token}`,
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              checkout_session
            })
          }
          const order_res = await fetch(orderUrl, options)
          const data = await order_res.json()
          if (!order_res.ok) {
            throw data
          }
          toast("Payment confirmed!")
          cleanSession()
          setOrder(data.order)
        } catch (err) {
          console.log(err)
          toast("Could not confirm payment")
          setOrder(null)
        }
        setLoading(false)
      }
    }
    fetchOrder()
  }, [user, checkout_session])

  return {order, loadingOrder}
}
