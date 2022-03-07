import { createContext, useContext, useState, useEffect } from "react"

import AuthContext from "./AuthContext"
import { STRAPI } from "../lib/urls"

interface IMyLearningContext {
  coursesIDs: ICourse[] | null;
  ejerciciosIDs: IEjercicio[] | null;
  loadingItems: boolean;
}

const defaultState: IMyLearningContext = {
  coursesIDs: null,
  ejerciciosIDs: null,
  loadingItems: false
}

const MyLearningContext = createContext<IMyLearningContext>(defaultState)

interface MyLearningProviderProps {
  children: React.ReactNode
}
interface ICourse {
  course: {
    id: number
  }
}
interface IEjercicio {
  id: number;
}
interface IMyLearning {
  courses: ICourse[];
  ejercicios: IEjercicio[];
}

export const MyLearningProvider = (props: MyLearningProviderProps) => {

  const [loadingItems, setLoading] = useState(false)
  const [items, setItems] = useState<IMyLearning | null>(null)

  const { user } = useContext(AuthContext)
  // Fetch the IDs of the courses that the user has purchased (if logged in)
  const getItems = async () => {
    if (!user) {
      setItems(null)
      return
    }
    const { data } = getSession()
    if (data) {
      setItems(data)
      if (!data.courses || !data.courses.length) {
        console.log("No courses purchased (from local storage)")
      }
      if (!data.ejercicios || !data.ejercicios.length) {
        console.log("No ejercicios purchased (from local storage)")
      }
    }
    // Get the IDs of items purchased
    try {
      setLoading(true)

      const url = `${STRAPI}/api/masterclass/my-items-purchased`
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      })
      const itemsData: IMyLearning = await res.json()

      if (itemsData.courses) {
        let msg = ""
        switch(itemsData.courses.length) {
          case 0:
          msg = "No courses purchased (from request)"
          break;
          case 1:
          msg = "1 course purchased (from request)"
          break;
          default:
          msg = `${itemsData.courses.length} courses purchased (from request)`
        }
        console.log(msg)
      }

      setItems(itemsData)
      saveSession(itemsData)
    } catch (err) {
      console.log("Could not request data")
      console.log(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    // Intenta obtener los IDs de los ejercicios del local storage.
    // Igualmente pide de todas maneras los IDs de articulos comprados.
    getItems()
  }, [user])
  return (
    <MyLearningContext.Provider value={{
      coursesIDs: items ? items.courses : null,
      ejerciciosIDs: items ? items.ejercicios : null,
      loadingItems
    }}>
      {props.children}
    </MyLearningContext.Provider>
  )
}

export default MyLearningContext

interface ISession {
  data?: IMyLearning
}
const getSession = (): ISession => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    if (dataStr) {
      const data = JSON.parse(dataStr)
      return {
        data: data["my-learning"]
      }
    }
  }
  return {}
}
const saveSession = (items: IMyLearning) => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    let data = {}
    if (dataStr) {
      data = JSON.parse(dataStr)
    }
    localStorage.setItem("data", JSON.stringify({
      ...data,
      "my-learning": items
    }))
  }
}
export const cleanSession = () => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    if (dataStr) {
      const data = JSON.parse(dataStr)
      delete data["my-learning"]
      localStorage.setItem("data", JSON.stringify(data))
    }
  }
}
