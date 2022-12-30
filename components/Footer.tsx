import { useContext } from "react"
import Link from "next/link"

import authContext from "../context/AuthContext"

const Footer = () => {
  const { user } = useContext(authContext)

  return (
    <footer className="py-4">
      {
        user &&
        <p className="user-info" style={{fontSize: 12}}>
          <Link href="/my-learning"><a className="text-white">Logged in as {user.email}</a></Link>
        </p>
      }
      <p className="m-0" style={{fontSize: 12}}>Tutor universitario - copyright 2021</p>
    </footer>
  )
}

export default Footer