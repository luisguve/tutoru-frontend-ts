import Link from "next/link"
import { useRouter } from "next/router"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

import CourseSummary from "./CourseSummary"
import { ICategorySummary } from "../../lib/content"
import { STRAPI } from "../../lib/urls"
import Subcategories from "./Subcategories"
import styles from "../../styles/Category.module.scss"

interface CategorySummaryProps {
  data: ICategorySummary;
  displayLink?: boolean;
}
export const CategorySummary = (props: CategorySummaryProps) => {
  const { data, displayLink } = props
  const {
    courses,
    slug,
    featured_courses,
    title,
    description,
    thumbnail,
    courses_count,
    subcategories
  } = data

  const imgUrl = `${STRAPI}${thumbnail[0].url}`
  const firstSlide = (
    <div className="d-flex flex-column flex-lg-row justify-content-between text-start" key={slug}>
      <div className={styles["slider-thumbnail"]+" d-flex align-items-center"}>
        <img src={imgUrl} alt={thumbnail[0].name} />
      </div>
      <div
        className={
          styles["slider-content"]+" d-flex flex-column align-items-start pt-3 pt-lg-0 ps-lg-3 py-1"
       }>
        <p>{description}</p>
        <p>{courses_count} course{courses_count === 1 ? "" : "s"}</p>
        <Subcategories data={subcategories} parentUrl={slug} fontSize={14} />
      </div>
    </div>
  )

  const totalCourses = courses.concat(featured_courses)

  const slidesJSX = [firstSlide].concat(totalCourses.map(c => {
    const imgUrl = `${STRAPI}${c.thumbnail[0].url}`
    return (
      <div className="d-flex flex-column flex-lg-row justify-content-between text-start" key={c.slug}>
        <div className={styles["slider-thumbnail"]+" d-flex align-items-center"}>
          <img src={imgUrl} alt={c.thumbnail[0].name} />
        </div>
        <div className={styles["slider-content"]+" pt-3 pt-lg-0 ps-lg-3 py-1"}>
          <CourseSummary data={c} />
        </div>
      </div>
    )
  }))

  return (
    <>
      <h2 className="text-center mb-lg-3">
        {
          displayLink ? <Link href={"/"+slug}><a>{title}</a></Link>
          : title
        }
      </h2>
      <Carousel
        interval={7000}
        autoPlay={false}
        infiniteLoop={false}
        showIndicators={false}
        showThumbs={false}
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
    thumbnail,
    description,
    subcategories,
    featured_courses
  } = data

  const totalCourses = courses.concat(featured_courses)

  const totalCoursesJSX = totalCourses.map(c => (
    <CourseSummary data={c} key={c.slug} displayImage />
  ))

  return (
    <>
      <h1>{title}</h1>
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
