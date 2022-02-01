import { STRAPI } from "./urls"

export interface Ilecture {
  title: string
}
export interface IThumbnail {
  id: number,
  name: string,
  url: string
}
export interface ICourseSummary {
  id: number,
  title: string,
  duration: number,
  description: string,
  price: number,
  slug: string,
  createdAt: string,
  updatedAt: string,
  thumbnail: IThumbnail[],
  lectures: Ilecture[]
}
export interface ICoursesRes {
  courses: ICourseSummary[]
}

/**
* Fetches the course's data.
*/
export async function getCourseSummary(slug: string) {
  const url = `${STRAPI}/api/masterclass/course/${slug}`
  const summary_res = await fetch(url)
  const summary: ICourseSummary = await summary_res.json()

  return summary
}

/**
* Fetches the courses' data.
*/
export async function getCoursesSummary() {
  const url = `${STRAPI}/api/masterclass/courses`
  const summary_res = await fetch(url)
  const summary: ICoursesRes = await summary_res.json()

  return summary
}
