export interface ICategory{
  _id:string;
  name:string;
}

export interface ISubcategory{
  _id:string;
  name:string
}

export interface IProduct{
   _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  imgURL: string;
  slug: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductsResponse{//ProductResponse
  message: string;
  data: IProduct[];
  pagination: {
    current: number;
    total: number;
    totalProducts: number;
  };

  // message:string;
  // data?:IProduct[];
  // page?:number;
  // limit?:number;
  // totalPages?: number;
  // totalResult?: number;
}

export interface IProductResponse{//SingleProductResponse 
  message:string;
  data:IProduct;
}
