export interface IUser{
  _id:string;
  name:string;
  email:string;
  role:'admin'|'user';
  isActive?: boolean;
  deactivatedAt?: string; 
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface IUserResponse{
  message:string;
  data:IUser;
}

export interface IUsersResponse{
  message:string;
  data:IUser[];
}
