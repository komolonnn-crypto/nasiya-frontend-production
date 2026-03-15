import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import DashboardView from "@/sections/overview/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Dashboard - ${CONFIG.appName}`}</title>
      </Helmet>

      <DashboardView />
    </>
  );
}
