import type { IPayment } from "@/types/cash";
import type { Column } from "@/components/table/types";

import { useTableLogic } from "@/hooks/useTableLogic";
import { GenericTable } from "@/components/table/GnericTable";

interface ChashTableProps {
  data: IPayment[];
  columns: Column[];
  onRowClick?: (row: IPayment) => void;
  onCustomerClick?: (customer: any) => void;
  onNotesClick?: (row: IPayment) => void;
  selectable?: boolean;
  setSelectedRows?: (selected: string[]) => void;
  component?: React.ReactNode;
  renderActions: (row: IPayment) => React.ReactNode;
}

const ChashTable = ({
  data,
  columns,
  onRowClick,
  onCustomerClick,
  onNotesClick,
  selectable,
  setSelectedRows,
  component,
  renderActions,
}: ChashTableProps) => {
  const logic = useTableLogic<IPayment>(data, columns);

  return (
    <GenericTable
      data={data}
      selectable={selectable ?? false}
      columns={columns}
      logic={logic}
      {...(onRowClick && { onRowClick })}
      {...(onCustomerClick && { onCustomerClick })}
      {...(onNotesClick && { onNotesClick })}
      {...(setSelectedRows && { setSelectedRows })}
      component={component}
      renderActions={renderActions}
    />
  );
};

export default ChashTable;
