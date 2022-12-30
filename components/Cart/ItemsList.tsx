import React, { useContext } from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import CartContext, { IItem } from "../../context/CartContext"
import { IData } from "../../hooks/cart"

export interface ItemsListProps {
  data: IData | null;
  editable?: boolean;
}

const ItemsList = (props: ItemsListProps): React.ReactElement | null => {
  const { data, editable } = props
  const { remove } = useContext(CartContext)

  if (!data || !data.items.length) {
    return null
  }
  const btnRemove = (item: IItem) => {
    return (
      <FontAwesomeIcon
        className="btn text-danger" icon={faTrashCan} onClick={() => remove(item)}
      />
    )
  }
  const list = data.items.map(item => {
    const label = item.kind === "course" ? item.title : `${item.category.title} - ${item.title}`
    return (
      <tr key={item.slug}>
        <th scope="row">${item.price}</th>
        <td className="small mb-0">{label}</td>
        {editable && <td className="py-0">{btnRemove(item)}</td>}
      </tr>
    )
  })
  return (
    <table className="table align-middle">
      <thead>
        <tr>
          <th scope="col">Price</th>
          <th scope="col">Name</th>
          {editable && <th scope="col">Edit</th>}
        </tr>
      </thead>
      <tbody>
        {list}
      </tbody>
    </table>
  )
}

export default ItemsList