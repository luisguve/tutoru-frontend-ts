import path from "path"
import { getCategoryPaths, getCategoryData, ICategoryData } from "../../lib/categorySetup"

import Category from "../../components/Category"

const category = __dirname.split(path.sep).pop()

export async function getStaticPaths() {
  const data = await getCategoryPaths({slug: category})
  return {
    paths: data?.paths,
    fallback: false
  }
}

interface PropsGetStaticProps {
  params: {
    page: string[]
  }
}
interface StaticProps {
  props: ICategoryData;
}
export async function getStaticProps({ params }: PropsGetStaticProps): Promise<StaticProps> {
  const data = await getCategoryData({ params, slug: category })
  if (!data) {
    console.log({params})
    console.log({slug: category})
    throw "Props is null!"
  }
  return {props: data}
}

/**
* Se desea mantener el minimo codigo posible en este componente ya que sera
* copiado el mismo en las otras categorias.
*/
export default function Page(props: ICategoryData) {
  return <Category props={props} />
}
