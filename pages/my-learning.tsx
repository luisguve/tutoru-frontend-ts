import { useContext, useState, useEffect } from "react"
import Link from "next/link"
import Head from "next/head"

import { STRAPI } from "../lib/urls"
import AuthContext from "../context/AuthContext"
import Layout from "../components/Layout"
import { usePurchaseHistory } from "../hooks/history"
import CourseSummary from "../components/Category/CourseSummary"
import ClassifiedItems from "../components/Category/ClassifiedItems"
import metadata, { INavigationItem, ISiteInfo } from "../lib/metadata"

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

const MyLearning = (props: StaticProps) => {
  const { user, logoutUser } = useContext(AuthContext)
  const { navigation, siteInfo: {site_title} } = props

  const {
    orders, loadingOrders,
    learning: { courses, ejercicios }, loadingLearning
  } = usePurchaseHistory()

  if (!user) {
    return (
      <Layout
        title={site_title}
        header="My learning"
        navigation={navigation}
        breadCrumb={breadCrumb}
      >
      <Head>
        <title>{site_title} | My learning</title>
      </Head>
      <h2 className="text-center">Login to see your courses</h2>
      </Layout>
    )
  }
  return (
    <Layout
      title="Tutor Universitatio"
      header="My learning"
      navigation={navigation}
      breadCrumb={breadCrumb}
    >
      <Head>
        <title>{site_title} | My learning</title>
      </Head>
      <div>
        {
          <>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary px-2 py-0"
                onClick={logoutUser}
              >logout</button>
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
            <ClassifiedItems courses={courses} ejercicios={ejercicios} />
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