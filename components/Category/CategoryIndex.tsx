import Link from "next/link"
import { useRouter } from "next/router"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

import CourseSummary from "./CourseSummary"
import { ICategorySummary } from "../../lib/content"
import { STRAPI } from "../../lib/urls"
import Subcategories from "./Subcategories"
import styles from "../../styles/Category.module.scss"
import thumbnailStyles from "../../styles/ListaCurso.module.scss"

interface CategorySummaryProps {
  data: ICategorySummary;
  displayLink?: boolean;
}
export const CategorySummary = (props: CategorySummaryProps) => {
  const { data, displayLink } = props
  const {
    slug,
    title,
    courses,
    thumbnail,
    description,
    subcategories,
    courses_count,
    featured_courses,
  } = data

  const imgPath = thumbnail[0].url
  let imgUrl = `${STRAPI}${imgPath}`
  if (imgPath.startsWith("http")) {
    // this is an absolute URL
    imgUrl = imgPath
  }

  const firstSlide = (
    <div
      key={slug}
      className="d-flex flex-column"
    >
      <div
        className="d-flex flex-column flex-lg-row justify-content-between text-start"
      >
        <div className={styles["slider-thumbnail"]+" d-none d-lg-flex align-items-center"}>
          <img src={imgUrl} alt={thumbnail[0].name} />
        </div>
        <div className="d-flex">
          <div className="d-lg-none me-1">
            <img src={imgUrl} alt={thumbnail[0].name} className={thumbnailStyles["carousel-thumbnail-small"]} />
          </div>
          <div
            className={
              styles["slider-content"]+" d-flex flex-column align-items-start pt-lg-3 ps-lg-3"
           }>
            <p>{description}</p>
            <p className="m-0">{courses_count} course{courses_count === 1 ? "" : "s"}</p>
          </div>
        </div>
      </div>
      <Subcategories data={subcategories} parentUrl={slug} fontSize={14} />
    </div>
  )

  const totalCourses = courses.concat(featured_courses)

  const coursesSlides = totalCourses.map(c => {
    const imgPath = c.thumbnail[0].url
    let imgUrl = `${STRAPI}${imgPath}`
    if (imgPath.startsWith("http")) {
      // this is an absolute URL
      imgUrl = imgPath
    }
    return (
      <div
        key={c.slug}
        className="d-flex flex-column flex-lg-row justify-content-between text-start"
      >
        <div className={styles["slider-thumbnail"]+" d-none d-lg-flex align-items-center"}>
          <img src={imgUrl} alt={c.thumbnail[0].name} />
        </div>
        <div className={styles["slider-content"]+" pt-3 pt-lg-0 ps-lg-3 py-1"}>
          <CourseSummary data={c} />
        </div>
      </div>
    )
  })


  const slidesJSX = [firstSlide].concat([...coursesSlides])

  return (
    <>
      <h2 className="text-center mb-lg-3">
        {
          displayLink ? <Link href={"/"+slug}><a>{title}</a></Link>
          : title
        }
      </h2>
      <Carousel
        interval={8000}
        autoPlay={false}
        infiniteLoop={false}
        showIndicators={false}
        showThumbs={false}
        swipeable={false}
      >
        {slidesJSX}
      </Carousel>
    </>
  )
}

interface CategoryIndexProps {
  data: ICategorySummary;
}
const CategoryIndex = ({ data }: CategoryIndexProps) => {
  const router = useRouter()
  const {
    title,
    courses,
    description,
    subcategories,
    featured_courses,
  } = data

  const totalCourses = courses.concat(featured_courses)

  const totalCoursesJSX = totalCourses.map(c => (
    <div className="mb-4" key={c.slug}>
      <CourseSummary data={c} displayImage />
    </div>
  ))

  return (
    <>
      <h1 className="text-center">{title}</h1>
      {
        (subcategories.length > 0) &&
        <div className="my-4">
          <Subcategories parentUrl={router.asPath} data={subcategories} />
        </div>
      }
      <p>{description}</p>
      {
        (totalCoursesJSX.length > 0) ? totalCoursesJSX : (
          <p>There are no courses in this category</p>
        )
      }
    </>
  )
}

export default CategoryIndex
