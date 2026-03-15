import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";

import { LayoutSection } from "@/layouts/core/layout-section";
import Loader from "@/components/loader/Loader";
import { stylesMode } from "@/theme/styles";
import type { RootState } from "@/store";
import { Main } from "./main";

export type AuthLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
};

export function AuthLayout({ sx, children }: AuthLayoutProps) {
  const layoutQuery: Breakpoint = "md";
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (profile && profile.role) {
      navigate(`/${profile.role}`);
    }
  }, [profile, navigate]);

  if (localStorage.getItem("accessToken")) {
    return <Loader />;
  }
  return (
    <LayoutSection
      headerSection={null}
      footerSection={null}
      cssVars={{ "--layout-auth-content-width": "420px" }}
      sx={{
        "&::before": {
          width: 1,
          height: 1,
          zIndex: -1,
          content: "''",
          opacity: 0.24,
          position: "fixed",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundImage: `url(/assets/background/overlay.jpg)`,
          [stylesMode.dark]: { opacity: 0.08 },
        },
        ...sx,
      }}>
      <Main layoutQuery={layoutQuery}>{children}</Main>
    </LayoutSection>
  );
}
