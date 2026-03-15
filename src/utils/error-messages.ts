export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_1001: "Login yoki parol noto'g'ri",
  AUTH_1002: "Ruxsat berilmagan. Iltimos qayta kiring",
  AUTH_1003: "Sessiya tugadi. Iltimos qayta kiring",
  AUTH_1004: "Noto'g'ri token",
  AUTH_1005: "Telefon raqami kiritilishi shart",
  PAYMENT_2001: "To'lov topilmadi",
  PAYMENT_2002: "To'lov allaqachon tasdiqlangan",
  PAYMENT_2003: "To'lov allaqachon rad etilgan",
  PAYMENT_2004: "To'lov muddati o'tgan (24 soat)",
  PAYMENT_2005: "Noto'g'ri to'lov summasi",
  PAYMENT_2006: "Balans yetarli emas",
  PAYMENT_2007: "To'lov tasdiqlash kutilmayapti",
  CONTRACT_3001: "Shartnoma topilmadi",
  CONTRACT_3002: "Shartnoma allaqachon to'liq to'langan",
  CONTRACT_3003: "Shartnoma bekor qilingan",
  CONTRACT_3004: "Noto'g'ri shartnoma ma'lumotlari",
  CONTRACT_3005: "Shartnomada tasdiqlash kutilayotgan to'lovlar bor",
  CUSTOMER_4001: "Mijoz topilmadi",
  CUSTOMER_4002: "Mijozning faol shartnomalari mavjud",
  CUSTOMER_4003: "Bu mijoz allaqachon mavjud",
  CUSTOMER_4004: "Noto'g'ri mijoz ma'lumotlari",
  EMPLOYEE_5001: "Xodim topilmadi",
  EMPLOYEE_5002: "Sizda bu amal uchun ruxsat yo'q",
  EMPLOYEE_5003: "Xodim faol emas",
  EMPLOYEE_5004: "Noto'g'ri xodim ma'lumotlari",
  CASH_6001: "Kassada pul yetarli emas",
  CASH_6002: "Noto'g'ri valyuta",
  CASH_6003: "Kassa so'rovi topilmadi",
  CASH_6004: "Kassa so'rovi allaqachon ko'rib chiqilgan",
  DEBTOR_7001: "Qarzdor topilmadi",
  DEBTOR_7002: "Qarzdor allaqachon to'lagan",
  ERROR_9001: "Serverda xatolik yuz berdi",
  ERROR_9002: "Ma'lumotlar noto'g'ri kiritilgan",
  ERROR_9003: "Ma'lumot topilmadi",
  ERROR_9004: "Noto'g'ri so'rov",
  ERROR_9005: "Ma'lumotlar bazasida xatolik",
  ERROR_9006: "Fayl yuklashda xatolik",
  UNKNOWN_ERROR: "Noma'lum xatolik yuz berdi",
};

export function getErrorMessage(errorCode?: string) {
  if (!errorCode) return ERROR_MESSAGES["UNKNOWN_ERROR"];
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["UNKNOWN_ERROR"];
}

export function extractErrorCode(error: any): string | undefined {
  return error?.response?.data?.errorCode || error?.errorCode || error?.code;
}

export function getUserErrorMessage(error: any) {
  const errorCode = extractErrorCode(error);
  return getErrorMessage(errorCode);
}

export default ERROR_MESSAGES;
