import Head from 'next/head'

import Layout from '../components/Layout'
import { getCoursesSummary, ICourseSummary } from "../lib/content"
import { loadNavigation, INavigationItem } from "../lib/metadata"
import CourseSummary from "../components/Category/CourseSummary"

export async function getStaticProps() {
  const { courses } = await getCoursesSummary()
  const navigation = await loadNavigation()
  return {
    props: {
      courses,
      navigation
    }
  }
}

interface HomeProps {
  courses: ICourseSummary[];
  navigation: INavigationItem[];
}
export default function Home(props: HomeProps) {
  const courses = props.courses.map(c => <CourseSummary data={c} key={c.slug} />)
  return (
    <Layout
      title="abc"
      subtitle="def"
      header="Tutor Universitario"
      navigation={props.navigation}
      isHome
    >
      <section className="p-1">
        <h1>LATEST COURSES</h1>
        {courses}
      </section>
    </Layout>
  )
}
