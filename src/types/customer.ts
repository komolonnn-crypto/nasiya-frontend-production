import type { IContract } from "./contract";

export interface ICustomer {
  _id: string;
  fullName: string;
  passportSeries: string;
  phoneNumber: string;
  address: string;
  birthDate: Date;
  telegramName: string;
  telegramId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  managerId: string;
  manager?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  };
  contracts?: IContract[];
  files?: {
    passport?: string;
    shartnoma?: string;
    photo?: string;
  };
  [key: string]: any;
}

export interface IAddCustomer {
  fullName: string;
  passportSeries: string;
  phoneNumber: string;
  birthDate: Date;
  address: string;
  managerId: string;
}

export interface IEditCustomer {
  id: string;
  fullName: string;
  passportSeries: string;
  phoneNumber: string;
  birthDate: Date;
  address: string;
  managerId: string;
}
