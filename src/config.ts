// next
import { Public_Sans } from 'next/font/google';

// types
import { DefaultConfigProps } from 'types/config';

// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/sample-page';
export const HORIZONTAL_MAX_ITEM = 7;
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '300', '600', '700'] });

export enum SimpleLayoutType {
  SIMPLE = 'simple',
  LANDING = 'landing'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum MenuOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
}

export enum ThemeDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

export enum NavActionType {
  FUNCTION = 'function',
  LINK = 'link'
}

// ==============================|| THEME CONFIG ||============================== //

const config: DefaultConfigProps = {
  fontFamily: publicSans.style.fontFamily,
  i18n: 'en',
  menuOrientation: MenuOrientation.VERTICAL,
  miniDrawer: false,
  container: true,
  mode: ThemeMode.LIGHT,
  presetColor: 'default',
  themeDirection: ThemeDirection.LTR
};

export default config;
