import { useContext, useState, useEffect } from "react"

import BasketContext, { IItem } from "../context/BasketContext"

export interface IData {
  items: IItem[],
  total: string
}

// Este hook retorna los articulos en el carrito como una lista, junto con
// el precio total a pagar
export const useData = () => {
  const { items } = useContext(BasketContext)
  const [data, setData] = useState<IData | null>(null)

  useEffect(() => {
    const total = items.reduce((suma, articulo) => suma + articulo.price, 0)
    setData({
      items,
      total: total.toFixed(2)
    })
  }, [items])

  return { data }
}
