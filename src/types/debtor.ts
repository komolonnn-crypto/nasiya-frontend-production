export interface IDebt {
  _id: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  totalPrice: number;
  totalPaid: number;
  remainingDebt: number;
  manager: string;
  status: string;
  nextPaymentDate: string;
  previousPaymentDate?: string;
  postponedAt?: string;
  activeContractsCount: number;
  productName: string;
  startDate: string;
  delayDays: number;
  initialPayment: number;
  monthlyPayment?: number;
  period?: number;
  paidMonthsCount?: number;
  contracts?: Array<{
    _id: string;
    productName: string;
    monthlyPayment?: number;
    period?: number;
    paidMonthsCount?: number;
    [key: string]: any;
  }>;

  [key: string]: any;
}
