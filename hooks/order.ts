import { useState, useEffect, useContext } from "react"
import { toast } from "react-toastify"

import AuthContext from "../context/AuthContext"
import MyLearningContext from "../context/MyLearningContext"
import { cleanSession } from "../context/MyLearningContext"
import { STRAPI } from "../lib/urls"
import { ICourseSummary } from "../lib/content"

export interface IOrder {
  createdAt: string;
  updatedAt: string;
  id: number;
  amount: number;
  confirmed: boolean;
  courses: ICourseSummary[];
}
/**
* Este hook verifica si el checkout_session es valido y por lo tanto la orden de compra
* se completó exitosamente.
* De ser asi, limpia los cursos IDS del localStorage y refresca la informacion.
*/
export const useOrder = (checkout_session: string  | string[] | undefined) => {
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loadingOrder, setLoading] = useState(true)

  const { user } = useContext(AuthContext)
  const { refresh } = useContext(MyLearningContext)

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
          refresh()
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
