import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import { EmployeessView } from "@/sections/employee/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Xodimlar - ${CONFIG.appName}`}</title>
      </Helmet>

      <EmployeessView />
    </>
  );
}
