import Head from 'next/head'

import Layout from '../components/Layout'
import { getCategoriesSummary, ICategorySummary } from "../lib/content"
import { loadNavigation, INavigationItem } from "../lib/metadata"
import { CategorySummary } from "../components/Category/CategoryIndex"

export async function getStaticProps() {
  const { categories } = await getCategoriesSummary()
  const navigation = await loadNavigation()
  return {
    props: {
      categories,
      navigation
    }
  }
}

interface HomeProps {
  categories: ICategorySummary[];
  navigation: INavigationItem[];
}
export default function Home(props: HomeProps) {
  const categories = props.categories.map(c => {
    return (
      <div className="mb-5" key={c.slug}>
        <CategorySummary data={c} displayLink />
      </div>
    )
  })
  return (
    <Layout
      title="abc"
      subtitle="def"
      header="Tutor Universitario"
      navigation={props.navigation}
      isHome
    >
      <section className="p-1">
        <h1 className="mb-4 text-center">Categories</h1>
        {categories}
      </section>
    </Layout>
  )
}
