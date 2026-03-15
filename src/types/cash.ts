export type CurrencyDetails = {
  dollar: number;
  sum: number;
  hasCurrencyRate?: boolean;
  currencyRate?: number | null;
};

export enum PaymentStatus {
  PAID = "PAID",
  UNDERPAID = "UNDERPAID",
  OVERPAID = "OVERPAID",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum PaymentType {
  INITIAL = "initial",
  MONTHLY = "monthly",
  EXTRA = "extra",
}

export enum PaymentReason {
  MONTHLY_PAYMENT_INCREASE = "monthly_payment_increase",
  MONTHLY_PAYMENT_DECREASE = "monthly_payment_decrease",
  INITIAL_PAYMENT_CHANGE = "initial_payment_change",
  TOTAL_PRICE_CHANGE = "total_price_change",
}

export enum PaymentMethod {
  SOM_CASH = "som_cash",
  SOM_CARD = "som_card",
  DOLLAR_CASH = "dollar_cash",
  DOLLAR_CARD_VISA = "dollar_card_visa",
}

export interface IPayment {
  _id: string;
  amount: number;
  actualAmount?: number;
  date: Date | string;
  isPaid: boolean;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  notes: string | { _id: string; text: string };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address?: string;
    passportSeries?: string;
    telegramName?: string;
  };
  managerId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  contractId?: string | null;
  status?: PaymentStatus;
  remainingAmount?: number;
  excessAmount?: number;
  expectedAmount?: number;
  confirmedAt?: Date | string;
  confirmedBy?: string | { _id: string; firstName: string; lastName: string };
  linkedPaymentId?: string;
  reason?: PaymentReason;
  prepaidAmount?: number;
  appliedToPaymentId?: string;
  targetMonth?: number;
  nextPaymentDate?: Date | string;
  reminderDate?: Date | string;
  reminderComment?: string;
  postponedDays?: number;
  isReminderNotification?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  reminder?: {
    reminderDate: Date | string;
    reason: string;
    targetMonth: number;
  } | null;
}

export interface IDebtor {
  _id: string;
  contractId: string;
  debtAmount: number;
  dueDate: Date;
  overdueDays: number;
  createBy: string;
  createdAt: Date;
  updatedAt: Date;
}
