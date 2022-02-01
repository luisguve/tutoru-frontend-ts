import { useRouter } from "next/router"
import { toast } from "react-toastify"
import Head from "next/head"
import Link from "next/link"
import { useContext } from "react"

import AuthContext from "../context/AuthContext"
import Layout from '../components/Layout'
import { useOrder } from "../hooks/order"
// http://localhost:3000/payment?checkout_session=cs_test_a1KfzlP2iUPLojqlPnaX2UruxnGNiGV4h17H3ymOlok035umi0z6u12MAi
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
      isHome
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
            <p>You can get the history of your purchases in your <Link href="/cuenta"><a>account</a></Link></p>
          </>
        }
      </div>
    </Layout>
  )
}

export default Payment
