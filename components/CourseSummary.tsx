import Link from 'next/link'

import { ICourseSummary } from "../lib/content"
import { STRAPI } from "../lib/urls"
import AddButton from './AddButton'
import styles from "../styles/ListaCurso.module.scss"
import { useCoursePurchased } from "../hooks/item"

interface CourseSummaryProps {
  data: ICourseSummary,
  gotoCourse?: boolean
}
const CourseSummary = (props: CourseSummaryProps) => {
  const { data, gotoCourse } = props
  const coursePurchased = useCoursePurchased(data.id)
  const imgUrl = `${STRAPI}${data.thumbnail[0].url}`
  const courseUrl = `/course/${data.slug}`
  const linkToCourse = (
    <Link href={courseUrl.concat("/view")}>
      <a className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center">Go to course</a>
    </Link>
  )
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
        (!coursePurchased && !gotoCourse) && <p className="m-0"><strong>${data.price}</strong></p>
      }
      <div className="d-flex flex-column flex-sm-row">
        <div className={"d-flex ".concat(styles.botones)}>
          <Link href={courseUrl}>
            <a className="btn btn-sm btn-outline-primary me-2 py-2 d-flex align-items-center justify-content-center">View course</a>
          </Link>
          {
            !gotoCourse ?
              coursePurchased ? linkToCourse : <AddButton item={data} />
            : linkToCourse
          }
        </div>
      </div>
    </div>
  )
}

export default CourseSummary