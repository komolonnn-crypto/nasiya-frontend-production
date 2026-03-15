import type { TableRowProps } from "@mui/material/TableRow";

import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { MdSearchOff } from "react-icons/md";
import { excelNoDataStyle } from "./excel-table-styles";

type TableNoDataProps = TableRowProps & {
  searchQuery: string;
  columns: number;
};

export function TableNoData({
  searchQuery,
  columns,
  ...other
}: TableNoDataProps) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={columns + 1} sx={{ border: 'none' }}>
        <Box sx={excelNoDataStyle}>
          <MdSearchOff size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '11px', fontWeight: 600 }}>
            Ma&apos;lumot topilmadi
          </Typography>

          <Typography variant="body2" sx={{ fontSize: '10px', color: 'text.secondary' }}>
            {searchQuery && (
              <>
                <strong>&quot;{searchQuery}&quot;</strong> bo&apos;yicha natija topilmadi
              </>
            )}
            {!searchQuery && "Hozircha ma'lumot yo'q"}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
