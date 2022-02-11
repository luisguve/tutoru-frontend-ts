import { useRouter } from "next/router"
import { toast } from "react-toastify"
import Head from "next/head"
import Link from "next/link"
import { useContext } from "react"

import AuthContext from "../context/AuthContext"
import Layout from '../components/Layout'
import { useOrder } from "../hooks/order"

const breadCrumb = [
  {
    name: "home",
    url: "/"
  },
  {
    name: "Payment confirmation",
    url: "/payment"
  }
]

const Payment = () => {

  const router = useRouter()
  const { checkout_session } = router.query
  const { order, loadingOrder } = useOrder(checkout_session)

  return (
    <Layout
      title="abc"
      subtitle="def"
      breadCrumb={breadCrumb}
      header="Tutor Universitario"
    >
      <div>
        <Head>
          <title>Payment Confirmation</title>
        </Head>
        <>
          {
            !checkout_session ?
              <h1>Invalid checkout session</h1>
            :
              loadingOrder ? <h1>Confirming payment...</h1>
              :
              order ? <h1>Successful purchase!</h1> : (
                <div>
                  <h1>The payment could not be confirmed. Please contact support</h1>
                  <p>Payment ID: {checkout_session}</p>
                </div>
              )
          }
        </>
        { order &&
          <>
            <h4 className="mt-5 mb-2">Purchase summary</h4>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Total</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{order.id}</th>
                  <td>${order.total}</td>
                  <td>{(new Date(order.createdAt)).toLocaleDateString()}</td>
                  <td>{order.confirmed ? "confirmed" : "unconfirmed"}</td>
                </tr>
              </tbody>
            </table>
            <Link href="/my-learning"><a>Ready to start learning?</a></Link>
          </>
        }
      </div>
    </Layout>
  )
}

export default Payment
