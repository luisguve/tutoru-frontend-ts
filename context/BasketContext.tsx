import { createContext, useEffect, useContext, useState } from "react"

import AuthContext from "./AuthContext"
import MyLearningContext from "./MyLearningContext"

import styles from "../styles/Carrito.module.scss"

export const COURSE_PREFIX = "course--"

export interface IItem {
  id: number | string;
  title: string;
  price: number;
  slug: string;
  kind: "course" | "ejercicio";
  category: {
    slug: string;
    title: string;
  };
}
export interface IItemID {
 id: string;
}
export interface IBasketContext {
  items: IItem[],
  itemsIDs: IItemID[],
  add: (item: IItem) => void,
  remove: (item: IItem) => void,
  clean: () => void,
  step1: boolean,
  step2: boolean,
  setStep1: (v: boolean) => void,
  setStep2: (v: boolean) => void,
  classBasketContainer: string,
  setClass: (v: string) => void,
}

const defaultState: IBasketContext = {
  items: [],
  itemsIDs: [],
  add: () => {},
  remove: () => {},
  clean: () => {},
  step1: false,
  step2: false,
  setStep1: () => {},
  setStep2: () => {},
  classBasketContainer: "",
  setClass: () => {}
}

const BasketContext = createContext<IBasketContext>(defaultState)

export interface IBasketProviderProps {
  children: React.ReactNode
}

export const BasketProvider = (props: IBasketProviderProps) => {
  const { user } = useContext(AuthContext)
  const {
    coursesIDs: coursesPurchased,
    ejerciciosIDs: ejerciciosPurchased
  } = useContext(MyLearningContext)

  const [items, setItems] = useState<IItem[]>(() => {
    if (user) {
      const { data } = getSession()
      if (data) {
        const { items } = data
        if (items) {
          return items
        }
      }
    }
    return []
  })
  const [itemsIDs, setItemsIDs] = useState<IItemID[]>(() => {
    if (user) {
      const { data } = getSession()
      if (data) {
        const { itemsIDs } = data
        if (itemsIDs) {
          return itemsIDs
        }
      }
    }
    return []
  })

  const [step1, setStep1] = useState(false)
  const [step2, setStep2] = useState(false)
  const [classBasketContainer, setClass] = useState<string>(styles.Contenedor__Carrito)

  const add = (item: IItem) => {
    // copy the item object
    const newItem: IItem = JSON.parse(JSON.stringify(item))
    let prefix = ""
    // Add a prefix to course items
    if (newItem.kind === "course") {
      prefix = COURSE_PREFIX
    }
    newItem.id = `${prefix}${newItem.id}`

    // Avoid duplicate items
    if (itemsIDs.some(i => `${prefix}${i.id}` === newItem.id)) {
      return
    }

    const newItems = [...items, newItem]
    setItems(newItems)
    const newIDs = [...itemsIDs, {id: newItem.id}]
    setItemsIDs(newIDs)

    saveSession(newItems, newIDs)
  }

  const remove = (item: IItem) => {
    let itemID = item.id.toString()
    if (item.kind === "course" && !itemID.startsWith(COURSE_PREFIX)) {
      itemID = COURSE_PREFIX.concat(itemID)
    }

    const newItems = items.filter(i => i.id !== itemID)
    setItems(newItems)
    const newIDs = itemsIDs.filter(i => i.id !== itemID)
    setItemsIDs(newIDs)

    saveSession(newItems, newIDs)
  }

  const clean = () => {
    setItems([])
    setItemsIDs([])
    saveSession([], [])
  }

  useEffect(() => {
    if (user) {
      const { data } = getSession()
      if (data) {
        const { items, itemsIDs } = data
        if (items) {
          setItems(items)
        }
        if (itemsIDs) {
          setItemsIDs(itemsIDs)
        }
      }
    } else {
      setItems([])
      setItemsIDs([])
    }
  }, [user])

  useEffect(() => {
    // Remove the items that the user has purchased from the basket
    if (coursesPurchased) {
      itemsIDs.map(({id: itemID}) => {
        if (!itemID.startsWith(COURSE_PREFIX)) {
          return
        }
        const userPurchasedThis = coursesPurchased.some(({ course }) => {
          // Remove the prefix for courses from the ID
          const idToCompare = itemID.replace(COURSE_PREFIX, "")
          return course.id.toString() === idToCompare
        })

        if (userPurchasedThis) {
          const item = items.find(i => i.id === itemID)
          if (item) {
            remove(item)
          }
        }
      })
    }
    if (ejerciciosPurchased) {
      itemsIDs.map(({id: itemID}) => {
        if (itemID.startsWith(COURSE_PREFIX)) {
          return
        }
        const userPurchasedThis = ejerciciosPurchased.some(({id}) => id.toString() === itemID)

        if (userPurchasedThis) {
          const item = items.find(i => i.id === itemID)
          if (item) {
            remove(item)
          }
        }
      })
    }
  }, [coursesPurchased, ejerciciosPurchased])

  return (
    <BasketContext.Provider
      value={{
        items,
        itemsIDs,
        add,
        remove,
        clean,
        step1,
        step2,
        setStep1,
        setStep2,
        classBasketContainer,
        setClass,
      }}
    >
      {props.children}
    </BasketContext.Provider>
  )
}

export default BasketContext

interface ISession {
  data?: {
    items: IItem[],
    itemsIDs: IItemID[]
  }
}

const getSession = (): ISession => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    if (dataStr) {
      const data = JSON.parse(dataStr)
      return {
        data: data["basket"]
      }
    }
  }
  return {}
}
const saveSession = (items: IItem[], itemsIDs: IItemID[]) => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    let data = {}
    if (dataStr) {
      data = JSON.parse(dataStr)
    }
    localStorage.setItem("data", JSON.stringify({
      ...data,
      basket: {
        items,
        itemsIDs
      }
    }))
  }
}
const cleanSession = () => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    if (dataStr) {
      const data = JSON.parse(dataStr)
      delete data["basket"]
      localStorage.setItem("data", JSON.stringify(data))
    }
  }
}
