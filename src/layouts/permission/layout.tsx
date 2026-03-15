import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { IRole } from "@/types/role";
import type { RootState } from "@/store";

export type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles: IRole;
};

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { loggedIn, profile, isLoadingRefresh } = useSelector(
    (state: RootState) => state.auth,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingRefresh) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("userProfile");

    if (token && savedProfile && !loggedIn) {
      return;
    }

    if (!token && !loggedIn) {
      navigate("/", { replace: true });
      return;
    }

    if (loggedIn && profile.role && requiredRoles !== profile.role) {
      navigate("/", { replace: true });
      return;
    }
  }, [
    profile.role,
    isLoadingRefresh,
    loggedIn,
    navigate,
    requiredRoles,
    profile.firstname,
  ]);

  if (isLoadingRefresh) {
    return null;
  }

  return <>{children}</>;
}
