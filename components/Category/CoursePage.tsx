import dynamic from 'next/dynamic'
import { useContext, useEffect } from "react"
import { Tab, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import {
  CommentForm, Comments, CommentsConfigContext, CommentsProvider
} from "strapi-comments-client"
import {
  ReviewForm, Reviews, ReviewsConfigContext, ReviewsProvider
} from "strapi-ratings-client"
import { PlaylistSummary } from "./LecturesList"
import CourseSummary from "./CourseSummary"
import AuthContext from "../../context/AuthContext"
import { useCoursePurchased } from "../../hooks/item"
import { STRAPI } from "../../lib/urls"
import { ICourseSummary } from "../../lib/content"


const Tabs = dynamic(import('react-tabs').then(mod => mod.Tabs), { ssr: false }) // disable ssr


interface CoursePageProps {
  data: ICourseSummary;
}
const CoursePage = (props: CoursePageProps) => {
  const { data } = props
  return (
    <ReviewsProvider apiURL={STRAPI} contentID={data.slug}>
      <CommentsProvider apiURL={STRAPI} contentID={data.slug}>
        <CourseDesc data={data} />
      </CommentsProvider>
    </ReviewsProvider>
  )
}

export default CoursePage

const Markdown = ({ data }: {data: string}) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: data}}></div>
  )
}

const CourseDesc = (props: CoursePageProps) => {
  const { data } = props
  const { user } = useContext(AuthContext)
  const coursePurchased = useCoursePurchased(data.id)
  const { setUser: setReviewsUser, setCanPostReview } = useContext(ReviewsConfigContext)
  const { setUser: setCommentsUser } = useContext(CommentsConfigContext)
  useEffect(() => {
    setReviewsUser(user)
    setCommentsUser(user)
  }, [user,setReviewsUser,setCommentsUser])
  useEffect(() => {
    setCanPostReview(coursePurchased === true)
  }, [coursePurchased,setCanPostReview])
  return (
    <>
      <CourseSummary onPage displayImage data={data} />
      <div className="my-3">
        <Markdown data={data.long_description} />
      </div>
      <Tabs>
        <TabList>
          <Tab>Reviews</Tab>
          <Tab>Comments</Tab>
          <Tab>Playlist</Tab>
        </TabList>
        <TabPanel>
          <ReviewForm />
          <Reviews />
        </TabPanel>
        <TabPanel>
          <CommentForm />
          <Comments />
        </TabPanel>
        <TabPanel>
          <PlaylistSummary data={data.lectures} courseID={data.id} />
        </TabPanel>
      </Tabs>
    </>
  )
}
