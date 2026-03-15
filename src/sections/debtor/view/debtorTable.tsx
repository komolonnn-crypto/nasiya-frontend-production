import type { IDebt } from "@/types/debtor";
import type { Column } from "@/components/table/types";

import { useTableLogic } from "@/hooks/useTableLogic";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateDebCustomerManager } from "@/store/actions/debtorActions";
import { GenericTable } from "@/components/table/GnericTable";
import { ManagerSelectCellDebtor } from "./ManagerSelectCell";

interface DEbtorTableProps {
  data: IDebt[];
  columns: Column[];
  onRowClick?: (row: IDebt) => void;
  selectable?: boolean;
  setSelectedRows?: (selected: string[]) => void;
  selectedRows?: string[];
  component?: React.ReactNode;
  calendar?: React.ReactNode;
}

const DebtorTable = ({
  data,
  columns,
  onRowClick,
  selectable,
  setSelectedRows,
  selectedRows,
  component,
  calendar,
}: DEbtorTableProps) => {
  const dispatch = useAppDispatch();
  const logic = useTableLogic<IDebt>(data, columns);

  const handleManagerChange = (rowId: string, newManager: string) => {
    const row = data.find((d) => d._id === rowId);

    if (row?.customerId) {
      dispatch(updateDebCustomerManager(row.customerId, newManager));
    } else if (row?._id) {
      dispatch(updateDebCustomerManager(row._id, newManager));
    } else {
      console.error("Customer ID topilmadi:", rowId);
    }
  };

  const enhancedColumns = columns.map((col) => {
    if (col.id === "manager") {
      return {
        ...col,
        renderCell: (row: any) => (
          <ManagerSelectCellDebtor
            row={row}
            value={row.manager}
            onManagerChange={handleManagerChange}
          />
        ),
      };
    }
    return col;
  });

  return (
    <GenericTable
      data={data}
      selectable={selectable ?? false}
      columns={enhancedColumns}
      logic={logic}
      {...(onRowClick && { onRowClick })}
      {...(setSelectedRows && { setSelectedRows })}
      {...(selectedRows && { selectedRows })}
      component={component}
      calendar={calendar}
    />
  );
};

export default DebtorTable;
