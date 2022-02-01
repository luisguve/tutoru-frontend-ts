import { createContext, useEffect, useContext, useState } from "react"

import AuthContext from "./AuthContext"
import MyLearningContext from "./MyLearningContext"

import styles from "../styles/Carrito.module.scss"

export interface IItem {
  id: number,
  title: string,
  price: number,
  slug: string
}
export interface IItemID {
 id: number
}
export interface IBasketContext {
  items: IItem[],
  itemsIDs: IItemID[],
  add: (item: IItem) => void,
  remove: (itemID: number) => void,
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
    coursesIDs: coursesPurchased
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
    // Avoid duplicate items
    if (itemsIDs.some(i => i.id === item.id)) {
      return
    }

    const newItems = [...items, item]
    setItems(newItems)
    const newIDs = [...itemsIDs, {id: item.id}]
    setItemsIDs(newIDs)

    saveSession(newItems, newIDs)
  }

  const remove = (itemID: number) => {

    const newItems = items.filter(i => i.id != itemID)
    setItems(newItems)
    const newIDs = itemsIDs.filter(a => a.id != itemID)
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
      itemsIDs.map(item => {
        if (coursesPurchased.some(c => c.course.id === item.id)) {
          remove(item.id)
        }
      })
    }
  }, [coursesPurchased])

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
    const data = JSON.parse(localStorage.getItem("data"))
    if (data) {
      return {
        data: data.basket
      }
    }
  }
  return {}
}
const saveSession = (items: IItem[], itemsIDs: IItemID[]) => {
  if (typeof(Storage) !== undefined) {
    const data = JSON.parse(localStorage.getItem("data"))
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
    const data = JSON.parse(localStorage.getItem("data"))
    delete data.basket
    localStorage.setItem("data", JSON.stringify(data))
  }
}
