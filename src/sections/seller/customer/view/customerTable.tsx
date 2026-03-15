import type { ICustomer } from "@/types/customer";
import type { Column } from "@/components/table/types";

import { useTableLogic } from "@/hooks/useTableLogic";
import { GenericTable } from "@/components/table/GnericTable";

interface CustomerTableProps {
  data: ICustomer[];
  columns: Column[];
  onRowClick?: (row: ICustomer) => void;
}

const CustomerTable = ({ data, columns, onRowClick }: CustomerTableProps) => {
  const logic = useTableLogic<ICustomer>(data, columns);

  return (
    <GenericTable
      data={data}
      columns={columns}
      logic={logic}
      {...(onRowClick && { onRowClick })}
    />
  );
};

export default CustomerTable;
