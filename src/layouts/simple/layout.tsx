import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";
import { Main, CompactContent } from "./main";
import { LayoutSection } from "@/layouts/core/layout-section";

export type SimpleLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
  content?: {
    compact?: boolean;
  };
};

export function SimpleLayout({ sx, children, content }: SimpleLayoutProps) {
  const layoutQuery: Breakpoint = "md";

  return (
    <LayoutSection
      headerSection={null}
      footerSection={null}
      cssVars={{
        "--layout-simple-content-compact-width": "448px",
      }}
      sx={sx ?? {}}>
      <Main>
        {content?.compact ?
          <CompactContent layoutQuery={layoutQuery}>{children}</CompactContent>
        : children}
      </Main>
    </LayoutSection>
  );
}
