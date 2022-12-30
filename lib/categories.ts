import { STRAPI } from "./urls"

export interface ICourse {
  id: number;
  slug: string;
  title: string;
}
export interface IEjericio {
  id: number;
  slug: string;
  title: string;
}
export interface ICategory {
  id: number;
  slug: string;
  title: string;
  subcategories: ICategory[];
  courses: ICourse[];
  ejercicios: IEjericio[];
}

class CategoriesIndex {
  _categories: ICategory[] | null = null;
  // Returns the hierarchical tree of every category from the API.
  navigation = async (): Promise<ICategory[]> => {
    if (this._categories) {
      return this._categories
    }
    // Load the hierarchical tree of every category from the API.
    const categories_res = await fetch(`${STRAPI}/api/masterclass/categories/navigation`)
    const { categories } = await categories_res.json()
    this._categories = categories
    return this._categories || []
  }
  // Returns the index for the category with the given slug
  getBySlug = async (slug: string): Promise<ICategory> => {
    if (this._categories) {
      const category = this._categories.find(c => c.slug === slug)
      if (category) {
        return category
      }
    }
    // Load the index of the category from the API
    const category_res = await fetch(`${STRAPI}/api/masterclass/categories/${slug}/tree`)
    const { category } = await category_res.json()
    return category
  }
}

const index = new CategoriesIndex()

export default index
