import type { Theme, SxProps, CSSObject } from "@mui/material/styles";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

import { baseVars } from "@/layouts/config-vars";
import { layoutClasses } from "@/layouts/classes";

// ----------------------------------------------------------------------

export type LayoutSectionProps = {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
}: LayoutSectionProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        body: {
          ...baseVars(theme),
          ...cssVars,
          // Ensures the scrollbar and body background match the theme
          backgroundColor: isDark ? "#121212" : "#e5e7eb",
        },
      }}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Box 
        id="root__layout" 
        className={layoutClasses.root} 
        sx={{ 
          display: 'flex', 
          minHeight: '100vh', 
          ...sx 
        }}
      >
        {sidebarSection}
        
        <Box
          display="flex"
          flex="1 1 auto"
          flexDirection="column"
          className={layoutClasses.hasSidebar}
        >
          {headerSection}

          {/* MAIN CONTENT AREA */}
          <Box
            component="main"
            sx={{
              p: { xs: 2, sm: 3 }, // Responsive padding
              flexGrow: 1,
              minHeight: "100%",
              display: 'flex',
              flexDirection: 'column',
              
              // DARK MODE LOGIC:
              // Light: Your previous #e5e7eb
              // Dark: A deep neutral dark (#0F1114) that makes your cards "pop"
              bgcolor: isDark ? "#0F1114" : "#e5e7eb",
              
              transition: theme.transitions.create(["background-color"], {
                duration: theme.transitions.duration.standard,
              }),
            }}
          >
            {children}
          </Box>
          
          {footerSection}
        </Box>
      </Box>
    </>
  );
}