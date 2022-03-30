import { createContext, useState, useContext, useEffect } from "react"
import AuthContext from "./AuthContext"
import { STRAPI } from "../lib/urls"

interface IClassesCompleted {
  classesCompleted: {id: number}[];
}

type ClassesCompleted = {id: number}[];

interface IPlaylistContext {
  classesCompleted: ClassesCompleted;
  setCourseID: (_: number) => void;
  toggleClassCompleted: (_: number) => void;
}

const defaultContext: IPlaylistContext = {
  classesCompleted: [],
  setCourseID: () => {},
  toggleClassCompleted: () => {},
}

const PlaylistContext = createContext<IPlaylistContext>(defaultContext)

export interface PlaylistProviderProps {
  children: React.ReactNode;
  courseID: number | null;
}

export const PlaylistProvider = (props: PlaylistProviderProps) => {
  const [classesCompleted, setClassesCompleted] = useState<ClassesCompleted>([])
  const [courseID, setCourseID] = useState<number | null>(props.courseID)
  const [loading, setLoading] = useState<boolean>(false)

  const { user } = useContext(AuthContext)

  const fetchClassesCompleted = async (courseID: number) => {
    if (!user) {
      return
    }
    setLoading(true)
    try {
      const cursoUrl = `${STRAPI}/api/masterclass/course-details/${courseID}`
      const options: RequestInit = {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      }
      const data_res = await fetch(cursoUrl, options)
      const data = await data_res.json()
      if (!data_res.ok) {
        throw data
      }
      setClassesCompleted(data.classesCompleted)
    } catch (err) {
      console.log("Could not fetch classes completed")
      console.log(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    if (user && courseID !== null) {
      fetchClassesCompleted(courseID)
    }
  }, [courseID, user])

  const toggleClassCompleted = (lectureID: number) => {
    const classCompletedIdx = classesCompleted.findIndex(c => c.id === lectureID)
    if (classCompletedIdx !== -1) {
      setClassesCompleted(data => {
        const part1 = data.slice(0,classCompletedIdx)
        const part2 = data.slice(classCompletedIdx+1)
        
        return part1.concat(part2)
      })
    } else {
      const newList = classesCompleted.concat({id: lectureID})
      setClassesCompleted(newList)
    }
  }

  return (
    <PlaylistContext.Provider
      value={{
        classesCompleted,
        setCourseID,
        toggleClassCompleted
      }}>
      {props.children}
    </PlaylistContext.Provider>
  )
}

export default PlaylistContext
