import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"

const SubmenuLvl1 = ({ children, showClass }) => {
  if (!children) return null
  return (
    <ul className={showClass.concat(" dropdown-menu py-1")}>{children}</ul>
  )
}

const SubmenuLvl2 = ({ item, children }) => {
  const [className, setClass] = useState("dropdown-menu py-1 submenu oculto")
  const toggleMenu = e => {
    e.stopPropagation()
    e.preventDefault()
    if (className.includes("oculto")) {
      setClass("dropdown-menu py-1 submenu")
    } else {
      setClass("dropdown-menu py-1 submenu oculto")
    }
  }
  return (
    <>
      <Link href={item.permalink}>
        <a className="dropdown-item padre py-2 pe-2">
          <span className="d-flex align-items-center justify-content-lg-between">
            <span
              className="content"
              aria-label={item.Aria_label || item.Titulo_normal}
            >{item.Titulo_normal}</span>
            <span className="flecha d-none d-lg-inline mx-1">&raquo;</span>
            <button
              className="btn btn-secondary ms-3 d-lg-none px-2 py-0"
              onClick={toggleMenu}
            >...</button>
          </span>
        </a>
      </Link>
      <ul className={className}>{children}</ul>
    </>
  )
}

// Renderiza el menu y los submenus recursivamente
const renderMenuItem = ({item, depth, parentUrl}) => {
  const { pathname } = useRouter()
  let submenuItems = null
  let permalink = `${parentUrl}/${item.Titulo_url}`
  if (item.Titulo_url === "#") {
    permalink = "#"
  }
  if (parentUrl === "#") {
    permalink = `/${item.Titulo_url}`
  }
  item.permalink = permalink
  if (item.hijos && item.hijos.length) {
    submenuItems = item.hijos.map(item => renderMenuItem({
      item,
      depth: depth + 1,
      parentUrl: permalink
    }))
  }
  if (depth >= 2) {
    if (!submenuItems) {
      return (
        <li key={item.Titulo_normal}>
          <Link href={item.permalink}>
            <a
              className="dropdown-item py-2"
              aria-label={item.Aria_label || item.Titulo_normal}
            >
              {item.Titulo_normal}
            </a>
          </Link>
        </li>
      )
    }
    return (
      <li key={item.Titulo_normal}>
        <SubmenuLvl2 item={item}>{submenuItems}</SubmenuLvl2>
      </li>
    )
  }
  let liClass = "nav-item"
  if (pathname === item.permalink) {
    liClass += " active"
  }
  if (submenuItems) {
    liClass += " dropdown"
  }
  const [ariaExpanded, setAriaExpanded] = useState(false)
  const [showClass, setShowClass] = useState("")
  const showMenu = (e) => {
    if (!submenuItems) {
      return
    }
    setAriaExpanded(true)
    setShowClass("show")
  }
  const hideMenu = (e) => {
    if (!submenuItems) {
      return
    }
    setAriaExpanded(false)
    setShowClass("")
  }
  return (
    <li
      className={liClass}
      key={item.Titulo_normal}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <Link href={item.permalink}>
        <a
          data-bs-toggle="dropdown"
          className={showClass.concat(" nav-link").concat(submenuItems ? " dropdown-toggle" : "")}
          aria-label={item.Aria_label || item.Titulo_normal}
          aria-expanded={ariaExpanded}
        >
          {item.Titulo_normal.toUpperCase()}
        </a>
      </Link>
      <SubmenuLvl1 showClass={showClass}>{submenuItems}</SubmenuLvl1>
    </li>
  )
}

// Items provenientes de Strapi
const DynamicLinks = props => {
  /*return navItems.map(item => renderMenuItem({
    item,
    depth: 1,
    parentUrl: ""
  }))*/
  return null
}

export default DynamicLinks