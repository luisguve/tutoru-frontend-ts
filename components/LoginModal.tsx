import { useState, useContext } from "react"
import { toast } from 'react-toastify';

import LoginContext, { ACTION_LOGIN, ACTION_SIGNUP } from "../context/LoginContext"
import AuthContext from "../context/AuthContext"
import styles from "../styles/Login.module.css"
import { STRAPI } from "../lib/urls"

const RegisterForm = () => {
  const { loginUser } = useContext(AuthContext)
  const [sending, setSending] = useState(false)
  const [username, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const validInputs = () => {
    return username !== "" && email !== "" && password !== "" && password2 !== ""
  }
  const handleName = (e: React.FormEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }
  const handleEmail = (e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }
  const handlePassword = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
  }
  const handlePassword2 = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword2(e.currentTarget.value)
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validInputs()) {
      return
    }
    if (!(password === password2)) {
      toast("Both passwords must be equal")
      return
    }
    setSending(true)
    const url = `${STRAPI}/api/auth/local/register`
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    })
    .then(async res => {
      const data = await res.json()
      if (!res.ok) {
        throw data
      }
      return data
    })
    .then((data) => {
      loginUser({
        username,
        email,
        id: data.user.id,
        token: data.jwt
      })
      toast("Register successful")
    })
    .catch(data => {
      toast(data.error.message)
      setSending(false)
    });
  }
  let extraProps = {}
  if (!validInputs()) {
    extraProps = {
      disabled: "disabled"
    }
  }
  return (
    <div className="d-flex flex-column border rounded p-1 p-md-3">
      <h4 className="fs-5 text-center">Register</h4>
      <form className="d-flex flex-column" onSubmit={handleSubmit}>
        <label className="d-flex flex-column mb-2">
          Full name
          <input className="form-control" type="text" value={username} onChange={handleName} required />
        </label>
        <label className="d-flex flex-column mb-2">
          Email address
          <input className="form-control" type="email" value={email} onChange={handleEmail} required />
        </label>
        <label className="d-flex flex-column mb-2">
          Password
          <input className="form-control"
            type={mostrar ? "text" : "password"}
            value={password}
            onChange={handlePassword}
            required
          />
        </label>
        <label className="d-flex flex-column mb-2">
          Confirm password
          <input className="form-control"
            type={mostrar ? "text" : "password"}
            value={password2}
            onChange={handlePassword2}
            required
          />
        </label>
        <label className="d-flex">
          <input
            className="form-check me-1"
            type="checkbox"
            value={mostrar ? "checked" : undefined}
            onChange={() => setMostrar(!mostrar)}
          />
          View password
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={(!validInputs() || sending) ? true : false}
        >{sending ? "Please wait..." : "Register"}</button>
      </form>
    </div>
  )
}
const LoginForm = () => {
  const { loginUser } = useContext(AuthContext)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const validInputs = () => {
    return email !== "" && password !== ""
  }
  const handleEmail = (e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }
  const handlePassword = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validInputs) {
      return
    }
    setSending(true)
    const url = `${STRAPI}/api/auth/local`
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        identifier: email,
        password
      })
    })
    .then(async res => {
      const body = await res.json()
      if (!res.ok) {
        throw body
      }
      return body
    })
    .then((data) => {
      loginUser({
        username: data.user.username,
        email: data.user.email,
        id: data.user.id,
        token: data.jwt
      })
    })
    .catch(error => {
      toast("Invalid email or password")
      setSending(false)
    });
  }
  return (
    <div className="d-flex flex-column mt-3 border rounded p-1 p-md-3">
      <h4 className="fs-5 text-center">Login</h4>
      <form className="d-flex flex-column" onSubmit={handleSubmit}>
        <label className="d-flex flex-column mb-2">
          Email address
          <input className="form-control" type="email" value={email} onChange={handleEmail} required />
        </label>
        <label className="d-flex flex-column mb-2">
          Password
          <input className="form-control" type="password" value={password} onChange={handlePassword} required />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={(!validInputs() || sending) ? true : false}
        >{sending ? "Please wait..." : "Login"}</button>
      </form>
    </div>
  )
}
const LoginModal = () => {
  const { isOpen, action, closeModal } = useContext(LoginContext)
  if (!isOpen) {
    return null
  }
  const close = () => {
    closeModal()
  }
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button
          className={(styles.closeBtn).concat(" btn btn-secondary px-2 py-0")}
          onClick={close}
        >X</button>
        {
          (action === ACTION_LOGIN) ?
            <LoginForm />
          : <RegisterForm />
        }
      </div>
    </div>
  )
}

export default LoginModal