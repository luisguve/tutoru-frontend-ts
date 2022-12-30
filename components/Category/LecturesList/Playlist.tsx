import React, { useContext } from "react"

import formatDuration from "../../../lib/duration"
import AuthContext from "../../../context/AuthContext"
import PlaylistContext, { PlaylistProvider } from "../../../context/PlaylistContext"
import { IModule, Ilecture } from "../../../lib/content"
import { STRAPI } from "../../../lib/urls"
import styles from "../../../styles/PaginaCurso.module.scss"

interface PlaylistProps {
  modules: IModule[];
  courseID: number;
  playable?: boolean;
  changeLecture?: (_?: number) => Promise<void>;
  currentLectureID?: number | null;
}
const Playlist = (props: PlaylistProps) => {
  const {
    modules,
    changeLecture,
    currentLectureID,
    courseID,
    playable
  } = props

  return (
    <div className="accordion" id="playlist-summary-accordion">
      {
        modules.map((module, idx) => {

          let isCurrentModule: boolean = false

          if (currentLectureID !== null) {
            isCurrentModule = module.lectures.some(l => l.id === currentLectureID)
          }

          let startCountAt: number = 0
          for (let i = 0; i < idx; i++) {
            startCountAt += modules[i].lectures.length
          }

          return (
            <div className="accordion-item" key={`module-${module.id}`}>
              <h2 className="accordion-header" id={`playlist-accordion-header-${idx}`}>
                <button
                  className={"accordion-button" + (!isCurrentModule ? " collapsed" : "")}
                  aria-expanded={!isCurrentModule ? "false" : "true"}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#playlist-accordion-body-${idx}`}
                  aria-controls={`playlist-accordion-body-${idx}`}
                >
                  {module.title || `${idx+1}. Untitled module`} - {formatDuration(module.duration)}
                </button>
              </h2>
              <div
                id={`playlist-accordion-body-${idx}`}
                className={"accordion-collapse collapse" + (isCurrentModule ? " show" : "")}
                aria-labelledby={`playlist-accordion-header-${idx}`}
              >
                <div className="accordion-body p-0">
                  <ModuleLectures
                    playable={playable}
                    startCountAt={startCountAt}
                    lectures={module.lectures}
                    changeLecture={changeLecture}
                    currentLectureID={currentLectureID}
                    courseID={courseID}
                  />
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

interface ModuleLecturesProps {
  lectures: Ilecture[];
  courseID: number;
  playable?: boolean;
  changeLecture?: (_?: number) => Promise<void>;
  currentLectureID?: number | null;
  startCountAt: number;
}
const ModuleLectures = (props: ModuleLecturesProps) => {
  const {
    lectures,
    changeLecture,
    currentLectureID,
    courseID,
    playable,
    startCountAt
  } = props

  const { classesCompleted, toggleClassCompleted } = useContext(PlaylistContext)

  const { user } = useContext(AuthContext)

  return (
    <ol className="list-unstyled m-0">
      {
        lectures.map((lecture, idx) => {
          const completed = classesCompleted.some(l => l.id === lecture.id)
          const isCurrent = currentLectureID === lecture.id
          let classCurrent = playable ? styles["no-video-actual"] : ""
          if (isCurrent) {
            classCurrent = "bg-dark text-light"
          }
          const handleClick = () => {
            if (!user || !changeLecture) {
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
                throw new Error(await res.json())
              }
            } catch(err) {
              console.log(err)
            }
          }
          return (
            <li
              className={`${idx!==0?"border-top":""} px-2 d-flex align-items-center ${classCurrent}`}
              key={lecture.id}
              onClick={playable ? handleClick : undefined}
            >
              <label className={styles["checkmark-container"]} onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className={"me-1 ".concat(styles.checkbox)}
                  onChange={marcarVisto}
                  checked={completed}
                />
                <span
                  className={styles["checkmark"]+(completed?` ${styles["checked"]}` : "")}
                ></span>
              </label>
              <span className="me-1 me-sm-2">{startCountAt + idx + 1}.</span>
              <div className="pt-3 d-flex flex-column align-items-end flex-grow-1">
                <p className="mb-0 small" style={{wordBreak: "break-all"}}>{lecture.title}</p>
                <p className="small fst-italic fw-light">{formatDuration(lecture.video.duration)}</p>
              </div>
            </li>
          )
        })
      }
    </ol>
  )
}

const PlaylistWrapper = (props: PlaylistProps) => {
  return (
    <PlaylistProvider courseID={props.courseID}>
      <Playlist {...props} />
    </PlaylistProvider>
  )
}

export default PlaylistWrapper
