// Excel-style jadval uchun umumiy stillar
import type { SxProps, Theme } from '@mui/material';

export const EXCEL_COLORS = {
  // Excel header ranglari
  headerBg: '#217346',
  headerBgHover: '#1a5c37',
  headerText: '#FFFFFF',
  headerBorder: '#1A5C37',
  
  // Grid ranglari (CSS vars for dark mode support)
  gridLine: 'rgba(var(--palette-grey-500Channel) / 0.2)',
  gridLineLight: 'rgba(var(--palette-grey-500Channel) / 0.12)',

  // Row ranglari (CSS vars for dark mode support)
  rowEven: 'var(--palette-background-paper)',
  rowOdd: 'var(--palette-background-neutral)',
  rowHover: 'rgba(var(--palette-primary-mainChannel) / 0.08)',
  rowSelected: 'rgba(var(--palette-primary-mainChannel) / 0.16)',

  // Cell ranglari (CSS vars for dark mode support)
  cellText: 'var(--palette-text-primary)',
  cellTextSecondary: 'var(--palette-text-secondary)',
  cellBorder: 'rgba(var(--palette-grey-500Channel) / 0.2)',
} as const;

export const EXCEL_DIMENSIONS = {
  // Balandliklar (Excel kabi compact)
  headerHeight: 22,
  rowHeight: 32,
  
  // Padding
  cellPaddingX: 6,
  cellPaddingY: 4,
  
  // Font sizes
  headerFontSize: 10,
  cellFontSize: 10,
  
  // Border widths
  borderWidth: 1,
} as const;

// Header cell style
export const excelHeaderCellStyle: SxProps<Theme> = {
  height: `${EXCEL_DIMENSIONS.headerHeight}px`,
  minHeight: `${EXCEL_DIMENSIONS.headerHeight}px`,
  maxHeight: `${EXCEL_DIMENSIONS.headerHeight}px`,
  px: `${EXCEL_DIMENSIONS.cellPaddingX}px`,
  py: `${EXCEL_DIMENSIONS.cellPaddingY}px`,
  fontSize: `${EXCEL_DIMENSIONS.headerFontSize}px`,
  fontWeight: 600,
  lineHeight: `${EXCEL_DIMENSIONS.headerHeight - EXCEL_DIMENSIONS.cellPaddingY * 2}px`,
  backgroundColor: `${EXCEL_COLORS.headerBg} !important`,
  color: `${EXCEL_COLORS.headerText} !important`,
  borderRight: `${EXCEL_DIMENSIONS.borderWidth}px solid ${EXCEL_COLORS.headerBorder}`,
  borderBottom: `${EXCEL_DIMENSIONS.borderWidth}px solid ${EXCEL_COLORS.headerBorder}`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'sticky',
  top: 0,
  zIndex: 3,
  userSelect: 'none',
  transition: 'background-color 0.15s ease',
  verticalAlign: 'middle',
  '&:hover': {
    backgroundColor: `${EXCEL_COLORS.headerBgHover} !important`,
  },
};

// Body cell style
export const excelBodyCellStyle: SxProps<Theme> = {
  height: `${EXCEL_DIMENSIONS.rowHeight}px`,
  minHeight: `${EXCEL_DIMENSIONS.rowHeight}px`,
  maxHeight: `${EXCEL_DIMENSIONS.rowHeight}px`,
  px: `${EXCEL_DIMENSIONS.cellPaddingX}px`,
  py: `${EXCEL_DIMENSIONS.cellPaddingY}px`,
  fontSize: `${EXCEL_DIMENSIONS.cellFontSize}px`,
  lineHeight: `${EXCEL_DIMENSIONS.rowHeight - EXCEL_DIMENSIONS.cellPaddingY * 2}px`,
  color: 'var(--palette-text-primary)',
  borderRight: `${EXCEL_DIMENSIONS.borderWidth}px solid rgba(var(--palette-grey-500Channel) / 0.2)`,
  borderBottom: `${EXCEL_DIMENSIONS.borderWidth}px solid rgba(var(--palette-grey-500Channel) / 0.2)`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: 'background-color 0.1s ease',
  verticalAlign: 'middle',
};

// Row style
export const excelRowStyle: SxProps<Theme> = {
  height: `${EXCEL_DIMENSIONS.rowHeight}px`,
  minHeight: `${EXCEL_DIMENSIONS.rowHeight}px`,
  maxHeight: `${EXCEL_DIMENSIONS.rowHeight}px`,
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',
  '&:nth-of-type(even)': {
    backgroundColor: 'var(--palette-background-paper)',
  },
  '&:nth-of-type(odd)': {
    backgroundColor: 'var(--palette-background-neutral)',
  },
  '&:hover': {
    backgroundColor: 'rgba(var(--palette-primary-mainChannel) / 0.08) !important',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(var(--palette-primary-mainChannel) / 0.16) !important',
    '&:hover': {
      backgroundColor: 'rgba(var(--palette-primary-mainChannel) / 0.24) !important',
    },
  },
};

// Table container style
export const excelTableContainerStyle: SxProps<Theme> = {
  border: `${EXCEL_DIMENSIONS.borderWidth}px solid rgba(var(--palette-grey-500Channel) / 0.2)`,
  borderRadius: 0,
  maxHeight: 'calc(100vh - 280px)',
  overflow: 'auto',
  backgroundColor: 'var(--palette-background-paper)',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  // Custom scrollbar
  '&::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'var(--palette-background-neutral)',
    borderLeft: `1px solid rgba(var(--palette-grey-500Channel) / 0.2)`,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(var(--palette-grey-500Channel) / 0.5)',
    borderRadius: '6px',
    border: '2px solid var(--palette-background-neutral)',
    '&:hover': {
      backgroundColor: 'rgba(var(--palette-grey-500Channel) / 0.7)',
    },
  },
  '&::-webkit-scrollbar-corner': {
    backgroundColor: 'var(--palette-background-neutral)',
  },
};

// Card wrapper style
export const excelCardStyle: SxProps<Theme> = {
  boxShadow: 'none',
  border: `${EXCEL_DIMENSIONS.borderWidth}px solid ${EXCEL_COLORS.gridLine}`,
  borderRadius: '18px',
  overflow: 'hidden',
  backgroundColor: 'transparent',
};

// Pagination style
export const excelPaginationStyle: SxProps<Theme> = {
  borderTop: `${EXCEL_DIMENSIONS.borderWidth}px solid rgba(var(--palette-grey-500Channel) / 0.2)`,
  backgroundColor: 'var(--palette-background-neutral)',
  '& .MuiTablePagination-toolbar': {
    minHeight: '36px',
    px: 1.5,
  },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: '10px',
    color: 'var(--palette-text-secondary)',
    m: 0,
  },
  '& .MuiTablePagination-select': {
    fontSize: '10px',
  },
  '& .MuiTablePagination-actions': {
    ml: 1,
    '& .MuiIconButton-root': {
      padding: '4px',
    },
  },
};

// Sticky column styles
export const excelStickyLeftStyle = (offset: number = 0): SxProps<Theme> => ({
  position: 'sticky',
  left: offset,
  zIndex: 2,
  boxShadow: '2px 0 4px -2px rgba(0,0,0,0.12)',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: 'rgba(var(--palette-grey-500Channel) / 0.2)',
  },
});

export const excelStickyRightStyle = (offset: number = 0): SxProps<Theme> => ({
  position: 'sticky',
  right: offset,
  zIndex: 2,
  boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.12)',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: 'rgba(var(--palette-grey-500Channel) / 0.2)',
  },
});

// Checkbox style
export const excelCheckboxStyle: SxProps<Theme> = {
  p: 0,
  transform: 'scale(0.75)',
  '& .MuiSvgIcon-root': {
    fontSize: '14px',
  },
};

// Empty/No data style
export const excelNoDataStyle: SxProps<Theme> = {
  py: 4,
  textAlign: 'center',
  color: 'var(--palette-text-secondary)',
  fontSize: '11px',
  fontStyle: 'italic',
};
