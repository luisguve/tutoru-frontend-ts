import { useRouter } from "next/router"
import { toast } from "react-toastify"
import Head from "next/head"
import Link from "next/link"
import { useContext } from "react"

import AuthContext from "../context/AuthContext"
import Layout from '../components/Layout'
import EjercicioSummary from "../components/Category/EjercicioSummary"
import CourseSummary from "../components/Category/CourseSummary"
import { useOrder } from "../hooks/order"
import metadata, { INavigationItem, ISiteInfo } from "../lib/metadata"

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

interface StaticProps {
  navigation: INavigationItem[];
  siteInfo: ISiteInfo;
}
export const getStaticProps = async (): Promise<{props: StaticProps}> => {
  const navigation = await metadata.loadNavigation()
  const siteInfo = await metadata.loadSiteInfo()
  return {
    props: {
      navigation,
      siteInfo
    }
  }
}

const Payment = (props: StaticProps) => {

  const { navigation, siteInfo: {site_title} } = props

  const router = useRouter()
  const { token: checkout_session } = router.query
  const { order, loadingOrder } = useOrder(checkout_session)

  let coursesJSX: React.ReactNode[] | null = null;
  let ejerciciosJSX: React.ReactNode[] | null = null;
  if (order) {
    coursesJSX = order.courses.map(c => (
      <div className="mb-4" key={c.slug}>
        <CourseSummary data={c} displayImage gotoCourse />
      </div>
    ))
    ejerciciosJSX = order.ejercicios.map(e => (
      <div className="mb-4" key={e.slug}>
        <EjercicioSummary data={e} displayImage gotoSolution />
      </div>
    ))
  }

  return (
    <Layout
      title={site_title}
      breadCrumb={breadCrumb}
      header={"Payment confirmation"}
      navigation={navigation}
    >
      <div>
        <Head>
          <title>{site_title} | Payment Confirmation</title>
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
            <h4 className="mt-5 text-center fs-2">New learning</h4>
            {coursesJSX}
            {ejerciciosJSX}
            <Link href="/my-learning"><a>Ready to start learning?</a></Link>
          </>
        }
      </div>
    </Layout>
  )
}

export default Payment
