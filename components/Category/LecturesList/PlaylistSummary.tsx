import React, { useContext } from "react"
import { toast } from "react-toastify"

import formatDuration from "../../../lib/duration"
import AuthContext from "../../../context/AuthContext"
import PlaylistContext, { PlaylistProvider } from "../../../context/PlaylistContext"
import { IModule, Ilecture } from "../../../lib/content"
import { STRAPI } from "../../../lib/urls"
import styles from "../../../styles/PaginaCurso.module.scss"
import { useCoursePurchased } from "../../../hooks/item"

interface PlaylistSummaryProps {
  data: IModule[];
  courseID: number;
}
const PlaylistSummary = (props: PlaylistSummaryProps) => {
  const { data, courseID } = props
  return (
    <div className="accordion" id="playlist-summary-accordion">
      {
        data.map((module, idx) => (
          <div className="accordion-item" key={`module-${module.id}`}>
            <h2 className="accordion-header" id={`playlist-summary-accordion-header-${idx}`}>
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#playlist-summary-accordion-body-${idx}`} aria-expanded="false" aria-controls={`playlist-summary-accordion-body-${idx}`}>
                {module.title || `${idx+1}. Untitled module`} - {formatDuration(module.duration)}
              </button>
            </h2>
            <div id={`playlist-summary-accordion-body-${idx}`} className="accordion-collapse collapse" aria-labelledby={`playlist-summary-accordion-header-${idx}`}>
              <div className="accordion-body p-0">
                <ModuleLectures lectures={module.lectures} courseID={courseID} />
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

interface ModuleLecturesProps {
  lectures: Ilecture[];
  courseID: number;
}
const ModuleLectures = (props: ModuleLecturesProps) => {
  const { user } = useContext(AuthContext)
  const { lectures, courseID } = props
  const coursePurchased = useCoursePurchased(courseID)
  const { classesCompleted, toggleClassCompleted } = useContext(PlaylistContext)

  return (
    <ol className="list-unstyled m-0">
      {
        lectures.map((lecture, idx) => {
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
              className={"px-2 d-flex align-items-center ".concat(idx !== lectures.length - 1 ? "border-bottom" : "")}
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
                <p className="small">{formatDuration(lecture.video.duration)}</p>
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
