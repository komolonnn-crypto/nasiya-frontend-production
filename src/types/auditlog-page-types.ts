export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  PAYMENT = "PAYMENT",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
  BULK_IMPORT = "BULK_IMPORT",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  STATUS_CHANGE = "STATUS_CHANGE",
  POSTPONE = "POSTPONE",
  CONFIRM = "CONFIRM",
  REJECT = "REJECT",
}

export enum AuditEntity {
  CUSTOMER = "customer",
  CONTRACT = "contract",
  PAYMENT = "payment",
  EMPLOYEE = "employee",
  BALANCE = "balance",
  AUTH = "auth",
  EXCEL_IMPORT = "excel_import",
  EXPENSES = "expenses",
  DEBTOR = "debtor",
}

export interface IAuditMetadata {
  fileName?: string;
  totalRows?: number;
  successfulRows?: number;
  failedRows?: number;
  paymentType?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  amount?: number;
  expectedAmount?: number;
  targetMonth?: number;
  remainingAmount?: number;
  excessAmount?: number;
  paymentCreatorId?: string;
  paymentCreatorName?: string;

  contractStatus?: string;
  monthlyPayment?: number;
  totalPrice?: number;

  dollar?: number;
  sum?: number;
  expensesNotes?: string;
  managerName?: string;

  customerName?: string;

  affectedEntities?: {
    entityType: string;
    entityId: string;
    entityName?: string;
  }[];
}

export interface IAuditLog {
  _id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  userType: "employee" | "customer";

  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: IAuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  contractId: string;
}

export interface AuditLogDailyResponse {
  status: string;
  message: string;
  data: {
    date: string | null; // null = filter yo'q (barcha yozuvlar)
    activities: IAuditLog[];
    total: number;
    limit: number;
    page: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuditLogStatsResponse {
  status: string;
  message: string;
  data: {
    period: {
      start: string;
      end: string;
    };
    stats: {
      _id: string;
      actions: {
        action: string;
        count: number;
      }[];
      totalCount: number;
    }[];
  };
}

export interface AuditLogFilterResponse {
  status: string;
  message: string;
  data: {
    activities: IAuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: AuditLogFilters;
  };
}

export interface AuditLogSummaryResponse {
  status: string;
  message: string;
  data: {
    date: string;
    summary: {
      totalActivities: number;
      customers: {
        created: number;
        updated: number;
      };
      contracts: {
        created: number;
        updated: number;
      };
      payments: {
        total: number;
        confirmed: number;
        rejected: number;
      };
      excel_imports: number;
      users: {
        active: number;
        logins: number;
      };
    };
    recentActivities: IAuditLog[];
  };
}

export interface AuditLogFilters {
  date?: string;
  entity?: AuditEntity;
  action?: AuditAction;
  userId?: string;
  employeeId?: string; // ✅ Xodim bo'yicha filter
  search?: string; // ✅ Qidiruv (customerName, productName)
  minAmount?: number; // ✅ Minimum summa (keyinchalik qo'shiladi)
  maxAmount?: number; // ✅ Maximum summa (keyinchalik qo'shiladi)
  limit?: number;
  page?: number;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: "Yaratish",
  [AuditAction.UPDATE]: "Tahrirlash",
  [AuditAction.DELETE]: "O'chirish",
  [AuditAction.PAYMENT]: "To'lov amalga oshirildi",
  [AuditAction.PAYMENT_CONFIRMED]: "To'lov tasdiqlandi",
  [AuditAction.PAYMENT_REJECTED]: "To'lov rad etildi",
  [AuditAction.BULK_IMPORT]: "Excel Import",
  [AuditAction.LOGIN]: "Kirish",
  [AuditAction.LOGOUT]: "Chiqish",
  [AuditAction.STATUS_CHANGE]: "Status O'zgarishi",
  [AuditAction.POSTPONE]: "Kechiktirish",
  [AuditAction.CONFIRM]: "Tasdiqlash",
  [AuditAction.REJECT]: "Rad etish",
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  [AuditEntity.CUSTOMER]: "Mijoz",
  [AuditEntity.CONTRACT]: "Shartnoma",
  [AuditEntity.PAYMENT]: "To'lov",
  [AuditEntity.EMPLOYEE]: "Xodim",
  [AuditEntity.BALANCE]: "Balans",
  [AuditEntity.AUTH]: "Autentifikatsiya",
  [AuditEntity.EXCEL_IMPORT]: "Excel Import",
  [AuditEntity.EXPENSES]: "Xarajatlar",
  [AuditEntity.DEBTOR]: "Qarzdor",
};

export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: "success",
  [AuditAction.UPDATE]: "warning",
  [AuditAction.DELETE]: "error",
  [AuditAction.PAYMENT]: "info",
  [AuditAction.PAYMENT_CONFIRMED]: "success",
  [AuditAction.PAYMENT_REJECTED]: "error",
  [AuditAction.BULK_IMPORT]: "secondary",
  [AuditAction.LOGIN]: "success",
  [AuditAction.LOGOUT]: "default",
  [AuditAction.STATUS_CHANGE]: "warning",
  [AuditAction.POSTPONE]: "warning",
  [AuditAction.CONFIRM]: "success",
  [AuditAction.REJECT]: "error",
};

export type Header = {
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
};

export const headers: Header[] = [
  { label: "Icon" },
  { label: "Xodim" },
  { label: "Harakat" },
  { label: "Bo'lim" },
  { label: "Shartnoma ID" },
  { label: "Mijoz" },
  { label: "Xodim" },
  { label: "Summa" },
  { label: "Kun" },
  { label: "Soat" },
  { label: "Actions" },
];

export interface AuditLogTableProps {
  data: IAuditLog[];
  loading: boolean;
  title?: string;
  subtitle?: string;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onLimitChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxHeight?: string;
}

export interface ExpandedRowProps {
  log: IAuditLog;
  allLogs: IAuditLog[];
}

export const rows = 10;
