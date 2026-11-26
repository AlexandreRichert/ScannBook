import '@/global.css';

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import type { FontFamilyDefinition } from 'expo-font';
import { Platform } from 'react-native';

import type { Shelf } from '@/lib/Shelves';

/** Variables of the Figma « Maquettes v2 » file. */
export const Palette = {
  paper: '#F6F3EE',
  paperRaised: '#FFFFFF',
  paperSunken: '#E9E4DB',
  // Warm charcoal rather than near black: softer on the paper tones, still 14:1 on paper
  ink: '#2A2622',
  inkSecondary: '#5C5A56',
  // Darker than the Figma #726E68, which falls under 4.5:1 on the sunken and wall surfaces
  inkTertiary: '#67635D',
  inkDisabled: '#9A968F',
  inkInverse: '#FFFFFF',
  line: '#DDD7CC',
  /** Edge of fields and outlined buttons: 3:1 against paper, as WCAG asks for control boundaries. */
  lineStrong: '#8F8A82',
  accent: '#EE5B3A',
  accentStrong: '#C03D1D',
  danger: '#B3261E',
  wood: '#2A2623',
  woodWall: '#EAE3D7',
} as const;

/** Dot color of each shelf on the pile chips (Figma « pile/* » variables). */
export const ShelfColors: Record<Shelf, string> = {
  wishlist: '#E79AB3',
  to_read: '#7FA8E8',
  reading: '#E2B93B',
  read: '#74BE97',
  abandoned: '#B7B1A8',
};

export const Fonts = {
  display: 'SpaceGrotesk',
  body: 'DMSans',
  mono: Platform.select({ ios: 'ui-monospace', web: 'var(--font-mono)', default: 'monospace' }),
} as const;

// One family per typeface so styles keep picking the face with fontWeight (SDK 58 multi-face loading)
export const AppFonts: FontFamilyDefinition[] = [
  {
    fontFamily: Fonts.display,
    fontDefinitions: [
      { path: SpaceGrotesk_500Medium, weight: 500, style: 'normal' },
      { path: SpaceGrotesk_700Bold, weight: 700, style: 'normal' },
    ],
  },
  {
    fontFamily: Fonts.body,
    fontDefinitions: [
      { path: DMSans_400Regular, weight: 400, style: 'normal' },
      { path: DMSans_500Medium, weight: 500, style: 'normal' },
      { path: DMSans_700Bold, weight: 700, style: 'normal' },
    ],
  },
];

export const BottomTabBar = { height: 64, gap: 16 } as const;

// Room the floating tab bar takes above the safe area, for scroll content to clear it
export const BottomTabInset = BottomTabBar.height + BottomTabBar.gap;
export const MaxContentWidth = 800;
