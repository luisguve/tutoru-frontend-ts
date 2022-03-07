import { useState, useContext, createRef } from "react"
import { toast } from 'react-toastify';

import AuthContext from "../context/AuthContext"
import styles from "../styles/Login.module.css"
import { STRAPI } from "../lib/urls"

interface FormInputsProps {
  close: () => void;
}
const RegisterForm = (props: FormInputsProps) => {
  const { loginUser } = useContext(AuthContext)
  const [sending, setSending] = useState(false)
  const [username, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const resetInputs = () => {
    setSending(false)
    setName("")
    setEmail("")
    setPassword("")
    setPassword2("")
    setMostrar(false)
  }
  const close = () => {
    resetInputs()
    props.close()
  }
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
      close()
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
  )
}
const LoginForm = (props: FormInputsProps) => {
  const { loginUser } = useContext(AuthContext)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const resetInputs = () => {
    setSending(false)
    setEmail("")
    setPassword("")
  }
  const close = () => {
    resetInputs()
    props.close()
  }
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
      close()
    })
    .catch(error => {
      toast("Invalid email or password")
      setSending(false)
    });
  }
  return (
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
  )
}

export const LoginModal = () => {
  return (
    <AuthModal
      headerLabel="Login to your account"
      headerLabelID="loginModalLabel"
      id="loginModal"
      FormInputs={LoginForm}
    />
  )
}
export const SignupModal = () => {
  return (
    <AuthModal
      headerLabel="Register on Tutor Universitario"
      headerLabelID="signupModalLabel"
      id="signupModal"
      FormInputs={RegisterForm}
    />
  )
}

interface AuthModalProps {
  headerLabel: string;
  headerLabelID: string;
  id: string;
  FormInputs: (props: FormInputsProps) => JSX.Element;
}
const AuthModal = (props: AuthModalProps) => {
  const { headerLabel, headerLabelID, id, FormInputs } = props
  let closeBtn: HTMLButtonElement | null = null
  return (
    <div
      className="modal fade"
      id={id}
      tabIndex={-1}
      aria-labelledby={headerLabelID}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={headerLabelID}>
              {headerLabel}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={btn => closeBtn = btn}
            ></button>
          </div>
          <div className="modal-body">
            <FormInputs close={() => closeBtn?.click()} />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              data-bs-dismiss="modal"
            >Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
