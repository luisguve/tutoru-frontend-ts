import React from "react"
import Link from "next/link"

import { ICategorySummary } from "../../lib/content"

interface SubcategoriesProps {
  data: ICategorySummary[];
  parentUrl: string;
  fontSize?: number;
}
const Subcategories = (props: SubcategoriesProps) => {
  const { parentUrl, data, fontSize } = props
  const recursiveSubcategory = ({parentUrl, data}: SubcategoriesProps) => {
    return data.map(c => {

      const { subcategories } = c

      let subcategoriesJSX: React.ReactNode = null
      if (subcategories.length) {
        subcategoriesJSX = recursiveSubcategory({
          parentUrl: `${parentUrl}/${c.slug}`,
          data: subcategories
        })
      }

      return (
        <div key={c.slug}>
          <h5 style={fontSize ? {fontSize} : undefined}>
            <Link href={`${parentUrl}/${c.slug}`}>
              <a className="ms-1">{c.title} {
                !subcategoriesJSX && `(${c.courses.length})`
              }</a>
            </Link>
            {
              subcategoriesJSX &&
              <div className="ms-4">
                 {subcategoriesJSX}
              </div>
            }
          </h5>
        </div>
      )
    })
  }
  return (
    <div className="d-flex flex-column d-lg-block">
      {recursiveSubcategory({parentUrl, data})}
    </div>
  )
}

export default Subcategories