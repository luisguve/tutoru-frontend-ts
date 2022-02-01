import { useState, useContext } from "react"
import Link from "next/link"
import Image from "next/image"

import profilePic from "../../../../public/profilepic2.png"
import AuthContext from "../../../../context/AuthContext"

export const Mobile = () => {
  const { logoutUser } = useContext(AuthContext)
  return (
    <>
      <li className="nav-item d-lg-none">
        <Link href="/cuenta">
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
      className={showClass.concat(" nav-item dropdown")}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <a
        href="#"
        id="cuentaDropdown"
        role="button"
        data-bs-toggle="dropdown"
        className={showClass.concat(" nav-link p-0 d-none d-lg-block")}
        aria-expanded={ariaExpanded}
      >
        <Image alt="profile" width="40" height="40" src={profilePic} />
      </a>
      <ul
        aria-labelledby="cuentaDropdown"
        className={showClass.concat(" dropdown-menu")}
      >
        <li>
          <Link href="/cuenta"><a className="dropdown-item">My learning</a></Link>
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