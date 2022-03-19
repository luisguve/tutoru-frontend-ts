import React from "react"
import Head from "next/head"

import Layout from "../Layout"
import { ICategoryData } from "../../lib/categorySetup"
import CoursePage from "./CoursePage"
import CourseRep from "./CourseRep"
import CategoryIndex from "./CategoryIndex"
import EjercicioSummary from "./EjercicioSummary"

interface CategoryPageProps {
  props: ICategoryData
}
const CategoryPage = ({props}: CategoryPageProps) => {
  const { data: {summary}, isCourseRep, breadcrumb, navigation, siteInfo } = props
  const { site_title } = siteInfo

  let component: React.ReactNode = <p>Unknown type of content</p>
  let header = summary.title
  switch (summary.kind) {
    case "course":
      if (isCourseRep) {
        component = <CourseRep data={summary} />
      } else {
        component = <CoursePage data={summary} />
      }
      header = `${summary.title} Course`
      break;
    
    case "category":
      component = <CategoryIndex data={summary} />
      break;
    case "ejercicio":
      component = <EjercicioSummary data={summary} onPage displayImage />
  }

  return (
    <Layout
      title={site_title}
      header={header}
      isPageRep={isCourseRep}
      breadCrumb={breadcrumb}
      navigation={navigation}
    >
    <Head>
      <title>{site_title} | {summary.title}</title>
    </Head>
    {component}
    </Layout>
  )
}

export default CategoryPage
