import React from "react"
import Link from "next/link"

import { ICategorySummary } from "../../lib/content"
import styles from "../../styles/Category.module.scss"

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
          <h5
            style={fontSize ? {fontSize} : undefined}
            className={styles["category-tree"] + " ms-1 text-start"}
          >
            <Link href={`${parentUrl}/${c.slug}`}>
              <a>{c.title} {
                !subcategoriesJSX && `(${c.courses.length})`
              }</a>
            </Link>
          </h5>
          {
            subcategoriesJSX &&
            <div className="ms-4 d-flex flex-column align-items-start">
               {subcategoriesJSX}
            </div>
          }
        </div>
      )
    })
  }
  return (
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex flex-column align-items-start">
        {recursiveSubcategory({parentUrl, data})}
      </div>
    </div>
  )
}

export default Subcategories