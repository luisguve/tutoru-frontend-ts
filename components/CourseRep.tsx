import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"

import { Ilecture } from "../lib/content"

import MyLearningContext from "../context/MyLearningContext"
import AuthContext from "../context/AuthContext"
import { useCoursePurchased } from "../hooks/item"
import { STRAPI } from "../lib/urls"
import Aliplayer from "../components/Aliplayer"
import { CourseLecturesRep } from "./CourseLectures"

interface CourseRepProps {
  courseID: number,
  courseTitle: string,
  lectures: Ilecture[]
}

interface IErrData {
  msg: string,
  lectureID?: number
}
interface IDataRep {
  currentLectureID: number,
  PlayAuth: string,
  VideoId: string,
  classesCompleted: Ilecture[]
}

const CourseRep = (props: CourseRepProps) => {
  const { courseID, courseTitle, lectures } = props
  const [loading, setLoading] = useState(false)
  const [dataRep, setDataRep] = useState<IDataRep | null>(null)
  const [errData, setErrData] = useState<IErrData | null>(null)
  const router = useRouter()
  const { coursesIDs, loadingItems } = useContext(MyLearningContext)
  const coursePurchased = useCoursePurchased(courseID)
  const { user } = useContext(AuthContext)
  const fetchDataRep = async (lectureID?: number) => {
    if (!user) {
      return
    }
    setLoading(true)
    let url = ""
    if (lectureID) {
      url = `${STRAPI}/api/masterclass/courses/${courseID}/play-lecture?lecture=${lectureID}`
    } else {
      url = `${STRAPI}/api/masterclass/courses/${courseID}/resume-course`
    }
    const options: RequestInit = {
      headers: { Authorization: `Bearer ${user.token}` }
    }
    try {
      setErrData(null)
      const resData = await fetch(url, options)
      const data = await resData.json()
      if (!resData.ok) {
        throw data
      }
      setDataRep(data)
    } catch(err) {
      console.log("catch error:", err)
      setErrData({
        msg: "Could not load lecture",
        lectureID
      })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const hasAccess = loadingItems || coursePurchased === null || coursePurchased
    if (!(user && hasAccess)) {
      router.push(router.asPath.replace("/view", ""))
      return
    }
    if (coursePurchased && !dataRep) {
      fetchDataRep()
    }
  }, [loadingItems, coursePurchased, user])
  return (
    <div>
     <Head>
       <link rel="stylesheet" href="https://g.alicdn.com/de/prismplayer/2.9.16/skins/default/aliplayer-min.css" />
     </Head>
      {
        <div className="row mx-0 justify-content-end">
          <div className="col-12">
            <h1 className="fs-2">{courseTitle}</h1>
          </div>
          <div className="col-lg-8 px-0 px-md-2" style={{minHeight: 500}}>
            {
              (loading || loadingItems) ?
                <div className="bg-dark d-flex flex-column align-items-center justify-content-center h-100">
                  <h3 className="text-light">Loading...</h3>
                </div>
              : errData ?
                <div className="bg-dark d-flex flex-column align-items-center justify-content-center h-100">
                  <h5 className="text-danger">{errData.msg}</h5>
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchDataRep(errData.lectureID)}
                  >Load again</button>
                </div>
              : dataRep &&
                <>
                  <Reproductor
                    PlayAuth={dataRep.PlayAuth}
                    VideoId={dataRep.VideoId}
                  />
                  <VideoMetadata
                    lectures={lectures}
                    current={dataRep.currentLectureID}
                  />
                </>
            }
          </div>
          <div className="col-lg-4">
            <CourseLecturesRep
              lectures={lectures}
              changeLecture={fetchDataRep}
              currentLectureID={dataRep ? dataRep.currentLectureID : null}
              courseID={courseID}
              classesCompleted={dataRep ? dataRep.classesCompleted : []}
            />
          </div>
        </div>
      }
    </div>
  )
}

interface ReproductorProps {
  PlayAuth: string,
  VideoId: string
}

const Reproductor = (props: ReproductorProps) => {
  const { PlayAuth, VideoId } = props
  const [instance, setInstance] = useState<any | null>(null)

  const config = {
    id: "player-con",
    vid: VideoId,
    playauth: PlayAuth,
    qualitySort: "asc",
    format: "mp4",
    mediaType: "video",
    width: "100%",
    height: "500px",
    autoplay: true,
    isLive: false,
    rePlay: false,
    playsinline: true,
    preload: true,
    controlBarVisibility: "hover",
    useH5Prism: true,
    language: "en-us"
  }
  useEffect(() => {
    if (window) {
      (Aliplayer as any).components = window.AliPlayerComponent;
    }
  }, [])

  if (!PlayAuth || !VideoId) {
    return null
  }

  useEffect(() => {
    if (!instance) {
      return
    }
    instance.replayByVidAndPlayAuth(VideoId, PlayAuth)
  }, [PlayAuth])

  return (
    <Aliplayer
      sourceUrl="https://g.alicdn.com/de/prismplayer/2.9.16/aliplayer-min.js"
      onGetInstance={(instance: any) => setInstance(instance)}
      config={config}
    ></Aliplayer>
  )
}

interface VideoMetadataProps {
  lectures: Ilecture[],
  current: number
}

const VideoMetadata = (props: VideoMetadataProps) => {
  const { lectures, current } = props
  let title = "0 - Sin titulo"
  for (var i = lectures.length - 1; i >= 0; i--) {
    if (lectures[i].id === current) {
      title = lectures[i].title
      break
    }
  }
  return (
    <h4 className="mt-3">{title}</h4>
  )
}

export default CourseRep
