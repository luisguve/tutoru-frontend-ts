import { useContext } from "react"

import CartButton from "../../../Cart/CartButton";
import AuthContext from "../../../../context/AuthContext";

import { Mobile, Desktop } from "./Account"

const StaticLinks = () => {
  const { user } = useContext(AuthContext)
  return (
    <>
      {
        user ?
        <>
          <Mobile />
          <Desktop />
        </>
        :
        <>
          <li className="nav-item d-flex align-items-center">
            <button
              type="button"
              className="btn btn-primary mt-1 mb-2 my-lg-0"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
            >
              Login
            </button>
          </li>
          <li className="nav-item d-flex align-items-center ms-lg-2">
            <button
              className="btn btn-secondary mt-1 mb-2 my-lg-0"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#signupModal"
            >
              Register
            </button>
          </li>
        </>
      }
      <li className="nav-item d-md-none">
        <CartButton />
      </li>
    </>
  )
}

export default StaticLinks
