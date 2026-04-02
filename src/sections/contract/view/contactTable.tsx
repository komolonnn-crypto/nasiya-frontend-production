import type { IContract } from "@/types/contract";
import type { Column } from "@/components/table/types";

import { useTableLogic } from "@/hooks/useTableLogic";
import { GenericTable } from "@/components/table/GnericTable";

interface ContractTableProps {
  data: IContract[];
  columns: Column[];
  onRowClick: (row: IContract) => void;
  onCustomerClick?: (customer: any) => void;
  renderActions?: (row: IContract) => React.ReactNode;
  setSelectedRows?: (selected: string[]) => void;
  selectedRows?: string[];
  selectable?: boolean;
  component?: React.ReactNode;
}

const ContractTable = ({
  data,
  columns,
  onRowClick,
  onCustomerClick,
  renderActions,
  selectable,
  setSelectedRows,
  selectedRows,
  component,
}: ContractTableProps) => {
  const logic = useTableLogic<IContract>(data, columns);

  return (
    <GenericTable
      data={data}
      columns={columns}
      logic={logic}
      onRowClick={onRowClick}
      {...(onCustomerClick && { onCustomerClick })}
      {...(renderActions && { renderActions })}
      selectable={selectable ?? false}
      {...(setSelectedRows && { setSelectedRows })}
      {...(selectedRows && { selectedRows })}
      component={component}
    />
  );
};

export default ContractTable;
