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
  students: number
}
interface IClassesCompleted {
  classesCompleted: {id: number}[]
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

export const useClassesCompleted = (id: number) => {
  const [data, setData] = useState<IClassesCompleted | null>(null)
  const [loadingClassesCompleted, setLoading] = useState(false)

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchClassesCompleted = async (id: number) => {
      if (!user) {
        return
      }
      setLoading(true)
      try {
        const cursoUrl = `${STRAPI}/api/masterclass/course-details/${id}`
        const options: RequestInit = {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        }
        const data_res = await fetch(cursoUrl, options)
        const data = await data_res.json()
        setData(data)
        if (!data_res.ok) {
          console.log({data})
          toast("Could not fetch classes completed")
        }
      } catch (err) {
        console.log(err)
        toast("Could not fetch classes completed")
      }
      setLoading(false)
    }
    fetchClassesCompleted(id)
  }, [id, user])

  return {
    classesCompleted: data ? data.classesCompleted : null,
    loadingClassesCompleted
  }
}
