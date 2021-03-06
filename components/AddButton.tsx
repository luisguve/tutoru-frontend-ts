import { useContext, useState, useEffect } from "react"

import AuthContext from "../context/AuthContext"
import BasketContext, { IItem } from "../context/BasketContext"

interface AddButtonProps {
  item: IItem
}

const AddButton = ({ item }: AddButtonProps) => {
  const { user } = useContext(AuthContext)
  const { itemsIDs, add, remove } = useContext(BasketContext)

  const [added, setAdded] = useState<boolean>(itemsIDs.some(({id}) => id === item.id))

  const addToCart = () => {
    add(item)
    setAdded(true)
  }
  const removeFromCart = () => {
    remove(item.id)
    setAdded(false)
  }
  // Este hook cambia el valor del estado "agregado" a false si se ha quitado
  // este articulo desde el carrito de compras.
  useEffect(() => {
    setAdded(itemsIDs.some(({id}) => id === item.id))
  }, [itemsIDs])
  if (!user) {
    return <p className="mb-0">Login to purchase this course</p>
  }
  return (
    added ?
      <button
        className="btn btn-sm btn-success py-2"
        onClick={removeFromCart}
      >Remove from the cart</button>
      :
      <button
        className="btn btn-sm btn-success py-2"
        onClick={addToCart}
      >Add to cart</button>
  )
}

export default AddButton
