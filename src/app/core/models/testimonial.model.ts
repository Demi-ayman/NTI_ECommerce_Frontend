export interface ITestimonial{
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  name: string;
  message: string;
  rating: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITestimonialResponse {
  message: string;
  data: ITestimonial;
}

export interface ITestimonialsResponse {
  message: string;
  data: ITestimonial[];
}
