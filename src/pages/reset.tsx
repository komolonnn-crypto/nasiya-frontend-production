import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import { ResetView } from "@/sections/reset/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Reset - ${CONFIG.appName}`}</title>
      </Helmet>

      <ResetView />
    </>
  );
}
