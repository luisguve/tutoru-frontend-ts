import categoriesIndex from "./categories"
import { STRAPI } from "./urls"

export interface INavigationItem {
  title: string;
  slug: string;
  subcategories: INavigationItem[];
}

export interface ISiteInfo {
  site_title: string;
  site_subtitle: string;
  home_title: string;
  description: string;
}

interface ISiteInfoRes {
  data: {
    attributes: ISiteInfo;
  };
}
class Metadata {
  _navitems: INavigationItem[] | null = null;
  _siteInfo: ISiteInfo | null = null;
  // Returns the hierarchical tree of every category from the API.
  loadNavigation = async (): Promise<INavigationItem[]> => {
    if (this._navitems) {
      return this._navitems
    }
    const navitems = await categoriesIndex.navigation()
    const rootNavigation = [
      {
        title: "categories",
        slug: "#",
        subcategories: navitems
      }
    ]
    this._navitems = rootNavigation
    return rootNavigation
  }
  loadSiteInfo = async (): Promise<ISiteInfo> => {
    if (this._siteInfo) {
      return this._siteInfo
    }
    try {
      const url = `${STRAPI}/api/home`
      const data = await fetch(url)
      const siteInfo: ISiteInfoRes = await data.json()
      if (!data.ok) {
        throw siteInfo
      }
      const { attributes } = siteInfo.data
      this._siteInfo = attributes
      return attributes
    } catch(err) {
      console.log("Could not fetch site info:")
      console.log(err)
      return {
        site_title: "",
        site_subtitle: "",
        home_title: "",
        description: ""
      }
    }
  }
}

const metadata = new Metadata()

export default metadata
