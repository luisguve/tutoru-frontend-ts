import React from "react"

import { ICourseSummary, IEjercicioSummary } from "../../lib/content"
import CourseSummary from "./CourseSummary"
import EjercicioSummary from "./EjercicioSummary"

const nullCategory = {
  title: "Uncategorized",
  slug: "/"
}

interface ClassifiedItemsProps {
  ejercicios: IEjercicioSummary[] | null;
  courses: ICourseSummary[] | null;
}

const ClassifiedItems = (props: ClassifiedItemsProps) => {
  const { courses, ejercicios } = props
  if ((!courses || !courses.length) && (!ejercicios || !ejercicios.length)) {
    return (
      <h4 className="text-center">
        Here will appear your courses
      </h4>
    )
  }

  let classifiedItems: React.ReactNode[] = []

  let ejerciciosClasificados: Record<string, IEjercicioSummary[]> = {}
  let cursosClasificados: Record<string, ICourseSummary[]> = {}

  if (ejercicios) {
    ejerciciosClasificados = ejercicios.reduce((grupos, e) => {
      if (!e.category) {
        e.category = nullCategory
      }
      // Establece el nombre de la categoria para títulos
      const categoriaActual = e.category.title

      if (!grupos[categoriaActual]) {
        grupos[categoriaActual] = []
      }

      grupos[categoriaActual].push(e)
      return grupos
    }, ejerciciosClasificados)
  }
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

  for (const categoria in ejerciciosClasificados) {
    const muestras = ejerciciosClasificados[categoria]
    const grupoEjercicios = muestras.map(e => {
      return (
        <div className="mb-4" key={e.slug}>
          <EjercicioSummary data={e} gotoSolution displayImage />
        </div>
      )
    })
    let grupoCursos: React.ReactNode[] = []

    const totalEjs = ejerciciosClasificados[categoria].length

    let totalCursos = 0
    if (cursosClasificados[categoria]) {
      grupoCursos = cursosClasificados[categoria].map(c => {
        return (
          <div className="mb-4" key={c.slug}>
            <CourseSummary data={c} gotoCourse displayImage hideDescription />
          </div>
        )
      })
      totalCursos = cursosClasificados[categoria].length
      // Estos cursos vienen con ejercicios y ya estan siendo listados
      delete cursosClasificados[categoria]
    }
    const contenedorGrupo = (
      <div className="mt-2" key={categoria}>
        <h3 className="text-center">
          {categoria}: {totalEjs} ejercicio{totalEjs > 1 ? "s" : ""}
          {totalCursos ? `, ${totalCursos} course`+ (totalCursos > 1 ? "s" : "") : ""}
        </h3>
        {grupoEjercicios}
        {grupoCursos}
      </div>
    )
    classifiedItems.push(contenedorGrupo)
  }

  // Listar los cursos que vienen sin ejercicios
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
