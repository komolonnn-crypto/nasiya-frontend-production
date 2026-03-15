import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import { CashesView } from "@/sections/cash/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Kassa - ${CONFIG.appName}`}</title>
      </Helmet>

      <CashesView />
    </>
  );
}
