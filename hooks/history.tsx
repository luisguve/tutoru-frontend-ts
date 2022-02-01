import { useState, useEffect, useContext } from "react"
import { toast } from "react-toastify"

import AuthContext from "../context/AuthContext"
import { STRAPI } from "../lib/urls"
import { ICourseSummary, ICoursesRes } from "../lib/content"
import { IOrder } from "./order"

interface ILearningRes {
  course: ICourseSummary
}
interface ILearning {
  courses: ILearningRes[] | null
}

/**
* Este Hook pide a Strapi los ejercicios que ha adquirido el usuario
* y sus ordenes de compra, ambas de manera asincrona e independiente.
*/
export const usePurchaseHistory = () => {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState<IOrder[] | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)

  const [learning, setLearning] = useState<ILearning>({courses: null})
  const [loadingLearning, setLoadingLearning] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        return
      }
      try {
        setLoadingOrders(true)
        const url = `${STRAPI}/api/masterclass/orders`
        const orders_res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        })
        const data = await orders_res.json()
        setOrders(data.orders)
      } catch (err) {
        console.log(err)
        setOrders(null)
      }
      setLoadingOrders(false)
    }
    const fetchLearning = async () => {
      if (!user) {
        return
      }
      try {
        setLoadingLearning(true)
        const url = `${STRAPI}/api/masterclass/my-learning`
        const learning_res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        })
        const data: ILearning = await learning_res.json()
        setLearning(data)
      } catch (err) {
        toast("Could not load your account information")
        console.log(err)
        setLearning({courses: null})
      }
      setLoadingLearning(false)
    }
    fetchLearning()
    fetchOrders()
  }, [user])

  return {
    orders, loadingOrders,
    learning, loadingLearning
  }
}