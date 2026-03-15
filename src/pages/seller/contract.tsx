import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import ConntrctView from "@/sections/seller/contract/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Shartnomalar - ${CONFIG.appName}`}</title>
      </Helmet>

      <ConntrctView />
    </>
  );
}
