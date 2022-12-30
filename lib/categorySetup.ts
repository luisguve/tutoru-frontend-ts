import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import categoriesIndex from "./categories"

import {
  buildIndex,
  buildBreadcrumb,
  ICourseSummary,
  ICategorySummary,
  getCategorySummary,
  getCourseSummary,
  indexCurrentCategory,
} from "./content"

import { BreadcrumbElement } from "../components/Layout"
import { ICategory } from "./categories"

import metadata, { INavigationItem, ISiteInfo } from "./metadata"

interface getCategoryDataProps {
  params: {
    page: string[];
  };
  slug?: string;
}

export interface ICategoryData {
  data: {
    summary: ICourseSummary | ICategorySummary;
  };
  index: ICategory;
  isCategory: boolean;
  isCourseRep: boolean;
  isCourse: boolean;
  breadcrumb: BreadcrumbElement[];
  navigation: INavigationItem[];
  siteInfo: ISiteInfo;
}
export const getCategoryData =
async ({ params, slug }: getCategoryDataProps): Promise<ICategoryData | null> => {

  const path = params.page || [slug]
  if (!slug) {
    return null
  }

  const navigation = await metadata.loadNavigation()
  const siteInfo = await metadata.loadSiteInfo()
  // const informacionSitio = await cargarInformacionSitio()

  // Indice para construir el breadcrumb y el contenido de cada seccion
  const index = await categoriesIndex.getBySlug(slug)

  // Indice de la categoria actual
  const { currentCategory, isCategory } = indexCurrentCategory(index, path)

  // Ver si estamos en una categoria y obtener su resumen.
  let summary: ICourseSummary | ICategorySummary
  // Sino, ver si estamos en la pagina de reproduccion de un curso
  // o en la pagina de presentación de un curso y obtener su título.
  let courseSlug: string = ""

  let isCourseRep = false
  let isCourse = false
  if (path.includes("course") && path.includes("view")) {
    isCourseRep = true
  } else if (path.includes("course")) {
    isCourse = true
  }
  if (isCategory) {
    summary = await getCategorySummary(currentCategory.slug)
    summary.kind = "category"
  } else {
    if (isCourseRep) {
      // path: [{category}, courses, {slug}, view]
      courseSlug = path[path.length - 2]
    } else {
      // path: [{category}, courses, {slug}]
      courseSlug = path[path.length - 1]
    }
    summary = await getCourseSummary(courseSlug)
    summary.long_description = String(await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(summary.long_description || ""))
    summary.kind = "course"
  }

  // Elementos del componente breadcrumb
  const {
    breadcrumb,
    // tituloCabecera,
    // metaSubtitulo
  } = await buildBreadcrumb(index, path)

  return {
    data: {
      summary
    },
    index: currentCategory,
    isCategory,
    isCourseRep,
    isCourse,
    breadcrumb,
    navigation,
    siteInfo
  }
}

interface getCategoryPathsProps {
  slug?: string;
}
export async function getCategoryPaths({slug}: getCategoryPathsProps) {
  if (!slug) {
    return
  }
  const root = await categoriesIndex.getBySlug(slug)

  const base = [
    {params: {page: []}},
    // Indexar las paginas de los cursos pertenecientes a la seccion raiz
    ...(root.courses.map(c => ({params: { page: [c.slug] } }))),
    // Indexar las paginas de reproducción de los cursos
    ...(root.courses.map(c => ({params: { page: [c.slug, "view"] } }))),
  ]

  const index = root.subcategories.reduce((index, subcategory) => {
    const subIndex = buildIndex({
      parentUrl: [],
      root: subcategory
    })
    return [...index, ...subIndex]
  }, base)

  return {
    paths: index
  }
}
