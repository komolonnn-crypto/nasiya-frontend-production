import type { CurrencyDetails } from "./cash";

export interface IEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber: string;
  telegramId: string;
  isDeleted: boolean;
  role: string;
  balance: CurrencyDetails;
  [key: string]: any;
}

export interface IAddEmployee {
  name: string;
  surname: string;
  role: string;
  phoneNumber: string;
}

export interface IEditEmployee extends IAddEmployee {
  _id: string;
}
