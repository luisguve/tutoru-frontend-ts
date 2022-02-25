import Head from 'next/head'

import Layout from '../components/Layout'
import { getCategoriesSummary, ICategorySummary } from "../lib/content"
import metadata, { INavigationItem, ISiteInfo } from "../lib/metadata"
import { CategorySummary } from "../components/Category/CategoryIndex"

export async function getStaticProps(): Promise<{props: HomeProps}> {
  const { categories } = await getCategoriesSummary()
  const navigation = await metadata.loadNavigation()
  const siteInfo = await metadata.loadSiteInfo()
  return {
    props: {
      categories,
      navigation,
      siteInfo
    }
  }
}

interface HomeProps {
  categories: ICategorySummary[];
  navigation: INavigationItem[];
  siteInfo: ISiteInfo;
}
export default function Home(props: HomeProps) {
  const categories = props.categories.map(c => {
    return (
      <div className="mb-5" key={c.slug}>
        <CategorySummary data={c} displayLink />
      </div>
    )
  })
  const { siteInfo: {site_title, site_subtitle, home_title, description} } = props
  return (
    <Layout
      title={site_title}
      subtitle={site_subtitle}
      navigation={props.navigation}
      isHome
    >
      <Head>
        <title>{site_title} - {home_title}</title>
      </Head>
      <section className="p-1 p-md-0 mb-5">
        <h1>{home_title}</h1>
        <p>{description}</p>
      </section>
      <section className="p-1 p-md-0 pt-md-5">
        {categories}
      </section>
    </Layout>
  )
}
