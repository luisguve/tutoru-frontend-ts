import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ToastContainer } from 'react-toastify';

import styles from '../styles/Layout.module.css'

import Footer from "./Footer"
import Header from "./Header"

interface BreadcrumbElement {
  url: string,
  name: string
}

interface ILayoutProps {
  children: React.ReactNode,
  title: string,
  subtitle: string,
  header: string,
  isHome?: boolean,
  breadCrumb?: Array<BreadcrumbElement>,
  isRepPage?: boolean
}

const Layout = (props: ILayoutProps) => {
  const {
    children,
    isHome,
    breadCrumb,
    title,
    subtitle,
    header,
    isRepPage
  } = props
  const router = useRouter()
  let containerClassname = styles.container
  if (isRepPage) {
    containerClassname += ` ${styles["container-rep"]}`
  } else {
    containerClassname += " px-2"
  }
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between">
      <div className="contenido">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Plataforma de cursos en línea de matemáticas, física y química"
          />
          <meta
            property="og:description"
            content="Plataforma de cursos en línea de matemáticas, física y química"
          />
          <meta property="og:locale" content="es_VE" />
          <meta property="og:title" content={header} />
          <meta property="og:url" content={"https://tutoruniversitario.netlify.app".concat(router.asPath)} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://tutoruniversitario.netlify.app/img/banner_principal.jpg" />
          <meta property="og:image" content="https://tutoruniversitario.netlify.app/img/banner_principal.jpg" />
        </Head>
        <Header
          isHome={isHome === true}
          title={title}
          header={header}
          subtitle={subtitle}
        />
        <div className="container-lg px-0 px-md-2">
          <ToastContainer />
          <Breadcrumb isHome={isHome} elements={breadCrumb} />
          <main className={containerClassname}>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Layout

interface IBreadcrumbProps {
  elements?: Array<BreadcrumbElement>,
  isHome?: boolean
}

const Breadcrumb = ({elements, isHome}: IBreadcrumbProps) => {
  const containerClass = "mt-3 mt-md-5 px-2 px-md-0 ms-1 ms-md-0 small"
  if (elements) {
    const links = elements.map((e, i) => {
      return (
        <span key={e.url + e.name}>
          {
            i < elements.length - 1 ?
            <Link href={e.url}>
              <a>{e.name}</a>
            </Link>
            :
            <strong>{e.name}</strong>
          }
          <span className="mx-1">{ i < elements.length - 1 && "»" }</span>
        </span>
      )
    })
    return (
      <div className={containerClass}>
        {links}
      </div>
    )
  }
  if (!isHome) {
    return (
      <div className={containerClass}>
        <Link href="/">
          <a>← Home</a>
        </Link>
      </div>
    )
  }
  return null
}
