import { SvgColor } from "@/components/svg-color";

const icon = (name: string) => (
  <SvgColor
    width="100%"
    height="100%"
    src={`/assets/icons/navbar/${name}.svg`}
  />
);

export const navData = {
  admin: [
    {
      title: "Dashboard",
      path: "/admin",
      icon: icon("ic-analytics"),
    },
    {
      title: "Xodimlar",
      path: "/admin/employee",
      icon: icon("ic-meneger"),
    },
    {
      title: "Mijozlar",
      path: "/admin/user",
      icon: icon("ic-user"),
    },
    {
      title: "Shartnomalar",
      path: "/admin/contract",
      icon: icon("ic-debt"),
    },
    {
      title: "Qarzdorlar",
      path: "/admin/debtors",
      icon: icon("ic-contact"),
    },
    {
      title: "Kassa",
      path: "/admin/cash",
      icon: icon("ic-cash"),
    },
    {
      title: "Audit Log",
      path: "/admin/audit-log",
      icon: icon("ic-audit-log"),
    },
  ],
  moderator: [
    {
      title: "Dashboard",
      path: "/moderator",
      icon: icon("ic-analytics"),
    },
    {
      title: "Mijozlar",
      path: "/moderator/user",
      icon: icon("ic-user"),
    },
    {
      title: "Shartnomalar",
      path: "/moderator/contract",
      icon: icon("ic-debt"),
    },
    {
      title: "Qarzdorlar",
      path: "/moderator/debtors",
      icon: icon("ic-contact"),
    },
    {
      title: "Kassa",
      path: "/moderator/cash",
      icon: icon("ic-cash"),
    },
    {
      title: "Audit Log",
      path: "/moderator/audit-log",
      icon: icon("ic-audit-log"),
    },
  ],
  seller: [
    {
      title: "Mijozlar",
      path: "/seller",
      icon: icon("ic-user"),
    },
    {
      title: "Shartnomalar",
      path: "/seller/contract",
      icon: icon("ic-debt"),
    },
  ],
  manager: [
    {
      title: "Dashboard",
      path: "/manager",
      icon: icon("ic-analytics"),
    },
    {
      title: "Mijozlar",
      path: "/manager/user",
      icon: icon("ic-user"),
    },
    {
      title: "Shartnomalar",
      path: "/manager/contract",
      icon: icon("ic-debt"),
    },
    {
      title: "Qarzdorlar",
      path: "/manager/debtors",
      icon: icon("ic-contact"),
    },
    {
      title: "Kassa",
      path: "/manager/cash",
      icon: icon("ic-cash"),
    },
  ],
  no: [],
} as const;
