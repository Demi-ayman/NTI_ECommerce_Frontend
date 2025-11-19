import { IUser } from "./user.model";

export interface UsersResponse{
  message:string;
  data:IUser[];
  pagination:{
    current:number;
    total:number;
    totalUsers:number;
  }
}

export interface UsersStats{
  totalUsers:number;
  totalAdmins:number;
  totalCustomers:number;
  newUsers:number;
}
