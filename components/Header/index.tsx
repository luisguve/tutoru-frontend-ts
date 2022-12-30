import { useEffect } from "react"
import Link from "next/link"

import styles from "../../styles/Header.module.scss"

import Menu from "./Menu"

import { INavigationItem } from "../../lib/metadata"

interface IHeaderProps {
  isHome: boolean;
  title: string;
  subtitle?: string;
  header?: string;
  navigation: INavigationItem[];
}
const Header = (props: IHeaderProps) => {
  const { isHome, title, subtitle, header, navigation } = props
  return (
    <>
      <header className={styles.Header}>
        {isHome ? (
          <HeaderHome title={title} subtitle={subtitle} />
        ) : (
          <HeaderPage title={header || title} />
        )}
      </header>
      <Navbar title={title} navigation={navigation} />
    </>
  )
}

export default Header

interface HeaderHomeProps {
  title: string;
  subtitle?: string;
}
const HeaderHome = (props: HeaderHomeProps) => {
  return (
    <div className={styles.Header__Inicio}>
      <Content {...props} />
    </div>
  )
}

interface HeaderPageProps {
  title: string;
}
const HeaderPage = (props: HeaderPageProps) => {
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
      <h1 className="my-1 text-center">{title}</h1>
      {
        subtitle &&
        <em>{subtitle}</em>
      }
    </div>
  )
}

interface NavbarProps {
  title: string;
  navigation: INavigationItem[];
}

const Navbar = (props: NavbarProps) => {
  const { title, navigation } = props

  useEffect(() => {
    // close all inner dropdowns when parent is closed
    if (window && window.innerWidth < 992) {

      document.querySelectorAll('.navbar .dropdown').forEach(function(everydropdown){
        everydropdown.addEventListener('hidden.bs.dropdown', function () {
          // after dropdown is hidden, then find all submenus
          document.querySelectorAll('.submenu').forEach(function(everysubmenu){
            // hide every submenu as well
            everysubmenu.classList.add("oculto")
          })
        })
      })
    }
  }, [])

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <Link href="/"><a className="navbar-brand">{title}</a></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main_nav"  aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="main_nav">
          <Menu navigation={navigation} />
        </div>
      </div>
    </nav>
  )
}
