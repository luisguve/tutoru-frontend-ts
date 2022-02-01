import { useEffect } from "react"
import Link from "next/link"

import styles from "../../styles/Header.module.scss"

import Menu from "./Menu"

interface IHeaderProps {
  isHome: boolean,
  title: string,
  subtitle: string,
  header: string
}

const Header = (props: IHeaderProps) => {
  const { isHome, title, subtitle, header } = props
  return (
    <>
      <header className={styles.Header}>
        {isHome ? (
          <HeaderHome title={title} subtitle={subtitle} />
        ) : (
          <HeaderPage title={header} />
        )}
      </header>
      <Navbar title={title} />
    </>
  )
}

export default Header

interface IHeaderHomeProps {
  title: string,
  subtitle: string,
}

interface IHeaderPageProps {
  title: string
}

const HeaderHome = (props: IHeaderHomeProps) => {
  return (
    <div className={styles.Header__Inicio}>
      <Content {...props} />
    </div>
  )
}
const HeaderPage = (props: IHeaderPageProps) => {
  return (
    <div className={styles.Header__Pagina}>
      <Content {...props} />
    </div>
  )
}

interface IContentProps {
  title: string,
  subtitle?: string
}
const Content = ({title, subtitle}: IContentProps) => {
  return (
    <div className={styles.Contenido}>
      <h1>{title}</h1>
      {
        subtitle &&
        <em>{subtitle}</em>
      }
    </div>
  )
}

const Navbar = ({ title }: {title: string}) => {
/*
  useEffect(() => {
    // close all inner dropdowns when parent is closed
    if (window.innerWidth < 992) {

      document.querySelectorAll('.navbar .dropdown').forEach(function(everydropdown){
        everydropdown.addEventListener('hidden.bs.dropdown', function () {
          // after dropdown is hidden, then find all submenus
          this.querySelectorAll('.submenu').forEach(function(everysubmenu){
            // hide every submenu as well
            everysubmenu.classList.add("oculto")
          })
        })
      })
    }
  }, [])
*/
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <Link href="/"><a className="navbar-brand">{title}</a></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main_nav"  aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="main_nav">
          <Menu />
        </div>
      </div>
    </nav>
  )
}
