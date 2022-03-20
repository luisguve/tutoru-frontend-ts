import { createContext, useEffect, useContext, useState } from "react"

import AuthContext from "./AuthContext"
import MyLearningContext from "./MyLearningContext"

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
export interface ICartContext {
  items: IItem[];
  itemsIDs: IItemID[];
  add: (item: IItem) => void;
  remove: (item: IItem) => void;
  clean: () => void;
}

const defaultState: ICartContext = {
  items: [],
  itemsIDs: [],
  add: () => {},
  remove: () => {},
  clean: () => {}
}

const CartContext = createContext<ICartContext>(defaultState)

export interface ICartProviderProps {
  children: React.ReactNode
}

export const CartProvider = (props: ICartProviderProps) => {
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
    if (itemsIDs.some(i => i.id === newItem.id)) {
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

    setItems(items => {
      const newItems = items.filter(i => i.id !== itemID)
      saveSession(newItems, null)
      return newItems
    })
    setItemsIDs(itemsIDs => {
      const newItemsIDs = itemsIDs.filter(i => i.id !== itemID)
      saveSession(null, newItemsIDs)
      return newItemsIDs
    })
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
    // Remove the items that the user has purchased from the cart
    if (coursesPurchased) {
      itemsIDs.map(({id: itemID}) => {
        if (!itemID.startsWith(COURSE_PREFIX)) {
          return
        }
        const userPurchasedThis = coursesPurchased.some(({ course }) => {
          const idToCompare = itemID.replace(COURSE_PREFIX, "")
          return course.id.toString() === idToCompare
        })

        if (userPurchasedThis) {
          // console.log(`User purchased ${itemID}`)
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
    <CartContext.Provider
      value={{
        items,
        itemsIDs,
        add,
        remove,
        clean
      }}
    >
      {props.children}
    </CartContext.Provider>
  )
}

export default CartContext

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
        data: data["cart"]
      }
    }
  }
  return {}
}

interface IDataCart {
  items: IItem[] | null;
  itemsIDs: IItemID[] | null;
}
const saveSession = (items: IItem[] | null, itemsIDs: IItemID[] | null) => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    let data: any = {}
    if (dataStr) {
      data = JSON.parse(dataStr)
    }

    const defaultDataCart: IDataCart = {
      items: null,
      itemsIDs: null,
    }
    const newDataCart: IDataCart = data.cart || defaultDataCart
    if (items !== null) {
      newDataCart.items = items
    }
    if (itemsIDs !== null) {
      newDataCart.itemsIDs = itemsIDs
    }
    localStorage.setItem("data", JSON.stringify({
      ...data,
      cart: newDataCart
    }))
  }
}

const cleanSession = () => {
  if (typeof(Storage) !== undefined) {
    const dataStr = localStorage.getItem("data")
    if (dataStr) {
      const data = JSON.parse(dataStr)
      delete data["cart"]
      localStorage.setItem("data", JSON.stringify(data))
    }
  }
}
