import { createContext, useEffect, useContext, useState } from "react"

import AuthContext from "./AuthContext"

export type authAction = "LOGIN" | "SIGNUP"

export const ACTION_LOGIN: authAction = "LOGIN"
export const ACTION_SIGNUP: authAction = "SIGNUP"

interface IContextState {
  isOpen: boolean,
  action: authAction,
  openModal: (action: authAction) => void,
  closeModal: () => void
}

const defaultState: IContextState = {
  isOpen: false,
  action: ACTION_LOGIN,
  openModal: (action: authAction) => {},
  closeModal: () => {}
}

const LoginContext = createContext<IContextState>(defaultState)

interface LoginProviderProps {
  children: React.ReactNode
}

export const LoginProvider = (props: LoginProviderProps) => {
  const { user } = useContext(AuthContext)
  const [status, setStatus] = useState<{
    isOpen: boolean,
    action: authAction
  }>({
    isOpen: false,
    action: ACTION_LOGIN
  })
  useEffect(() => {
    if (user) {
      setStatus({
        isOpen: false,
        action: ACTION_LOGIN
      })
    }
  }, [user])

  const openModal = (action: authAction) => {
    setStatus({
      isOpen: true,
      action
    })
  }
  const closeModal = () => {
    setStatus({
      isOpen: false,
      action: ACTION_LOGIN
    })
  }

  return <LoginContext.Provider value={{
    isOpen: status.isOpen,
    action: status.action,
    openModal,
    closeModal
  }}>
    {props.children}
  </LoginContext.Provider>
}

export default LoginContext
