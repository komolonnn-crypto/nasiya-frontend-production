import type { FC } from "react";
import type { IconType } from "react-icons";
import type { IEmployee } from "@/types/employee"

import { BsCash } from "react-icons/bs";

import {
  Card,
  Stack,
  Avatar,
  useTheme,
  Typography,
  useMediaQuery,
} from "@mui/material";

export const Balance = ({ employee }: { employee: IEmployee }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack
      direction="row"
      gap={2}
      flexWrap="wrap"
      justifyContent={isSmallScreen ? "center" : "flex-start"}
    >
      <BalanceCard
        title="Naqt dollar"
        amount={employee.balance.dollar ?? 0}
        currency="$"
        icon={BsCash}
        color="primary.main"
      />
      <BalanceCard
        title="Naqt so’m"
        amount={employee.balance.sum ?? 0}
        currency="so'm"
        icon={BsCash}
        color="success.main"
      />
    </Stack>
  );
};

interface Props {
  title: string;
  amount: number;
  currency: "so'm" | "$";
  icon: IconType;
  color?: string;
}

const BalanceCard: FC<Props> = ({
  title,
  amount,
  currency,
  icon: Icon,
  color = "primary.main",
}) => (
  <Card
    sx={{
      flex: "1 1 300px",
      //   p: 3,
      borderRadius: "18px",
      minWidth: "250px",
      p: 3,
      display: "flex",
      alignItems: "center",
      boxShadow: 3,
      background: "var(--palette-background-paper)",
    }}
  >
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      <Icon size={28} color="#fff" />
    </Avatar>
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" color="text.primary">
        {amount.toLocaleString()} {currency}
      </Typography>
    </Stack>
  </Card>
);

export default BalanceCard;
