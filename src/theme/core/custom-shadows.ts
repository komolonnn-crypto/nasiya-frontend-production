import { varAlpha } from '@/theme/styles';
import { grey, info, error, common, primary, success, warning, secondary } from './palette';

export interface CustomShadows {
  z1?: string;
  z4?: string;
  z8?: string;
  z12?: string;
  z16?: string;
  z20?: string;
  z24?: string;
  primary?: string;
  secondary?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  card?: string;
  dialog?: string;
  dropdown?: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
  interface ThemeVars {
    customShadows: CustomShadows;
  }
}

export function createShadowColor(colorChannel: string) {
  return `0 8px 16px 0 ${varAlpha(colorChannel, 0.24)}`;
}

export function customShadows() {
  const colorChannel = grey['500Channel'] ?? '158 158 158';

  return {
    z1: `0 1px 2px 0 ${varAlpha(colorChannel, 0.16)}`,
    z4: `0 4px 8px 0 ${varAlpha(colorChannel, 0.16)}`,
    z8: `0 8px 16px 0 ${varAlpha(colorChannel, 0.16)}`,
    z12: `0 12px 24px -4px ${varAlpha(colorChannel, 0.16)}`,
    z16: `0 16px 32px -4px ${varAlpha(colorChannel, 0.16)}`,
    z20: `0 20px 40px -4px ${varAlpha(colorChannel, 0.16)}`,
    z24: `0 24px 48px 0 ${varAlpha(colorChannel, 0.16)}`,
    dialog: `-40px 40px 80px -8px ${varAlpha(common['blackChannel'] ?? '0 0 0', 0.24)}`,
    card: `0 0 2px 0 ${varAlpha(colorChannel, 0.2)}, 0 12px 24px -4px ${varAlpha(colorChannel, 0.12)}`,
    dropdown: `0 0 2px 0 ${varAlpha(colorChannel, 0.24)}, -20px 20px 40px -4px ${varAlpha(colorChannel, 0.24)}`,
    primary: createShadowColor(primary['mainChannel'] ?? '0 167 111'),
    secondary: createShadowColor(secondary['mainChannel'] ?? '142 51 255'),
    info: createShadowColor(info['mainChannel'] ?? '0 184 217'),
    success: createShadowColor(success['mainChannel'] ?? '34 197 94'),
    warning: createShadowColor(warning['mainChannel'] ?? '255 171 0'),
    error: createShadowColor(error['mainChannel'] ?? '255 86 48'),
  };
}
