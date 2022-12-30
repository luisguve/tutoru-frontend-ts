import React from "react"

import { ICourseSummary } from "../../lib/content"
import CourseSummary from "./CourseSummary"

const nullCategory = {
  title: "Uncategorized",
  slug: "/"
}

interface ClassifiedItemsProps {
  courses: ICourseSummary[] | null;
}

const ClassifiedItems = (props: ClassifiedItemsProps) => {
  const { courses } = props
  if ((!courses || !courses.length)) {
    return (
      <h4 className="text-center">
        Here will appear your courses
      </h4>
    )
  }

  let classifiedItems: React.ReactNode[] = []

  let cursosClasificados: Record<string, ICourseSummary[]> = {}

  if (courses) {
    cursosClasificados = courses.reduce((grupos, c) => {
      if (!c.category) {
        c.category = nullCategory
      }
      // Establece el nombre de la categoria para títulos
      const categoriaActual = c.category.title

      if (!grupos[categoriaActual]) {
        grupos[categoriaActual] = []
      }

      grupos[categoriaActual].push(c)
      return grupos
    }, cursosClasificados)
  }


  // Listar los cursos
  for (const categoria in cursosClasificados) {
    const grupoCursos = cursosClasificados[categoria].map(c => {
      return (
        <div className="mb-4" key={c.slug}>
          <CourseSummary data={c} gotoCourse displayImage hideDescription />
        </div>
      )
    })
    const totalCursos = cursosClasificados[categoria].length
    const contenedorGrupo = (
      <div className="mt-2" key={categoria}>
        <h3 className="text-center">
          {`${categoria}: ${totalCursos} course`+ (totalCursos > 1 ? "s" : "")}
        </h3>
        {grupoCursos}
      </div>
    )
    classifiedItems.push(contenedorGrupo)
  }

  return (
    <>
      <h2 className="text-center mb-3">Your learning</h2>
      {classifiedItems}
    </>
  )
}

export default ClassifiedItems
