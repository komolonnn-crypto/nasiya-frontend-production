import { Helmet } from "react-helmet-async";

import { AuditLogView } from "@/sections/audit-log/view";

export default function AuditLogPage() {
  return (
    <>
      <Helmet>
        <title>Audit Log | Dashboard</title>
      </Helmet>

      <AuditLogView />
    </>
  );
}
