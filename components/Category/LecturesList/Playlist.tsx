import React, { useContext } from "react"
import formatDuration from "format-duration"

import AuthContext from "../../../context/AuthContext"
import { Ilecture } from "../../../lib/content"
import { STRAPI } from "../../../lib/urls"
import styles from "../../../styles/PaginaCurso.module.scss"

interface PlaylistProps {
  lectures: Ilecture[];
  changeLecture: (_?: number) => Promise<void>;
  currentLectureID: number | null;
  courseID: number;
  classesCompleted: Ilecture[];
}
const Playlist = (props: PlaylistProps) => {
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
          const marcarVisto = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                onChange={marcarVisto}
                defaultChecked={completed}
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

export default Playlist
