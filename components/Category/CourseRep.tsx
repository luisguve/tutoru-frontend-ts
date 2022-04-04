import { useState, useEffect, useContext, useRef } from "react"
import { useRouter } from "next/router"
import Hls from 'hls.js';

import { IModule, Ilecture } from "../../lib/content"

import MyLearningContext from "../../context/MyLearningContext"
import AuthContext from "../../context/AuthContext"
import { useCoursePurchased } from "../../hooks/item"
import { STRAPI } from "../../lib/urls"
import { Playlist } from "./LecturesList"

interface CourseRepProps {
  data: {
    id: number;
    title: string;
    modules: IModule[];
  };
}

interface IErrData {
  msg: string;
  lectureID?: number;
}
interface IDataRep {
  currentLectureID: number;
  PlayAuth: string;
  classesCompleted: Ilecture[];
}

const CourseRep = ({data}: CourseRepProps) => {
  const { id: courseID, title: courseTitle, modules } = data
  const [loading, setLoading] = useState(false)
  const [dataRep, setDataRep] = useState<IDataRep | null>(null)
  const [errData, setErrData] = useState<IErrData | null>(null)
  const router = useRouter()
  const { loadingItems } = useContext(MyLearningContext)
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
    const options = {
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
  }, [loadingItems,coursePurchased,user])
  return (
    <div>
      {
        <div className="row mx-0 justify-content-end align-items-start">
          <div className="col-12">
            <h1 className="fs-2">{courseTitle}</h1>
          </div>
          <div className="col-lg-8 px-0 px-md-2 mb-3">
            {
              (loading || loadingItems) ?
                <div className="bg-dark d-flex flex-column align-items-center justify-content-center h-100" style={{minHeight: 340}}>
                  <h3 className="text-light">Loading...</h3>
                </div>
              : errData ?
                <div className="bg-dark d-flex flex-column align-items-center justify-content-center h-100">
                  <h5 className="text-danger">{errData.msg}</h5>
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchDataRep(errData.lectureID)}
                  >Try again</button>
                </div>
              : dataRep &&
                <>
                  <Reproductor
                    PlayAuth={dataRep.PlayAuth}
                  />
                  <VideoMetadata
                    modules={modules}
                    current={dataRep.currentLectureID}
                  />
                </>
            }
          </div>
          <div className="col-lg-4 p-md-0">
            <Playlist
              modules={modules}
              changeLecture={fetchDataRep}
              currentLectureID={dataRep ? dataRep.currentLectureID : null}
              courseID={courseID}
            />
          </div>
        </div>
      }
    </div>
  )
}

export default CourseRep

interface ReproductorProps {
  PlayAuth: string;
}

const Reproductor = (props: ReproductorProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const src = props.PlayAuth;

  useEffect(() => {
    let hls: Hls;
    if (videoRef.current) {
      const video = videoRef.current;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Some browers (safari and ie edge) support HLS natively
        video.src = src;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        console.error("This is a legacy browser that doesn't support MSE");
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoRef,src]);

  return (
    <video
      controls
      ref={videoRef}
      style={{ width: "100%" }}
    />
  );
}

interface VideoMetadataProps {
  modules: IModule[];
  current: number;
}

const VideoMetadata = (props: VideoMetadataProps) => {
  const { modules, current } = props

  const lectures: Ilecture[] = modules.reduce((lectures, module) => {
    return lectures.concat(module.lectures)
  }, [] as Ilecture[])

  let title = "0 - Sin titulo"
  for (let i = lectures.length - 1; i >= 0; i--) {
    if (lectures[i].id === current) {
      title = `${i+1} - ` + lectures[i].title
      break
    }
  }
  return (
    <h4 className="mt-1 mt-md-3 mb-0 px-2 px-sm-4 px-lg-0 fs-6 fs-md-4">{title}</h4>
  )
}
