import type { ICustomer } from "@/types/customer"
import type { IContract } from "@/types/contract"

import {
  FaWallet,
  FaHandshake,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

import {
  Paper,
  Stack,
  Avatar,
  useTheme,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { formatNumber } from "@/utils/format-number"

const Statistics = ({
  customer,
  contracts,
}: {
  customer: ICustomer;
  contracts?: IContract[];
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!customer.isActive) return null;

  const totalDebt = contracts?.reduce(
    (acc, contract) => acc + (contract.remainingDebt || 0),
    0
  );

  const activeContracts = (contracts ?? []).length;

  const upcomingDates = contracts
    ?.map((c) => new Date(c.nextPaymentDate))
    .filter((d) => !isNaN(d.getTime()));

  const nearestDate =
    upcomingDates && upcomingDates.length > 0
      ? new Date(
          Math.min.apply(
            null,
            upcomingDates.map((d) => d.getTime())
          )
        )
      : null;

  const totalMonthlyPayment = contracts?.reduce(
    (acc, contract) => acc + (contract.monthlyPayment || 0),
    0
  );

  const Card = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) => (
    <Paper
      elevation={3}
      sx={{
        flex: "1 1 300px",
        p: 3,
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        minWidth: "250px",
      }}
    >
      <Avatar
        sx={{
          bgcolor: theme.palette.primary.main,
          width: 48,
          height: 48,
        }}
      >
        {icon}
      </Avatar>
      <div>
        <Typography variant="body1" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" color="text.primary">
          {value}
        </Typography>
      </div>
    </Paper>
  );

  return (
    <Stack
      direction="row"
      gap={2}
      flexWrap="wrap"
      justifyContent={isSmallScreen ? "center" : "flex-start"}
    >
      <Card
        title="Umumiy qarzdorlik"
        value={`$${formatNumber(totalDebt || 0)}`}
        icon={<FaMoneyBillWave color="#fff" size={22} />}
      />
      {/* <Card
        title="Yillik foiz"
        value={`${customer.percent}%`}
        icon={<FaPercent color="#fff" size={22} />}
      /> */}
      <Card
        title="Faol bitimlar soni"
        value={activeContracts || 0}
        icon={<FaHandshake color="#fff" size={22} />}
      />
      <Card
        title="Eng yaqin to‘lov sanasi"
        value={
          nearestDate ? nearestDate.toLocaleDateString("uz-UZ") : "Mavjud emas"
        }
        icon={<FaCalendarAlt color="#fff" size={22} />}
      />
      <Card
        title="Oylik to‘lov"
        value={`$${formatNumber(totalMonthlyPayment || 0)}`}
        icon={<FaWallet color="#fff" size={22} />}
      />
    </Stack>
  );
};

export default Statistics;
