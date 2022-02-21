import categoriesIndex from "./categories"

export const loadNavigation = async (): Promise<INavigationItem[]> => {
  const navitems = await categoriesIndex.navigation()
  return [
    {
      title: "categories",
      slug: "#",
      subcategories: navitems
    }
  ]
}

export interface INavigationItem {
  title: string;
  slug: string;
  subcategories: INavigationItem[];
}
