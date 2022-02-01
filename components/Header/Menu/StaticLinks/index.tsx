import { useContext } from "react"

import BasketButton from "../../../BasketButton";
import AuthContext from "../../../../context/AuthContext";
import LoginContext, {ACTION_LOGIN, ACTION_SIGNUP} from "../../../../context/LoginContext";

import { Mobile, Desktop } from "./Account"

const StaticLinks = () => {
  const { user, loginUser: login } = useContext(AuthContext)
  const { openModal, closeModal } = useContext(LoginContext)
  const iniciar = () => {
    openModal(ACTION_LOGIN)
  }
  const registrar = () => {
    openModal(ACTION_SIGNUP)
  }
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
              className="btn btn-primary mt-1 mb-2 my-lg-0"
              onClick={iniciar}
            >
              Login
            </button>
          </li>
          <li className="nav-item d-flex align-items-center ms-lg-2">
            <button
              className="btn btn-secondary mt-1 mb-2 my-lg-0"
              onClick={registrar}
            >
              Register
            </button>
          </li>
        </>
      }
      <li className="nav-item d-md-none">
        <BasketButton />
      </li>
    </>
  )
}

export default StaticLinks
