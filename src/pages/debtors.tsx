import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import { UsersView } from "@/sections/debtor/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Qarzdorlar - ${CONFIG.appName}`}</title>
      </Helmet>

      <UsersView />
    </>
  );
}
