import { useContext } from "react"
import { toast } from "react-toastify"
import Link from 'next/link'
import formatDuration from "format-duration"

import AuthContext from "../context/AuthContext"
import { Ilecture } from "../lib/content"
import { STRAPI } from "../lib/urls"
import AddButton from './AddButton'
import styles from "../styles/PaginaCurso.module.scss"
import { useCoursePurchased, useClassesCompleted } from "../hooks/item"

interface CourseLecturesProps {
  data: Ilecture[],
  courseID: number
}
export const CourseLectures = (props: CourseLecturesProps) => {
  const { user } = useContext(AuthContext)
  const { data, courseID } = props
  const coursePurchased = useCoursePurchased(courseID)
  const { classesCompleted } = useClassesCompleted(courseID)

  return (
    <ol className="list-unstyled">
      {
        data.map((lecture, idx) => {
          let classCompleted = false
          if (coursePurchased && classesCompleted) {
            classCompleted = classesCompleted.some(({id}) => id === lecture.id)
          }
          const checkLecture = async (e: any) => {
            e.stopPropagation()
            if (!user) {
              return
            }
            const url = `${STRAPI}/api/masterclass/courses/${courseID}/check-lecture?lecture=${lecture.id}`
            const options = {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            }
            try {
              const res= await fetch(url, options)
              if (!res.ok) {
                toast("Could not check lecture")
              }
            } catch(err) {
              console.log(err)
            }
          }
          return (
            <li
              className={"px-2 d-flex align-items-center ".concat(idx !== data.length - 1 ? "border-bottom" : "")}
              key={lecture.id}
            >  
              {
                (user && coursePurchased) &&
                <input
                  type="checkbox"
                  className={"me-1 ".concat(styles.checkbox)}
                  onClick={checkLecture}
                  defaultChecked={classCompleted ? true : undefined}
                />
              }
              <span className="me-1 me-sm-2 me-md-5">{idx + 1}.</span>
              <div className="pt-3">
                <p className="mb-0 small" style={{wordBreak: "break-all"}}>{lecture.title}</p>
                <p className="small">{formatDuration(lecture.video.duration * 1000)}</p>
              </div>
            </li>
          )
        })
      }
    </ol>
  )
}

interface CourseLecturesRepProps {
  lectures: Ilecture[];
  changeLecture: (lectureID?: number) => Promise<void>;
  currentLectureID: number | null;
  courseID: number;
  classesCompleted: Ilecture[];
}
export const CourseLecturesRep = (props: CourseLecturesRepProps) => {
  const {
    lectures,
    changeLecture,
    currentLectureID,
    courseID,
    classesCompleted
  } = props
  const { user } = useContext(AuthContext)
  return (
    <ol className="list-unstyled">
      {
        lectures.map((lecture, idx) => {
          const completed = classesCompleted.some(l => l.id === lecture.id)
          const isCurrent = currentLectureID === lecture.id
          let classCurrent = styles["no-video-actual"]
          if (isCurrent) {
            classCurrent = "bg-dark text-light"
          }
          const handleClick = () => {
            if (!user) {
              return
            }
            if (isCurrent) {
              return
            }
            changeLecture(lecture.id)
          }
          const marcarVisto = async e => {
            e.stopPropagation()
            if (!user) {
              return
            }
            const url = `${STRAPI}/api/masterclass/courses/${courseID}/check-lecture?lecture=${lecture.id}`
            const options = {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            }
            try {
              const res= await fetch(url, options)
              if (!res.ok) {
                throw new Error(await res.json())
              }
            } catch(err) {
              console.log(err)
            }
          }
          return (
            <li
              className={"px-2 border-top d-flex align-items-center ".concat(classCurrent)}
              key={lecture.id}
              onClick={handleClick}
            >
              <input
                type="checkbox"
                className={"me-1 ".concat(styles.checkbox)}
                onClick={marcarVisto}
                defaultChecked={completed || undefined}
              />
              <span className="me-1 me-sm-2">{idx + 1}.</span>
              <div className="pt-3">
                <p className="mb-0 small" style={{wordBreak: "break-all"}}>{lecture.title}</p>
                <p className="small">{formatDuration(lecture.video.duration*1000)}</p>
              </div>
            </li>
          )
        })
      }
    </ol>
  )
}

