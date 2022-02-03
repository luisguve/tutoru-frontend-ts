import Layout from '../../components/Layout'
import CourseSummary from "../../components/CourseSummary"
import CourseLectures from "../../components/CourseLectures"
import { getCoursesSlugs, getCourseData, ICourseSummary } from "../../lib/content"

interface CoursePageProps {
  data: ICourseSummary
}


const CoursePage = (props: CoursePageProps) => {
  const { data } = props
  const breadCrumb = [
    {
      name: "home",
      url: "/"
    },
    {
      name: data.title,
      url: `/courses/${data.slug}`
    },
  ]
  return (
    <Layout
      title={data.title}
      subtitle="Course"
      header={`Tutor Universitario - ${data.title} Course`}
      breadCrumb={breadCrumb}
    >
      <CourseSummary onPage={true} data={data} />
      <h4 className="mt-5">Course Playlist</h4>
      <CourseLectures data={data.lectures} courseID={data.id} />
    </Layout>
  )
}

export default CoursePage

export async function getStaticPaths() {
  const paths = await getCoursesSlugs()
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
  const data = await getCourseData(slug)
  return {
    props: {
      data
    }
  }
}