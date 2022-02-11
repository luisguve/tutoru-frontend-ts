import { useContext, useState, useEffect } from "react"
import Link from "next/link"
import Head from "next/head"

import { STRAPI } from "../lib/urls"
import AuthContext from "../context/AuthContext"
import Layout from "../components/Layout"
import { usePurchaseHistory } from "../hooks/history"
import CourseSummary from "../components/CourseSummary"

const breadCrumb = [
  {
    name: "home",
    url: "/"
  },
  {
    name: "My learning",
    url: "/my-learning"
  }
]

const MyLearning = () => {
  const { user, logoutUser } = useContext(AuthContext)

  const {
    orders, loadingOrders,
    learning: { courses }, loadingLearning
  } = usePurchaseHistory()

  if (!user) {
    return (
      <Layout
        title="Tutor Universitatio"
        subtitle="def"
        header="My learning"
        breadCrumb={breadCrumb}
      >
      <Head><title>Tutor Universitatio | My learning</title></Head>
      <h2 className="text-center">Login to see your courses</h2>
      </Layout>
    )
  }
  return (
    <Layout
      title="Tutor Universitatio"
      subtitle="def"
      header="My learning"
      breadCrumb={breadCrumb}
    >
      <Head><title>Tutor Universitatio | Mi cuenta</title></Head>
      <div>
        {
          <>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary px-2 py-0"
                onClick={() => logoutUser()}
              >salir</button>
            </div>
            <h5 className="text-center">Logged in as {user.username}</h5>
          </>
        }
        {
          loadingLearning ?
          <h4 className="text-center">
            Loading your courses...
          </h4>
          :
          (!courses || !courses.length) ?
            <h4 className="text-center">
              Here will appear your courses
            </h4>
          :
            <div className="my-5">
              <h2 className="text-center mb-3">Your learning</h2>
              {
                courses.map(({course:c}) => <CourseSummary data={c} key={c.slug} gotoCourse={true} />)
              }
            </div>
        }
        {
          loadingOrders ?
          <h4 className="text-center">
            Loading your order history...
          </h4>
          :
          (!orders || !orders.length) ?
            <h4 className="text-center">
              Here will appear your order history
            </h4>
          :
            <div className="my-5">
              <h2 className="text-center">Your order history</h2>
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
                {
                  orders.map(o => (
                    <tr key={o.id}>
                      <th scope="row">{o.id}</th>
                      <td>${o.total}</td>
                      <td>{(new Date(o.createdAt)).toLocaleDateString()}</td>
                      <td>{o.confirmed ? "confirmed" : "unconfirmed"}</td>
                    </tr>
                  )
                )}
                </tbody>
              </table>
            </div>
        }
      </div>
    </Layout>
  )
}

export default MyLearning