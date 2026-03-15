import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import CustomersView from "@/sections/customer/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Mijozlar - ${CONFIG.appName}`}</title>
      </Helmet>

      <CustomersView />
    </>
  );
}
