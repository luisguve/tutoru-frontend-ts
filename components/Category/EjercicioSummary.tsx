import { useContext, useState, useEffect } from "react"
import Link from 'next/link'

import { IEjercicioSummary } from "../../lib/content"
import AuthContext from "../../context/AuthContext"
import { STRAPI } from "../../lib/urls"
import AddToCartButton from '../Cart/AddToCartButton'
import styles from "../../styles/ListaCurso.module.scss"
import { useEjercicioComprado } from "../../hooks/item"


const DownloadModalBody = ({count, slug}: {count: number, slug: string}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const { user } = useContext(AuthContext)
  useEffect(() => {
    const requestDownloadUrl = async (slug: string) => {
      if (!user) {
        return
      }
      const url = `${STRAPI}/api/masterclass/ejercicios/${slug}/download`
      const options = {
        headers: { Authorization: `Bearer ${user.token}` }
      }
      try {
        setFailed(false)
        const data = await fetch(url, options)
        const res = await data.json()
        const { signedUrl } = res
        if (!data.ok || !signedUrl) {
          throw res
        }
        setFileUrl(signedUrl)
      } catch(err) {
        console.log("Failed to request download URL")
        console.log(err)
        setFailed(true)
      }
    }
    if ((count > 0) && !fileUrl) {
      requestDownloadUrl(slug)
    }
  }, [count,fileUrl,slug,user])
  if (!fileUrl) {
    return (
      <>
        {
          failed ?
          <div className="alert alert-danger" role="alert">
            La descarga falló
          </div>
          :
          <p>Generando link de descarga. Espera un momento...</p>
        }
      </>
    )
  }
  return (
    <a className="btn btn-success" href={fileUrl} download>Descargar solución</a>
  )
}

interface EjercicioSummaryProps {
  data: IEjercicioSummary;
  gotoSolution?: boolean;
  onPage?: boolean;
  displayDescription?: boolean;
  hideDownloadButtton?: boolean;
  displayImage?: boolean;
}

const EjercicioSummary = (props: EjercicioSummaryProps) => {
  // This counter will start at 0, which means that the modal has not been opened
  const [count, setCount] = useState<number>(0)
  const {
    data,
    onPage,
    gotoSolution,
    displayImage,
    displayDescription,
    hideDownloadButtton
  } = props
  const { category } = data
  const imgPath = data.thumbnail[0].url
  let imgUrl = `${STRAPI}${imgPath}`
  if (imgPath.startsWith("http")) {
    // this is an absolute URL
    imgUrl = imgPath
  }

  const solucionUrl = `/${category.slug}/${data.slug}`
  const openDownloadModal = (
    <button
      type="button"
      className="btn btn-sm btn-success py-2 d-flex align-items-center justify-content-center"
      data-bs-toggle="modal"
      data-bs-target="#downloadModal"
      onClick={() => setCount(count+1)}
    >
      Descargar solución
    </button>
  )
  const modal = (
    <div
      className="modal fade"
      id="downloadModal"
      tabIndex={-1}
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Descargar {data.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <DownloadModalBody count={count} slug={data.slug} />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              data-bs-dismiss="modal"
            >Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
  const linkToCategory = (
    <Link href={`/${category.slug}`}>
      <a className="btn btn-sm btn-primary my-1">{category.title}</a>
    </Link>
  )

  const ejercicioComprado = useEjercicioComprado(data.id)

  return (
    <div key={data.slug} className="d-flex flex-column align-items-start">
      <div className="d-flex">
        {
          !displayImage && (
            <div className="d-flex d-lg-none me-1">
              <img src={imgUrl} />
            </div>
          )
        }
        <div className="d-flex flex-wrap align-items-start align-items-lg-center">
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
            !hideDownloadButtton &&  (<>
              {openDownloadModal}{modal}
            </>)
            :
            <AddToCartButton item={data} />
          }
        </div>
      </div>
    </div>
  )
}

export default EjercicioSummary
