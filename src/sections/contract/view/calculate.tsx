import type { IContract } from "@/types/contract"

import { Paper } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import RenderContractFields from "@/components/render-contract-fields/renderContractFields"

const Calculate = ({ 
  contract, 
  onEditDate 
}: { 
  contract: IContract; 
  onEditDate?: () => void;
}) => (
  <Paper
    elevation={3}
    sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 ,borderRadius: "18px"}}
  >
    <Grid container spacing={1}>
      <RenderContractFields 
        contract={contract} 
        showName 
        {...(onEditDate && { onEditDate })}
      />
    </Grid>
  </Paper>
);

export default Calculate;
