import { Helmet } from "react-helmet-async";

import { CONFIG } from "@/config-global";

import SignInView from "@/sections/auth/sign-in-view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      <SignInView />
    </>
  );
}
