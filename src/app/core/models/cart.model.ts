import { IProduct } from "./product.model";

export interface ICartItem{
  price: number;
  _id: string;
  product:IProduct,
  quantity:number;
}

export interface ICart{
  _id:string;
  user:string;
  items:ICartItem[];
  totalPrice:number;
  createdAt?: string;
  updatedAt?: string;
}
