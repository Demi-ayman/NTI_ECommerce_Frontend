export interface IFaq {
  _id: string;
  question: string;
  answer: string;
  category: 'General' | 'Shipping' | 'Payments' | 'Returns' | 'Account'|'Orders';
  createdAt: string;
  updatedAt: string;
}
export interface IFaqResponse {
  message: string;
  data: IFaq;
}

export interface IFaqsResponse {
  message: string;
  data: IFaq[];
}
export interface ICreateFaqRequest {
  question: string;
  answer: string;
  category: string;
}

export interface IUpdateFaqRequest {
  question?: string;
  answer?: string;
  category?: string;
}
