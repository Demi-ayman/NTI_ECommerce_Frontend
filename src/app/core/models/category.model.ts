export interface ICategory {
  _id: string;
  name: string;
  description: string;
  isActive?: boolean;
  productCount?: number;
  subcategoryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}


export interface ICategoriesResponse{ // CategoryResponse
  message: string;
  data: ICategory[];
  pagination: {
    current: number;
    total: number;
    totalCategories: number;
  };
}

export interface ICategoryResponse{ // SingleCategoryResponse
  message: string;
  data: ICategory;
}


export interface SubcategoriesByCategoryResponse {
  message: string;
  data: any[];
  category: {
    id: string;
    name: string;
  };
  pagination: {
    current: number;
    total: number;
    totalSubcategories: number;
  };
}
