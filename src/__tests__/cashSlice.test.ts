import cashReducer, {
  setPayments,
  setError,
  start,
  success,
  type CashState,
} from "@/store/slices/cashSlice";
import type { IPayment } from "@/types/cash";
import { PaymentType, PaymentStatus } from "@/types/cash";

const mockPayment: IPayment = {
  _id: "507f1f77bcf86cd799439011",
  amount: 1000,
  date: new Date("2024-01-15"),
  isPaid: false,
  paymentType: PaymentType.MONTHLY,
  notes: "Test payment",
  customerId: {
    _id: "507f1f77bcf86cd799439012",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+998901234567",
  },
  managerId: {
    _id: "507f1f77bcf86cd799439013",
    firstName: "Jane",
    lastName: "Smith",
  },
  status: PaymentStatus.PENDING,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

function testInitialState() {
  console.log("\n TEST 1: Initial state");

  try {
    const state = cashReducer(undefined, { type: "@@INIT" });

    if (!Array.isArray(state.payments)) {
      throw new Error("payments should be an array");
    }

    if (state.payments.length !== 0) {
      throw new Error("payments should be empty initially");
    }

    if (state.isLoading !== false) {
      throw new Error("isLoading should be false initially");
    }

    if (state.error !== null) {
      throw new Error("error should be null initially");
    }

    return true;
  } catch (error) {
    return false;
  }
}

function testSetPayments() {
  try {
    const initialState: CashState = {
      payments: [],
      isLoading: true,
      error: "Some error",
    };

    const state = cashReducer(initialState, setPayments([mockPayment]));

    if (state.payments.length !== 1) {
      throw new Error("payments should have 1 item");
    }

    if (state.payments[0]?._id !== mockPayment._id) {
      throw new Error("payment ID should match");
    }

    if (state.isLoading !== false) {
      throw new Error("isLoading should be false after setPayments");
    }

    if (state.error !== null) {
      throw new Error("error should be null after setPayments");
    }

    return true;
  } catch (error) {
    return false;
  }
}

function testSetError() {
  try {
    const initialState: CashState = {
      payments: [mockPayment],
      isLoading: true,
      error: null,
    };

    const errorMessage = "Test error message";
    const state = cashReducer(initialState, setError(errorMessage));

    if (state.error !== errorMessage) {
      throw new Error("error should be set");
    }

    if (state.isLoading !== false) {
      throw new Error("isLoading should be false after setError");
    }

    return true;
  } catch (error) {
    return false;
  }
}

function testStart() {
  try {
    const initialState: CashState = {
      payments: [],
      isLoading: false,
      error: "Previous error",
    };

    const state = cashReducer(initialState, start());

    if (state.isLoading !== true) {
      throw new Error("isLoading should be true after start");
    }

    if (state.error !== null) {
      throw new Error("error should be cleared after start");
    }

    return true;
  } catch (error) {
    return false;
  }
}

function testSuccess() {
  try {
    const initialState: CashState = {
      payments: [],
      isLoading: true,
      error: "Previous error",
    };

    const state = cashReducer(initialState, success());

    if (state.isLoading !== false) {
      throw new Error("isLoading should be false after success");
    }

    if (state.error !== null) {
      throw new Error("error should be cleared after success");
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function runTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  results.total++;
  if (testInitialState()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testSetPayments()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testSetError()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testStart()) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.total++;
  if (testSuccess()) {
    results.passed++;
  } else {
    results.failed++;
  }

  return results.failed === 0;
}

if (typeof window === "undefined") {
  runTests();
}
