import Head from 'next/head'
import Link from 'next/link'

import Layout from '../components/Layout'
import AddButton from '../components/AddButton'
import { getCoursesSummary, ICourseSummary } from "../lib/content"
import { STRAPI } from "../lib/urls"
import { useCoursePurchased } from "../hooks/item"
import styles from "../styles/ListaCurso.module.scss"

export async function getStaticProps() {
  const { courses } = await getCoursesSummary()
  return {
    props: {
      courses
    },
  }
}

interface CourseSummaryProps {
  data: ICourseSummary
}
const CourseSummary = (props: CourseSummaryProps) => {
  const { data } = props
  const coursePurchased = useCoursePurchased(data.id)
  const imgUrl = `${STRAPI}${data.thumbnail[0].url}`
  const courseUrl = `/course/${data.slug}`
  return (
    <div key={data.slug}>
      <h3>
        <Link href={courseUrl}>
          <a>{data.title}</a>
        </Link>
      </h3>
      <p className="m-0">{data.description}</p>
      <div className="d-flex align-items-center">
        <img className="img-flud mw-100" src={imgUrl} alt={data.thumbnail[0].name} />
      </div>
      <p className="m-0">Duration: {data.duration}s</p>
      <p className="m-0">Lectures: {data.lectures.length}</p>
      {
        !coursePurchased && <p className="m-0"><strong>${data.price}</strong></p>
      }
      <div className="d-flex flex-column flex-sm-row">
        <div className={"d-flex ".concat(styles.botones)}>
          <Link href={courseUrl}>
            <a className="btn btn-sm btn-outline-primary me-2 py-2 d-flex align-items-center justify-content-center">View course</a>
          </Link>
          {
            coursePurchased ?
              <Link href={courseUrl.concat("/view")}>
                <a className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center">Go to course</a>
              </Link>
            : <AddButton item={data} />
          }
        </div>
      </div>
    </div>
  )
}

interface HomeProps {
  courses: ICourseSummary[]
}
export default function Home(props: HomeProps) {
  const courses = props.courses.map(c => <CourseSummary data={c} key={c.slug} />)
  return (
    <Layout
      title="abc"
      subtitle="def"
      header="Tutor Universitario"
      isHome
    >
      <section className="p-1">
        <h1>LATEST COURSES</h1>
        {courses}
      </section>
    </Layout>
  )
}
