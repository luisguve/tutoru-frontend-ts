import { useState, useEffect, useContext } from "react"

import AuthContext from "../context/AuthContext"
import MyLearningContext from "../context/MyLearningContext"
import { STRAPI } from "../lib/urls"

export const useCoursePurchased = (id: number) => {
  const [cursoComprado, setCursoComprado] = useState(false)
  const { coursesIDs } = useContext(MyLearningContext)

  useEffect(() => {
    // Verifica si el usuario adquirió el curso
    if (coursesIDs) {
      if (coursesIDs.some(c => c.course.id === id)) {
        setCursoComprado(true)
        return
      }
    }
    setCursoComprado(false)
  }, [coursesIDs, id])

  return cursoComprado
}

export const useClasesCompletadas = (id: number) => {
  const [clasesCompletadas, setClasesCompletadas] = useState([])
  const { user } = useContext(AuthContext)

  // Obtener las clases completadas
  useEffect(() => {
    const fetchCurso = async (id: number) => {
      if (!user) {
        return
      }
      try {
        const url = `${STRAPI}/masterclass/usuario-curso/${id}/clases-completadas`
        const options = {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        }
        const curso_res = await fetch(url, options)
        const data = await curso_res.json()
        setClasesCompletadas(data.clasesCompletadas)
      } catch (err) {
        console.log(err)
      }
    }
    fetchCurso(id)
  }, [id, user])
  return {
    clasesCompletadas
  }
}
