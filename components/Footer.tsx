import { useContext, useState } from "react"
import Link from "next/link"

import authContext from "../context/AuthContext"

const Footer = () => {
  const { user } = useContext(authContext)

  return (
    <footer className="py-4">
      {
        user &&
        <p className="user-info small">
          <Link href="/my-learning"><a>Logged in as {user.email}</a></Link>
        </p>
      }
      <p className="m-0 fs-6">Tutor universitario - copyright 2021</p>
    </footer>
  )
}

export default Footer