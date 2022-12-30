import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"

import { INavigationItem } from "../../../../lib/metadata"

interface DynamicLinksProps {
  navigation: INavigationItem[];
}

// Navigation tree
const DynamicLinks = (props: DynamicLinksProps) => {
  const { navigation } = props
  return (
    <>
      {
        navigation.map(item => <RenderMenuItem key={item.slug} item={item} depth={1} parentUrl="" />)
      }
    </>
  )
}

export default DynamicLinks


interface SubmenuLvl1Props {
  children: React.ReactNode;
  showClass: string;
}
const SubmenuLvl1 = (props: SubmenuLvl1Props): React.ReactElement | null => {
  const { children, showClass } = props
  if (!children) return null
  return (
    <ul className={showClass.concat(" dropdown-menu py-1")}>{children}</ul>
  )
}

interface SubmenuLvl2Props {
  item: INavigationItemData;
  children: React.ReactNode;
}
const SubmenuLvl2 = (props: SubmenuLvl2Props) => {
  const { item, children } = props
  const [className, setClass] = useState("dropdown-menu py-1 submenu oculto")
  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      <Link href={item.permalink || "#"}>
        <a className="dropdown-item padre py-2 pe-2">
          <span className="d-flex align-items-center justify-content-lg-between">
            <span
              className="content"
              aria-label={item.title}
            >{item.title}</span>
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

interface INavigationItemData extends INavigationItem {
  permalink?: string;
}
interface MenuItemData {
  item: INavigationItemData;
  depth: number;
  parentUrl: string;
}
// Renderiza el menu y los submenus recursivamente
const RenderMenuItem = (props: MenuItemData) => {
  const [ariaExpanded, setAriaExpanded] = useState(false)
  const [showClass, setShowClass] = useState("")
  const { item, depth, parentUrl } = props

  const { pathname } = useRouter()
  let submenuItems: React.ReactNode = null
  let permalink = `${parentUrl}/${item.slug}`
  if (item.slug === "#") {
    permalink = "#"
  }
  if (parentUrl === "#") {
    permalink = `/${item.slug}`
  }
  item.permalink = permalink
  if (item.subcategories.length > 0) {
    submenuItems = item.subcategories.map(item => (
      <RenderMenuItem key={item.slug} item={item} depth={depth + 1} parentUrl={permalink} />
    ))
  }
  if (depth >= 2) {
    if (!submenuItems) {
      return (
        <li key={item.slug}>
          <Link href={item.permalink}>
            <a
              className="dropdown-item py-2"
              aria-label={item.title}
            >
              {item.title}
            </a>
          </Link>
        </li>
      )
    }
    return (
      <li key={item.slug}>
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
  const showMenu = () => {
    if (!submenuItems) {
      return
    }
    setAriaExpanded(true)
    setShowClass("show")
  }
  const hideMenu = () => {
    if (!submenuItems) {
      return
    }
    setAriaExpanded(false)
    setShowClass("")
  }
  return (
    <li
      className={liClass}
      key={item.slug}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <Link href={item.permalink}>
        <a
          data-bs-toggle="dropdown"
          className={showClass.concat(" nav-link").concat(submenuItems ? " dropdown-toggle" : "")}
          aria-label={item.title}
          aria-expanded={ariaExpanded}
        >
          {item.title.toUpperCase()}
        </a>
      </Link>
      <SubmenuLvl1 showClass={showClass}>{submenuItems}</SubmenuLvl1>
    </li>
  )
}
