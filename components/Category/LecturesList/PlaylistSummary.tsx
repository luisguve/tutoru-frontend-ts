import React, { useContext } from "react"
import { toast } from "react-toastify"
import formatDuration from "format-duration"

import AuthContext from "../../../context/AuthContext"
import PlaylistContext, { PlaylistProvider } from "../../../context/PlaylistContext"
import { Ilecture } from "../../../lib/content"
import { STRAPI } from "../../../lib/urls"
import styles from "../../../styles/PaginaCurso.module.scss"
import { useCoursePurchased } from "../../../hooks/item"

interface PlaylistSummaryProps {
  data: Ilecture[],
  courseID: number
}
const PlaylistSummary = (props: PlaylistSummaryProps) => {
  const { user } = useContext(AuthContext)
  const { data, courseID } = props
  const coursePurchased = useCoursePurchased(courseID)
  const { classesCompleted, toggleClassCompleted } = useContext(PlaylistContext)

  return (
    <ol className="list-unstyled">
      {
        data.map((lecture, idx) => {
          let completed = false
          if (coursePurchased) {
            completed = classesCompleted.some(({id}) => id === lecture.id)
          }
          const checkLecture = async (e: React.ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation()
            if (!user) {
              return
            }
            toggleClassCompleted(lecture.id)
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
                (user && coursePurchased) && (
                  <label className={styles["checkmark-container"]}>
                    <input
                      type="checkbox"
                      className={"me-1 ".concat(styles.checkbox)}
                      onChange={checkLecture}
                      checked={completed}
                    />
                    <span
                      className={styles["checkmark"]+(completed?` ${styles["checked"]}` : "")}
                    ></span>
                  </label>
                )
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

const PlaylistWrapper = (props: PlaylistSummaryProps) => {
  return (
    <PlaylistProvider courseID={props.courseID}>
      <PlaylistSummary {...props} />
    </PlaylistProvider>
  )
}

export default PlaylistWrapper