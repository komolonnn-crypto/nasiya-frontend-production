import { Box, Typography } from "@mui/material";

const AccessDenied = () => (
  <Box
    height="80vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection="column">
    <Typography variant="h4" color="error" gutterBottom>
      Ruxsat yo‘q
    </Typography>
    <Typography variant="body1">
      Sizda bu sahifaga kirish huquqi mavjud emas.
    </Typography>
  </Box>
);

export default AccessDenied;
