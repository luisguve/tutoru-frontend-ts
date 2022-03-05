import { useContext } from "react"
import Link from 'next/link'

import { IEjercicioSummary } from "../../lib/content"
import MyLearningContext from "../../context/MyLearningContext"
import { STRAPI } from "../../lib/urls"
import AddButton from '../AddButton'
import styles from "../../styles/ListaCurso.module.scss"
import { useEjercicioComprado } from "../../hooks/item"

interface EjercicioSummaryProps {
  data: IEjercicioSummary;
  gotoSolution?: boolean;
  onPage?: boolean;
  displayDescription?: boolean;
  displayImage?: boolean;
}

const EjercicioSummary = (props: EjercicioSummaryProps) => {
  const { data, gotoSolution, onPage, displayImage, displayDescription } = props
  const { category } = data
  const imgUrl = `${STRAPI}${data.thumbnail[0].url}`

  const solucionUrl = `/${category.slug}/${data.slug}`
  const linkToSolution = (
    <Link href={solucionUrl}>
      <a className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center">Descargar solución</a>
    </Link>
  )
  const linkToCategory = (
    <Link href={`/${category.slug}`}>
      <a className="btn btn-sm btn-primary my-1">{category.title}</a>
    </Link>
  )

  const { loadingItems } = useContext(MyLearningContext)
  const ejercicioComprado = useEjercicioComprado(data.id)

  return (
    <div key={data.slug} className="d-flex flex-column align-items-start">
      <div className="d-flex flex-wrap align-items-center">
        <h5 className="me-3 mb-1">
          {
            onPage ?
              data.title
            : (
              <Link href={solucionUrl}>
                <a>{data.title}</a>
              </Link>
            )
          }
        </h5>
        {linkToCategory}
      </div>
      {
        (onPage || displayDescription) && <p>{data.description}</p>
      }
      {
        displayImage && (
          <div className="d-flex align-items-center my-2">
            <img className="img-flud mw-100" src={imgUrl} alt={data.thumbnail[0].name} />
          </div>
        )
      }
      {
        (!ejercicioComprado && !gotoSolution) && (
          <p className="small m-0"><strong>${data.price}</strong></p>
        )
      }
      <div className="d-flex flex-column flex-sm-row align-self-stretch align-self-lg-start">
        <div className={"d-flex align-items-center ".concat(styles.botones)}>
          {
            !onPage && (
              <Link href={solucionUrl}>
                <a className="btn btn-sm btn-outline-primary me-2 py-2 d-flex align-items-center justify-content-center">Ver ejercicio</a>
              </Link>
            )
          }
          {
            (gotoSolution || ejercicioComprado) ?
            linkToSolution : <AddButton item={data} />
          }
        </div>
      </div>
    </div>
  )
}

export default EjercicioSummary
