import { Tabs, Tab, TabGroup, TabPanels, TabPanel } from '@strapi/design-system/Tabs'
import { useState, useContext, useEffect } from "react"
import { ThemeProvider } from "@strapi/design-system/ThemeProvider"
import { lightTheme } from "@strapi/design-system/themes"
import {
  CommentsProvider,
  Comments,
  CommentForm,
  CommentsConfigContext
} from "strapi-comments-client"
import {
  ReviewsProvider,
  Reviews,
  ReviewForm,
  ReviewsConfigContext,
  ReviewStats
} from "strapi-ratings-client"

import Layout from '../../components/Layout'
import CourseSummary from "../../components/CourseSummary"
import { CourseLectures } from "../../components/CourseLectures"
import { getCoursesSlugs, getCourseData, ICourseSummary } from "../../lib/content"
import CourseRep from "../../components/CourseRep"
import { STRAPI } from "../../lib/urls"
import AuthContext from "../../context/AuthContext"
import { useCoursePurchased } from "../../hooks/item"

interface CoursePageProps {
  data: ICourseSummary,
  isPageRep: boolean
}

interface CourseDescProps {
  data: ICourseSummary
}
interface CourseDescWrapperProps {
  data: ICourseSummary
}

const CourseDescWrapper = (props: CourseDescWrapperProps) => {
  const { data } = props
  return (
    <ReviewsProvider apiURL={STRAPI} contentID={data.slug}>
      <CommentsProvider apiURL={STRAPI} contentID={data.slug}>
        <CourseDesc data={data} />
      </CommentsProvider>
    </ReviewsProvider>
  )
}

const CourseDesc = (props: CourseDescProps) => {
  const { data } = props
  const { user } = useContext(AuthContext)
  const coursePurchased = useCoursePurchased(data.id)
  const { setUser: setReviewsUser, setCanPostReview } = useContext(ReviewsConfigContext)
  const { setUser: setCommentsUser } = useContext(CommentsConfigContext)
  useEffect(() => {
    setReviewsUser(user)
    setCommentsUser(user)
  }, [user])
  useEffect(() => {
    setCanPostReview(coursePurchased === true)
  }, [coursePurchased])
  return (
    <>
      <CourseSummary onPage={true} data={data} />
      <ThemeProvider theme={lightTheme}>
        <TabGroup label="Course stats" id="tabs">
          <Tabs>
            <Tab>Reviews</Tab>
            <Tab>Comments</Tab>
            <Tab>Playlist</Tab>
          </Tabs>
          <TabPanels>
            <TabPanel>
              <ReviewForm />
              <Reviews />
            </TabPanel>
            <TabPanel>
              <CommentForm />
              <Comments />
            </TabPanel>
            <TabPanel>
              <CourseLectures data={data.lectures} courseID={data.id} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </ThemeProvider>
    </>
  )
}

const CoursePage = (props: CoursePageProps) => {
  const { data, isPageRep } = props
  let component = <CourseDescWrapper data={data} />
  const breadCrumb = [
    {
      name: "home",
      url: "/"
    },
    {
      name: data.title,
      url: `/courses/${data.slug}`
    },
  ]
  if (isPageRep) {
    breadCrumb.push({
      name: "View",
      url: `/courses/${data.slug}`
    })
    component = <CourseRep lectures={data.lectures} courseTitle={data.title} courseID={data.id} />
  }
  return (
    <Layout
      title={data.title}
      subtitle="Course"
      header={`Tutor Universitario - ${data.title} Course`}
      isPageRep={isPageRep}
      breadCrumb={breadCrumb}
    >
    {component}
    </Layout>
  )
}

export default CoursePage

export async function getStaticPaths() {
  const paths = await getCoursesSlugs()
  return {
    paths,
    fallback: false
  }
}

interface PropsGetStaticProps {
  params: {
    slug: string[]
  }
}
export async function getStaticProps(props: PropsGetStaticProps): Promise<{props: CoursePageProps}> {
  const { params: { slug } } = props
  const isPageRep = slug.includes("view")
  const data = await getCourseData(slug[0])
  return {
    props: {
      data,
      isPageRep
    }
  }
}
