import Layout from '../../components/Layout'
import CourseSummary from "../../components/CourseSummary"
import { CourseLectures } from "../../components/CourseLectures"
import { getCoursesSlugs, getCourseData, ICourseSummary } from "../../lib/content"
import CourseRep from "../../components/CourseRep"

interface CoursePageProps {
  data: ICourseSummary,
  isPageRep: boolean
}

const CoursePage = (props: CoursePageProps) => {
  const { data, isPageRep } = props
  let component = (
    <>
      <CourseSummary onPage={true} data={data} />
      <h4 className="mt-5">Course Playlist</h4>
      <CourseLectures data={data.lectures} courseID={data.id} />
    </>
  )
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
  if (isPageRep) {
    breadCrumb.push({
      name: "View",
      url: `/courses/${data.slug}`
    })
    component = <CourseRep lectures={data.lectures} courseTitle={data.title} courseID={data.id} />
  }
  return (
    <Layout
      title={data.title}
      subtitle="Course"
      header={`Tutor Universitario - ${data.title} Course`}
      isPageRep={isPageRep}
      breadCrumb={breadCrumb}
    >
    {component}
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
    slug: string[]
  }
}
export async function getStaticProps(props: PropsGetStaticProps): Promise<{props: CoursePageProps}> {
  const { params: { slug } } = props
  const isPageRep = slug.includes("view")
  const data = await getCourseData(slug[0])
  return {
    props: {
      data,
      isPageRep
    }
  }
}
