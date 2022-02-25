import Layout from "../Layout"
import { ICategoryData } from "../../lib/categorySetup"
import CoursePage from "./CoursePage"
import CourseRep from "./CourseRep"
import CategoryIndex from "./CategoryIndex"

interface CategoryPageProps {
  props: ICategoryData
}
const CategoryPage = ({props}: CategoryPageProps) => {
  const { data: {summary}, isCourseRep, breadcrumb, navigation } = props
  let component: React.ReactNode = <p>Unknown type of content</p>
  let header = "Tutor Universitario"
  switch (summary.kind) {
    case "course":
      if (isCourseRep) {
        component = <CourseRep data={summary} />
      } else {
        component = <CoursePage data={summary} />
      }
      header = `Tutor Universitario - ${summary.title} Course`
      break;
    
    case "category":
      component = <CategoryIndex data={summary} />
      header = `Tutor Universitario - ${summary.title}`
      break;
  }

  return (
    <Layout
      title={summary.title}
      subtitle="Course"
      header={header}
      isPageRep={isCourseRep}
      breadCrumb={breadcrumb}
      navigation={navigation}
    >
    {component}
    </Layout>
  )
}

export default CategoryPage
