import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config-global";
import { UsersView } from "@/sections/contract/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Shartnomalar - ${CONFIG.appName}`}</title>
      </Helmet>

      <UsersView />
    </>
  );
}
