import Link from "next/link"
import { useRouter } from "next/router"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

import CourseSummary from "./CourseSummary"
import EjercicioSummary from "./EjercicioSummary"
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
    slug,
    title,
    courses,
    thumbnail,
    description,
    subcategories,
    courses_count,
    featured_courses,
    ejercicios_count,
    featured_ejercicios
  } = data

  const imgPath = thumbnail[0].url
  let imgUrl = `${STRAPI}${imgPath}`
  if (imgPath.startsWith("http")) {
    // this is an absolute URL
    imgUrl = imgPath
  }

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
        <p>{ejercicios_count} ejercicio{ejercicios_count === 1 ? "" : "s"}</p>
        <Subcategories data={subcategories} parentUrl={slug} fontSize={14} />
      </div>
    </div>
  )

  const totalCourses = courses.concat(featured_courses)

  const coursesSlides = totalCourses.map(c => {
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
  })

  const ejerciciosSlides = featured_ejercicios.map(e => {
    const imgUrl = `${STRAPI}${e.thumbnail[0].url}`
    return (
      <div className="d-flex flex-column flex-lg-row justify-content-between text-start" key={e.slug}>
        <div className={styles["slider-thumbnail"]+" d-flex align-items-center"}>
          <img src={imgUrl} alt={e.thumbnail[0].name} />
        </div>
        <div className={styles["slider-content"]+" pt-3 pt-lg-0 ps-lg-3 py-1"}>
          <EjercicioSummary data={e} displayDescription hideDownloadButtton />
        </div>
      </div>
    )
  })

  const slidesJSX = [firstSlide].concat([...coursesSlides, ...ejerciciosSlides])

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
    ejercicios,
    description,
    subcategories,
    featured_courses,
    featured_ejercicios
  } = data

  const totalCourses = courses.concat(featured_courses)
  const totalEjercicios = ejercicios.concat(featured_ejercicios)

  const totalCoursesJSX = totalCourses.map(c => (
    <div className="mb-4" key={c.slug}>
      <CourseSummary data={c} displayImage />
    </div>
  ))

  const totalEjerciciosJSX = totalEjercicios.map(e => (
    <div className="mb-4" key={e.slug}>
      <EjercicioSummary data={e} displayImage />
    </div>
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
      {
        (totalEjerciciosJSX.length > 0) ? totalEjerciciosJSX : (
          <p>No hay ejercicios en esta categoría</p>
        )
      }
    </>
  )
}

export default CategoryIndex
