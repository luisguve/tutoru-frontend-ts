import PaymentPage from "../components/PaymentPage"
import metadata, { INavigationItem, ISiteInfo } from "../lib/metadata"

interface StaticProps {
  navigation: INavigationItem[];
  siteInfo: ISiteInfo;
}
export const getStaticProps = async (): Promise<{props: StaticProps}> => {
  const navigation = await metadata.loadNavigation()
  const siteInfo = await metadata.loadSiteInfo()
  return {
    props: {
      navigation,
      siteInfo
    }
  }
}

const Payment = (props: StaticProps) => {
  const { navigation, siteInfo } = props

  return <PaymentPage navigation={navigation} siteInfo={siteInfo} method="cc" />
}

export default Payment
