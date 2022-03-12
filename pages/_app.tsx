import type { AppProps } from 'next/app'

import { useEffect } from "react"
import { useRouter } from "next/router"

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

import '../styles/global.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from "../context/AuthContext"
import { MyLearningProvider } from "../context/MyLearningContext"
import { CartProvider } from "../context/CartContext"
import { LoginModal, SignupModal } from "../components/LoginModal"
import Cart from "../components/Cart"

import * as ga from '../lib/ga'

config.autoAddCss = false

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url)
    }
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
  useEffect(() => {
    typeof document !== undefined ? require('bootstrap/dist/js/bootstrap') : null
  }, [])
  return (
    <AuthProvider>
      <MyLearningProvider>
        <CartProvider>
          <Component {...pageProps} />
          <Cart />
          <LoginModal />
          <SignupModal />
        </CartProvider>
      </MyLearningProvider>
    </AuthProvider>
  )
}
