import { useContext, useState, useEffect } from "react"

import AuthContext from "../../context/AuthContext"
import CartContext, { IItem, COURSE_PREFIX } from "../../context/CartContext"

interface AddButtonProps {
  item: IItem
}

const AddToCartButton = ({ item }: AddButtonProps) => {
  const { user } = useContext(AuthContext)
  const { itemsIDs, add, remove } = useContext(CartContext)

  const [added, setAdded] = useState<boolean>(itemsIDs.some(({id}) => id === item.id))

  const addToCart = () => {
    add(item)
    setAdded(true)
  }
  const removeFromCart = () => {
    remove(item)
    setAdded(false)
  }
  // Este hook cambia el valor del estado "agregado" a false si se ha quitado
  // este articulo desde el carrito de compras.
  useEffect(() => {
    let prefix = ""
    if (item.kind === "course") {
      prefix = COURSE_PREFIX
    }
    setAdded(itemsIDs.some(({id}) => id === `${prefix}${item.id}`))
  }, [itemsIDs, item.id, item.kind])
  if (!user) {
    return <p className="mb-0 small">Login to purchase this course</p>
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

export default AddToCartButton
