import type { IContract } from "@/types/contract";
import type { Column } from "@/components/table/types";

import { useTableLogic } from "@/hooks/useTableLogic";
import { GenericTable } from "@/components/table/GnericTable";

interface ContractTableProps {
  data: IContract[];
  columns: Column[];
  onRowClick?: (row: IContract) => void;
}

const ContractTable = ({ data, columns, onRowClick }: ContractTableProps) => {
  const logic = useTableLogic<IContract>(data, columns);

  return (
    <GenericTable
      data={data}
      columns={columns}
      logic={logic}
      {...(onRowClick && { onRowClick })}
    />
  );
};

export default ContractTable;
