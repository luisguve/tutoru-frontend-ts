import Layout from '../../components/Layout'
import CourseSummary from "../../components/CourseSummary"
import CourseLectures from "../../components/CourseLectures"
import { getCoursesSlugs, getCourseData, ICourseSummary } from "../../lib/content"

interface CoursePageProps {
  data: ICourseSummary
}

const CoursePage = (props: CoursePageProps) => {
  const { data } = props
  return (
    <Layout
      title={data.title}
      subtitle="Course"
      header={`Tutor Universitario - ${data.title} Course`}
    >
      <CourseSummary data={data} />
      <CourseLectures data={data.lectures} courseID={data.id} />
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getCoursesSlugs()
  return {
    paths,
    fallback: false
  }
}

interface PropsGetStaticProps {
  params: {
    slug: string
  }
}
export async function getStaticProps(props: PropsGetStaticProps) {
  const { params: { slug } } = props
  const data = getCourseData(slug)
  return {
    props: {
      data
    }
  }
}