import { STRAPI } from "./urls"
import { ICategory, ICourse } from "./categories"
import { BreadcrumbElement } from "../components/Layout"

/*
* Lecture data structure
*/
export interface Ilecture {
  id: number;
  title: string;
  video: {
    duration: number
  }
}
export interface IThumbnail {
  id: number;
  name: string;
  url: string;
}
export interface ICourseSummary {
  id: number;
  title: string;
  duration: number;
  description: string;
  long_description: string;
  price: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: IThumbnail[];
  lectures: Ilecture[];
  category: {
    slug: string;
    title: string;
  };
  kind: "course";
}
export interface ICoursesRes {
  courses: ICourseSummary[];
}
export interface ICategoriesRes {
  categories: ICategorySummary[];
}
export interface ISlugsRes {
  courses: {slug: string;}[];
}

export interface ICategorySummary {
  id: number;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: IThumbnail[];
  courses: ICourseSummary[];
  featured_courses: ICourseSummary[];
  ejercicios: IEjercicioSummary[];
  featured_ejercicios: IEjercicioSummary[];
  courses_count: number;
  ejercicios_count: number;
  subcategories: ICategorySummary[];
  kind: "category";
}

export interface IEjercicioSummary {
  id: number;
  title: string;
  description: string;
  price: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: IThumbnail[];
  category: {
    slug: string;
    title: string;
  };
  kind: "ejercicio";
}

interface ICategorySummaryRes {
  category: ICategorySummary;
}
/**
* Fetches the category's data.
*/
export async function getCategorySummary(slug: string): Promise<ICategorySummary> {
  const url = `${STRAPI}/api/masterclass/categories/${slug}`
  const summary_res = await fetch(url)
  const summary: ICategorySummaryRes = await summary_res.json()

  return summary.category
}

/**
* Obtiene el resumen del ejercicio
*/
export async function getEjercicioSummary(slug: string): Promise<IEjercicioSummary> {
  const url = `${STRAPI}/api/masterclass/ejercicios/${slug}`
  const summary_res = await fetch(url)
  const summary: IEjercicioSummary = await summary_res.json()

  return summary
}

/**
* Fetches the data for all the categories.
*/
export async function getCategoriesSummary(): Promise<ICategoriesRes> {
  const url = `${STRAPI}/api/masterclass/categories/index`
  const summary_res = await fetch(url)
  const summary: ICategoriesRes = await summary_res.json()

  return summary
}

/**
* Fetches the course's data.
*/
export async function getCourseSummary(slug: string) {
  const url = `${STRAPI}/api/masterclass/courses/${slug}`
  const summary_res = await fetch(url)
  const summary: ICourseSummary = await summary_res.json()

  return summary
}

/**
* Fetches the courses' data.
*/
export async function getCoursesSummary() {
  const url = `${STRAPI}/api/masterclass/courses`
  const summary_res = await fetch(url)
  const summary: ICoursesRes = await summary_res.json()

  return summary
}

interface IPath {
  params: {
    slug: string[]
  }
}
export async function getCoursesSlugs(): Promise<IPath[]> {
  const url = `${STRAPI}/api/masterclass/courses-slugs`
  const data_res = await fetch(url)
  const data: ISlugsRes = await data_res.json()

  const slugsPaths = data.courses.reduce((pathsList, {slug}) => {
    const path1 = {
      params: {
        slug: [slug]
      }
    }
    const path2 = {
      params: {
        slug: [slug, "view"]
      }
    }
    return pathsList.concat([path1, path2])
  }, [] as IPath[])

  return slugsPaths
}

export async function getCourseData(slug: string) {
  const url = `${STRAPI}/api/masterclass/courses/${slug}`
  const summary_res = await fetch(url)
  const summary: ICourseSummary = await summary_res.json()

  return summary
}

interface ITree {
  parentUrl: string[];
  root: ICategory;
}
interface ITreeItem {
  params: {
    page: string[];
  };
}
export function buildIndex({parentUrl, root}: ITree) {
  const result: ITreeItem[] = []
  const page = [...parentUrl, root.slug]
  const urlPage = {
    params: { page }
  }
  result.push(urlPage)
  root.courses.map(c => {
    const coursePage: ITreeItem = {
      params: {
        page: [...page, "course", c.slug]
      }
    }
    const courseRepPage: ITreeItem = {
      params: {
        page: [...page, "course", c.slug, "view"]
      }
    }
    result.push(coursePage, courseRepPage)
  })
  root.ejercicios.map(e => {
    const ejercicioPage: ITreeItem = {
      params: {
        page: [...page, e.slug]
      }
    }
  })
  root.subcategories.map(subcategory => {
    const subIndex =  buildIndex({
      parentUrl: page,
      root: subcategory
    })
    result.push(...subIndex)
  })
  return result
}

interface ResultCurrentCategory {
  currentCategory: ICategory;
  isCategory: boolean;
}
/**
* Retorna el indice de la categoria indicado por path.
* Retorna null si no se encuentra el indice que corresponde a path o
* en su defecto, si la ruta es de la pagina de un curso.
*/
export const indexCurrentCategory = (index: ICategory, path: string[]): ResultCurrentCategory => {
  const page = path[path.length - 1]

  if (index.slug === page) {
    // Estamos en la raiz de la seccion
    return {
      currentCategory: index,
      isCategory: true
    }
  }

  // No estamos en la raiz de la seccion

  // Navega recursivamente por el indice siguiendo la ruta de la pagina
  let currentCategory = index
  const eachHijo = (coll: ICategory[]): ResultCurrentCategory => {
    for (let i = 0; i < coll.length; i++) {
      const category = coll[i]

      if (path.includes(category.slug)) {
        currentCategory = category
        // Ruta correcta
        if (category.slug === page) {
          // Indice de categoria encontrado
          return {
            currentCategory,
            isCategory: true,
          }
        }
        // Seguir buscando en las subcategorias
        return eachHijo(category.subcategories)
      }
    }
    // Indice no encontrado
    return {
      currentCategory,
      isCategory: false
    }
  }
  return eachHijo(index.subcategories)
}

interface IBreadcrumbComponent {
  name: string;
  url: string;
}

interface IBuildBreadcrumb {
  breadcrumb: BreadcrumbElement[];
  metaSubtitulo: string;
  tituloCabecera: string;
}

/**
* Construye el breadcrumb de acuerdo a la ruta y el indice recibido.
*/
export const buildBreadcrumb = (index: ICategory, path: string[]): IBuildBreadcrumb => {
  const home = {
    name: "home",
    url: "/",
  }
  const root = {
    name: index.title,
    url: "/" + index.slug
  }
  const breadcrumb = [home, root]

  let metaSubtitulo = index.title
  let tituloCabecera = index.title

  const page = path[path.length - 1]

  if (index.slug === page) {
    // Estamos en la raiz de la categoria
    return {
      breadcrumb,
      metaSubtitulo,
      tituloCabecera,
    }
  }

  // No estamos en la raiz de la seccion
  const pages: IBreadcrumbComponent[] = []

  // Navega recursivamente por el index siguiendo la ruta de la pagina
  let currentCategory = index
  const eachHijo = (coll: ICategory[]) => {
    let found = false
    for (let i = 0; i < coll.length; i++) {
      const category = coll[i]

      if (path.includes(category.slug)) {
        // Ruta correcta
        currentCategory = category
        metaSubtitulo += ` - ${category.title}`
        tituloCabecera = category.title

        let base
        if (!pages.length) {
          base =  `/${index.slug}`
        } else {
          base = pages[pages.length - 1].url
        }
        const newUrl = `${base}/${category.slug}`

        pages.push({
          name: category.title,
          url: newUrl,
        })

        // Navegar por las subcategorias hasta dar con la ultima pagina
        eachHijo(category.subcategories)
        // No seguir en este nivel
        found = true
        break
      }
    }

    if (!found) {
      // En este punto la pagina no fue encontrada en este nivel del index, lo cual
      // puede significar que estamos en la pagina de un curso.
      if (path.includes("course")) {
        let courseSlug = ""
        if (path.includes("view")) {
          courseSlug = path[path.length - 2]
        } else {
          courseSlug = page
        }
        const course = currentCategory.courses.find(c => c.slug === courseSlug)
        if (!course) {
          return
        }
        let base
        if (!pages.length) {
          base =  `/${index.slug}`
        } else {
          base = pages[pages.length - 1].url
        }
        let newUrl = `${base}/course/${page}`
        let lastBreadcrumbElement: BreadcrumbElement = {
          name: course.title,
          url: newUrl
        }
        if (path.includes("view")) {
          newUrl = `${base}/course/${path[path.length - 2]}`
          lastBreadcrumbElement.url = newUrl
          pages.push(lastBreadcrumbElement)
          lastBreadcrumbElement = {
            name: "View",
            url: `${newUrl}/view`
          }
        }
        pages.push(lastBreadcrumbElement)
      } else {
        // La ruta no incluye course - esta pagina es de un ejercicio
        const ejercicio = currentCategory.ejercicios.find(c => c.slug === page)
        if (!ejercicio) {
          return
        }
        let base
        if (!pages.length) {
          base =  `/${index.slug}`
        } else {
          base = pages[pages.length - 1].url
        }
        let lastBreadcrumbElement: BreadcrumbElement = {
          name: ejercicio.title,
          url: `${base}/${page}`
        }
        pages.push(lastBreadcrumbElement)
      }
    }
  }
  eachHijo(index.subcategories)

  breadcrumb.push(...pages)

  return {
    breadcrumb,
    metaSubtitulo,
    tituloCabecera
  }
}
