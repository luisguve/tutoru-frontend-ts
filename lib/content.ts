import { STRAPI } from "./urls"

/*
* Lecture data structure
*/
export interface Ilecture {
  id: number,
  title: string,
  video: {
    duration: number
  }
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
export interface ISlugsRes {
  courses: {slug: string}[]
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

export interface IPath {
  params: {
    slug: string
  }
}
export async function getCoursesSlugs() {
  const url = `${STRAPI}/api/masterclass/courses-slugs`
  const data_res = await fetch(url)
  const data: ISlugsRes = await data_res.json()

  const slugsPaths = data.courses.reduce((pathsList, {slug}) => {
    const path1 = {
      params: {
        slug
      }
    }
    const path2 = {
      params: {
        slug: slug.concat("/view")
      }
    }
    return pathsList.concat([path1, path2])
  }, [] as IPath[])

  return data
}

export async function getCourseData(slug: string) {
  const url = `${STRAPI}/api/masterclass/courses/${slug}`
  const summary_res = await fetch(url)
  const summary: ICourseSummary = await summary_res.json()

  return summary
}
