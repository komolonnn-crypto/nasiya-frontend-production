export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error("Ma'lumot topilmadi");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(","),
    ),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};

export const exportCustomersToCSV = (customers: any[]) => {
  const formattedData = customers.map((customer, index) => {
    const contracts = customer.contracts || [];
    const activeContracts = contracts.filter((c: any) => c.status === "active");
    const completedContracts = contracts.filter(
      (c: any) => c.status === "completed",
    );

    const totalDebt = contracts.reduce(
      (sum: number, c: any) => sum + (c.remainingDebt || 0),
      0,
    );
    const totalPaid = contracts.reduce(
      (sum: number, c: any) => sum + (c.totalPaid || 0),
      0,
    );

    return {
      "№": index + 1,
      Mijoz: customer.fullName || "",
      Telefon: customer.phoneNumber || "",
      Passport: customer.passportSeries || "",
      "Tug'ilgan sana":
        customer.birthDate ?
          new Date(customer.birthDate).toLocaleDateString("uz-UZ")
        : "",
      Manzil: customer.address || "",
      Manager:
        customer.manager ?
          `${customer.manager.firstName || ""} ${customer.manager.lastName || ""}`.trim()
        : "",
      "Shartnomalar soni": contracts.length,
      "Faol shartnomalar": activeContracts.length,
      Tugallangan: completedContracts.length,
      "Jami qarz": `${totalDebt.toFixed(2)} $`,
      "Jami to'langan": `${totalPaid.toFixed(2)} $`,
      "Yaratilgan sana":
        customer.createdAt ?
          new Date(customer.createdAt).toLocaleDateString("uz-UZ")
        : "",
      Status: customer.isActive ? "Faol" : "Nofaol",
    };
  });

  exportToCSV(
    formattedData,
    `mijozlar_${new Date().toISOString().split("T")[0]}`,
  );
};

export const exportContractsToCSV = (contracts: any[]) => {
  const formattedData = contracts.map((contract, index) => {
    const payments = contract.payments || [];
    const paidPayments = payments.filter((p: any) => p.isPaid);
    const pendingPayments = payments.filter((p: any) => !p.isPaid);

    const paidMonths = paidPayments
      .filter((p: any) => p.paymentType === "monthly")
      .map((i: number) => `${i + 1}-oy`)
      .join(", ");

    const unpaidMonths = pendingPayments
      .filter((p: any) => p.paymentType === "monthly")
      .map(
        (i: number) =>
          `${paidPayments.filter((pp: any) => pp.paymentType === "monthly").length + i + 1}-oy`,
      )
      .join(", ");

    const progressPercent =
      contract.totalPrice > 0 ?
        ((contract.totalPaid / contract.totalPrice) * 100).toFixed(1)
      : "0";

    const contractNumber =
      contract.createdAt ?
        `SH-${new Date(contract.createdAt).toISOString().split("T")[0]?.replace(/-/g, "") || ""}-${String(index + 1).padStart(4, "0")}`
      : `SH-${String(index + 1).padStart(4, "0")}`;

    return {
      "№": index + 1,
      "Shartnoma raqami": contractNumber,
      Mijoz: contract.customer?.fullName || "",
      Telefon: contract.customer?.phoneNumber || "",
      Passport: contract.customer?.passportSeries || "",
      Manager:
        contract.customer?.manager ?
          `${contract.customer.manager.firstName || ""} ${contract.customer.manager.lastName || ""}`.trim()
        : "",
      Mahsulot: contract.productName || "",
      "Asl narx": `${contract.originalPrice || 0} $`,
      "Sotuv narxi": `${contract.price || 0} $`,
      Foiz: `${contract.percentage || 0}%`,
      "Umumiy narx": `${contract.totalPrice || 0} $`,
      "Boshlang'ich to'lov": `${contract.initialPayment || 0} $`,
      "Oylik to'lov": `${contract.monthlyPayment || 0} $`,
      Muddat: `${contract.period || 0} oy`,
      "To'langan": `${contract.totalPaid || 0} $`,
      "Qolgan qarz": `${contract.remainingDebt || 0} $`,
      Progress: `${progressPercent}%`,
      "To'langan oylar": paidMonths || "Yo'q",
      "To'lanmagan oylar": unpaidMonths || "Yo'q",
      "Jami to'lovlar": payments.length,
      "To'langan to'lovlar": paidPayments.length,
      "Kutilayotgan to'lovlar": pendingPayments.length,
      Status:
        contract.status === "active" ? "Faol"
        : contract.status === "completed" ? "Tugallangan"
        : "Bekor qilingan",
      "Boshlangan sana":
        contract.startDate ?
          new Date(contract.startDate).toLocaleDateString("uz-UZ")
        : "",
      "Keyingi to'lov":
        contract.nextPaymentDate ?
          new Date(contract.nextPaymentDate).toLocaleDateString("uz-UZ")
        : "",
      "Yaratilgan sana":
        contract.createdAt ?
          new Date(contract.createdAt).toLocaleDateString("uz-UZ")
        : "",
      Quti: contract.info?.box ? "Ha" : "Yo'q",
      "Muslim quti": contract.info?.mbox ? "Ha" : "Yo'q",
      Chek: contract.info?.receipt ? "Ha" : "Yo'q",
      iCloud: contract.info?.iCloud ? "Ha" : "Yo'q",
      Izoh: contract.notes || "",
    };
  });

  exportToCSV(
    formattedData,
    `shartnomalar_${new Date().toISOString().split("T")[0]}`,
  );
};
