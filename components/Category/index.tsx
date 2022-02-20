import Layout from "../Layout"
import { ICategoryData } from "../../lib/categorySetup"
import { ICourseSummary, ICategorySummary } from "../../lib/content"
import CoursePage from "./CoursePage"
import CourseRep from "./CourseRep"
import CourseSummary from "./CourseSummary"

interface CategoryPageProps {
  props: ICategoryData
}
const CategoryPage = ({props}: CategoryPageProps) => {
  const { data: {summary}, isCourseRep, breadcrumb } = props
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
    >
    {component}
    </Layout>
  )
}

export default CategoryPage

interface CategoryIndexProps {
  data: ICategorySummary;
}

const CategoryIndex = ({ data }: CategoryIndexProps) => {
  const { courses, title, description, thumbnail } = data
  let coursesJSX: React.ReactNode = <p>There are no courses in this category</p>
  if (courses) {
    coursesJSX = courses.map(c => <CourseSummary data={c} key={c.slug} />)
  }
  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      {coursesJSX}
    </>
  )
}
