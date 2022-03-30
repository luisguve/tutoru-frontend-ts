import { useState, useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

import AuthContext from "../../../../context/AuthContext"

export const Mobile = () => {
  const { logoutUser } = useContext(AuthContext)
  return (
    <>
      <li className="nav-item d-lg-none">
        <Link href="/my-learning">
          <a className="nav-link">
            My learning
          </a>
        </Link>
      </li>
      <li className="nav-item d-lg-none">
        <button
          className="btn btn-secondary mt-1 mb-2 my-lg-0"
          onClick={() => logoutUser()}
        >
          Logout
        </button>
      </li>
    </>
  )
}

export const Desktop = () => {
  const [ariaExpanded, setAriaExpanded] = useState(false)
  const [showClass, setShowClass] = useState("")
  const showMenu = () => {
    setAriaExpanded(true)
    setShowClass("show")
  }
  const hideMenu = () => {
    setAriaExpanded(false)
    setShowClass("")
  }
  const { logoutUser } = useContext(AuthContext)
  return (
    <li
      className={showClass.concat(" nav-item dropdown d-none d-lg-block")}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <a
        href="#"
        id="cuentaDropdown"
        role="button"
        data-bs-toggle="dropdown"
        className={showClass.concat(" nav-link")}
        aria-expanded={ariaExpanded}
      >
        <FontAwesomeIcon icon={faUser} size="lg" />
      </a>
      <ul
        aria-labelledby="cuentaDropdown"
        className={showClass.concat(" dropdown-menu")}
      >
        <li>
          <Link href="/my-learning"><a className="dropdown-item">My learning</a></Link>
        </li>
        <li>
          <button
            className="btn btn-secondary mt-1 mb-2 my-lg-0 dropdown-item"
            onClick={() => logoutUser()}
          >
            Logout
          </button>
        </li>
      </ul>
    </li>
  )
}