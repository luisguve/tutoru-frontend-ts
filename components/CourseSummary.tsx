import Link from 'next/link'
import { ReviewStats } from "strapi-ratings-client"
import { CommentStats } from "strapi-comments-client"

import { ICourseSummary } from "../lib/content"
import { STRAPI } from "../lib/urls"
import AddButton from './AddButton'
import styles from "../styles/ListaCurso.module.scss"
import { useCoursePurchased, useCourseDetails } from "../hooks/item"
import formatDuration from "format-duration"

interface CourseSummaryProps {
  data: ICourseSummary,
  gotoCourse?: boolean,
  onPage?: boolean
}
const CourseSummary = (props: CourseSummaryProps) => {
  const { data, gotoCourse, onPage } = props
  const coursePurchased = useCoursePurchased(data.id)
  const { courseDetails, loadingDetails } = useCourseDetails(data.id)
  const imgUrl = `${STRAPI}${data.thumbnail[0].url}`
  const courseUrl = `/courses/${data.slug}`
  const linkToCourse = (
    <Link href={courseUrl.concat("/view")}>
      <a className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center">Go to course</a>
    </Link>
  )
  return (
    <div key={data.slug}>
      <h3>
        {
          onPage ?
            data.title
          : (
            <Link href={courseUrl}>
              <a>{data.title}</a>
            </Link>
          )
        }
      </h3>
      <p className="m-0">{data.description}</p>
      <div className="d-flex align-items-center">
        <img className="img-flud mw-100" src={imgUrl} alt={data.thumbnail[0].name} />
      </div>
      <p className="m-0">Duration: {formatDuration(data.duration * 1000)}</p>
      <p className="m-0">Lectures: {data.lectures.length}</p>
      <p className="m-0">
        Students:{" "}
        {
          loadingDetails ? "Loading..." : courseDetails ? courseDetails.students : 0
        }
      </p>
      <ReviewStats slug={data.slug} apiURL={STRAPI} />
      <CommentStats slug={data.slug} apiURL={STRAPI} />
      {
        (!coursePurchased && !gotoCourse) && <p className="m-0"><strong>${data.price}</strong></p>
      }
      <div className="d-flex flex-column flex-sm-row">
        <div className={"d-flex align-items-center ".concat(styles.botones)}>
          {
            !onPage && (
              <Link href={courseUrl}>
                <a className="btn btn-sm btn-outline-primary me-2 py-2 d-flex align-items-center justify-content-center">View course</a>
              </Link>
            )
          }
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