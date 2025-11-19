import { IProduct } from "./product.model";

export interface IOrderProduct{
  product:string|IProduct;
  quantity:number;
  price:number;
  _id?: string;
}
export type PopulatedOrderProduct = Omit<IOrderProduct, 'product'> & {
  product: IProduct;
};
export interface IOrder{
  _id:string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  products:IOrderProduct[];
  name:string;
  address:string;
  status:'Pending'|'Processing'|'Shipped'|'Delivered'|'Cancelled';
  totalPrice: number;
  paymentMethod:'CashOnDelivery' | 'CreditCard' | 'PayPal';
  isPaid:boolean;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderResponse{
  message:string;
  data:IOrder;
}

export interface IOrdersResponse
{
 message: string;
  data: IOrder[];
  pagination?: {
    current: number;
    total: number;
    totalOrders: number;
  };
}
