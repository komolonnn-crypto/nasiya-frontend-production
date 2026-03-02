import type { Theme } from '@mui/material/styles'
import { varAlpha } from '@/theme/styles'

// ----------------------------------------------------------------------
export const baseVars = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark'

  // Suggestion: Amber Yellow for the best contrast in Dark Mode
  const activeYellow = '#FFD600' 

  return {
    // NAV
    '--layout-nav-bg': isDark ? '#1C1C1E' : theme.vars.palette.background.paper,
    '--layout-nav-border-color': isDark
      ? 'rgba(255,255,255,0.06)' 
      : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
    '--layout-nav-zIndex': 1101,
    '--layout-nav-mobile-width': '320px',

    // NAV ITEM (Inactive States)
    '--layout-nav-item-height': '34px', 
    '--layout-nav-item-color': isDark
      ? 'rgba(255,255,255,0.50)' // Muted text for inactive items
      : '#637381',
    
    // TRACK COLOR (The background of the pill container)
    '--layout-nav-item-hover-bg': isDark
      ? 'rgba(0, 0, 0, 0.20)' // Darker track for better depth
      : '#F2F2F7',
    '--layout-nav-item-hover-color': isDark
      ? '#FFFFFF' 
      : '#212B36',

    // ACTIVE STATE (The selected tab)
    '--layout-nav-item-active-bg': isDark
      ? 'rgba(255, 255, 255, 0.08)' // Subtle glass effect for the active button
      : '#FFFFFF', 
    '--layout-nav-item-active-color': isDark
      ? activeYellow // <--- The Yellow you requested
      : '#007AFF',

    // HEADER
    '--layout-header-blur': '8px',
    '--layout-header-zIndex': 1100,
    '--layout-header-mobile-height': '64px',
    '--layout-header-desktop-height': '60px',
        // LAYOUT & RADIUS
    '--radius-card': '24px',
    '--radius-button': '14px',
    '--radius-pill': '100px',
    
    // HEADER & MODAL
    '--layout-header-bg': isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    '--border-thin': isDark ? '0.5px solid rgba(255, 255, 255, 0.1)' : '0.5px solid rgba(0, 0, 0, 0.08)',

  }
}