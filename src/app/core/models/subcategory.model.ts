import { ICategory } from "./category.model";

export interface ISubcategory {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  description: string;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface ISubcategoriesResponse{ // SubcategoryResponse
  message: string;
  data: ISubcategory[];
  pagination: {
    current: number;
    total: number;
    totalSubcategories: number;
  };
}
// message:string;
  // data:ISubcategory[];
  // totalResult?:number;
  // page?: number;
  // limit?:number;
  // totalPages?:number


export interface ISubcategoryResponse{ // SingleSubcategoryResponse
  message:string;
  data?:ISubcategory;
}
export interface ProductsBySubcategoryResponse {
  message: string;
  data: any[];
  subcategory: {
    id: string;
    name: string;
    category: {
      _id: string;
      name: string;
    };
  };
  pagination: {
    current: number;
    total: number;
    totalProducts: number;
  };
}
