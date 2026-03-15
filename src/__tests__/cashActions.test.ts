
import {
  getPendingPayments,
  confirmPayments,
  rejectPayment,
} from "@/store/actions/cashActions";

function testGetPendingPaymentsExists() {
  console.log("\n TEST 1: getPendingPayments exists");

  try {
    if (typeof getPendingPayments !== "function") {
      throw new Error("getPendingPayments should be a function");
    }

    const action = getPendingPayments();

    if (typeof action !== "function") {
      throw new Error("getPendingPayments should return a thunk function");
    }

    return true;
  } catch (error) {
    console.error("FAIL:", (error as Error).message);
    return false;
  }
}

function testConfirmPaymentsSignature() {
  console.log("\n TEST 2: confirmPayments signature");

  try {
    if (typeof confirmPayments !== "function") {
      throw new Error("confirmPayments should be a function");
    }

    const paymentIds = ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"];
    const action = confirmPayments(paymentIds);

    if (typeof action !== "function") {
      throw new Error("confirmPayments should return a thunk function");
    }

    return true;
  } catch (error) {
    console.error(" FAIL:", (error as Error).message);
    return false;
  }
}

function testRejectPaymentSignature() {
  console.log("\n TEST 3: rejectPayment signature");

  try {
    if (typeof rejectPayment !== "function") {
      throw new Error("rejectPayment should be a function");
    }

    const paymentId = "507f1f77bcf86cd799439011";
    const reason = "Test rejection reason";
    const action = rejectPayment(paymentId, reason);

    if (typeof action !== "function") {
      throw new Error("rejectPayment should return a thunk function");
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function runTests() {
  console.log("=".repeat(50));

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  results.total++;
  if (testGetPendingPaymentsExists()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testConfirmPaymentsSignature()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testRejectPaymentSignature()) {
    results.passed++;
  } else {
    results.failed++;
  }

  return results.failed === 0;
}

if (typeof window === "undefined") {
  runTests();
}
