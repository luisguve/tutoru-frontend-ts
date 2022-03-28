import { useContext } from "react"
import Link from 'next/link'
import { ReviewStats } from "strapi-ratings-client"
import { CommentStats } from "strapi-comments-client"
import formatDuration from "format-duration"

import { ICourseSummary } from "../../lib/content"
import AuthContext from "../../context/AuthContext"
import { STRAPI } from "../../lib/urls"
import AddToCartButton from '../Cart/AddToCartButton'
import BuyNowButton from '../Cart/BuyNowButton'
import styles from "../../styles/ListaCurso.module.scss"
import { useCoursePurchased, useCourseDetails } from "../../hooks/item"

interface CourseSummaryProps {
  data: ICourseSummary;
  gotoCourse?: boolean;
  onPage?: boolean;
  hideDescription?: boolean;
  displayImage?: boolean;
}
const CourseSummary = (props: CourseSummaryProps) => {
  const { user } = useContext(AuthContext)
  const { data, gotoCourse, onPage, displayImage, hideDescription } = props
  const { category } = data
  const coursePurchased = useCoursePurchased(data.id)
  const { courseDetails, loadingDetails } = useCourseDetails(data.id)

  const imgPath = data.thumbnail[0].url
  let imgUrl = `${STRAPI}${imgPath}`
  if (imgPath.startsWith("http")) {
    // this is an absolute URL
    imgUrl = imgPath
  }

  const courseUrl = `/${category.slug}/course/${data.slug}`
  const linkToCourse = (
    <Link href={courseUrl.concat("/view")}>
      <a className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center">Go to course</a>
    </Link>
  )
  const linkToCategory = (
    <Link href={`/${category.slug}`}>
      <a className="btn btn-sm btn-primary my-1">{category.title}</a>
    </Link>
  )
  return (
    <div key={data.slug} className="d-flex flex-column align-items-start">
      <div className="d-flex flex-wrap align-items-center">
        <h5 className="me-3 mb-1">
          {
            onPage ?
              data.title
            : (
              <Link href={courseUrl}>
                <a>{data.title}</a>
              </Link>
            )
          }
        </h5>
        {linkToCategory}
      </div>
      {
        (!hideDescription) && <p>{data.description}</p>
      }
      {
        displayImage && (
          <div className="d-flex align-items-center">
            <img className="img-flud mw-100" src={imgUrl} alt={data.thumbnail[0].name} />
          </div>
        )
      }
      <p className="small m-0">Duration: {formatDuration(data.duration * 1000)}</p>
      <p className="small m-0">Lectures: {data.lectures.length}</p>
      <p className="small m-0">
        Students:{" "}
        {
          loadingDetails ? "Loading..." : courseDetails ? courseDetails.students : 0
        }
      </p>
      <ReviewStats slug={data.slug} apiURL={STRAPI} />
      <CommentStats slug={data.slug} apiURL={STRAPI} />
      {
        (!coursePurchased && !gotoCourse) && <p className="small m-0"><strong>${data.price}</strong></p>
      }
      <div className="d-flex flex-column align-self-stretch align-self-lg-start">
        <div className={"d-flex align-items-center ".concat(styles.botones)}>
          {
            !onPage && (
              <Link href={courseUrl}>
                <a className="btn btn-sm btn-outline-primary me-2 py-2 d-flex align-items-center justify-content-center">View course</a>
              </Link>
            )
          }
          {
            (gotoCourse || coursePurchased) ?
              linkToCourse
            : <AddToCartButton item={data} />
          }
        </div>
        {
          (user && !(gotoCourse || coursePurchased)) &&
          <div className="mt-1 mt-sm-1 d-flex flex-column">
            <BuyNowButton item={data} />
          </div>
        }
      </div>
    </div>
  )
}

export default CourseSummary
