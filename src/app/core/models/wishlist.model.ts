export interface IWishlistItem{
  product:string,
  name:string,
  price:number;
  imgURL:string;
  addedAt:string;
}
export interface IWishlist{
  _id?: string;
  user: string;
  items: IWishlistItem[];
  createdAt?: string;
  updatedAt?: string;
}
export interface IWishlistResponse {
  message: string;
  data: IWishlist;
}
