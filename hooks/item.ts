import { useState, useEffect, useContext } from "react"
import { toast } from "react-toastify"

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

interface ICourseDetails {
  classesCompleted: {id: string}[],
  students: number
}

export const useCourseDetails = (id: number) => {
  const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null)
  const [loadingDetails, setLoading] = useState(false)

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchDetails = async (id: number) => {
      setLoading(true)
      try {
        const cursoUrl = `${STRAPI}/api/masterclass/course-details/${id}`
        const options: RequestInit = {}
        if (user) {
          options.headers = {
            "Authorization": `Bearer ${user.token}`
          }
        }
        const details_res = await fetch(cursoUrl, options)
        const details = await details_res.json()
        setCourseDetails(details)
        if (!details_res.ok) {
          console.log({details})
          toast("Could not fetch course details")
        }
      } catch (err) {
        console.log(err)
        toast("Could not fetch course details")
      }
      setLoading(false)
    }
    fetchDetails(id)
  }, [id, user])

  return {
    courseDetails,
    loadingDetails
  }
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
