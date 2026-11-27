# ADR-008: Drawing Our Own Tab Bar

- **Status**: Accepted
- **Date**: 2026-11-26

## Decision

The bottom tab bar is a component of ours, `src/components/app-tabs.tsx`, built on the headless tabs of `expo-router/ui` (`Tabs`, `TabList`, `TabTrigger`, `TabSlot`).

Expo Router keeps doing the navigation: routes, tab state, deep links, keeping tab screens mounted. We only draw the bar: a white floating bar with four tabs, a disc that fades in behind the active icon, and a short fade when a tab comes to the front.

## Background

The Expo template ships with `NativeTabs`, the system tab bar. On iOS 26 the system draws it with Liquid Glass, and the Expo documentation states that the tab bar background props have no effect there: `backgroundColor` only applies on iOS 18 and earlier.

The redesign (PR #79) gives the app one visual identity, paper background and brown accent, and the tab bar is on screen all the time. A bar whose surface we cannot set, and that looks different on each iOS version and on Android, did not fit.

## Considerations

- **`NativeTabs`** (template default): the real system bar, with its accessibility and platform behaviour for free. But its surface cannot be set on iOS 26, and its look depends on the OS version.
- **JavaScript tabs** (`Tabs` from `expo-router`, React Navigation's bottom tabs): mature and stable, colours can be set through options. A floating bar with an animated indicator still means passing a custom `tabBar` component, so we would write the bar anyway, on top of a default one we do not use.
- **Headless tabs from `expo-router/ui`** (chosen): no default look to fight, we style plain views. Expo marks this API as experimental.

## Consequences

- The bar looks the same on iOS, Android and web, and lives in one file.
- We give up the system look (Liquid Glass on iOS 26, Material on Android) and whatever the system bar gains in future OS versions.
- Accessibility is ours to maintain: the bar sets the `tablist` and `tab` roles, the selected state and the labels by hand, and each tab keeps a touch target of at least 48 points.
- The bar floats above the content. Every tab screen must add `BottomTabInset` (`src/constants/theme.ts`) to its bottom padding, or its last items sit under the bar.
- `expo-router/ui` is experimental, so an SDK upgrade may change it. The risk is contained: only `app-tabs.tsx` imports it.
- Icons still come from `expo-symbols`: SF Symbols on iOS, Material names on Android and web.
- The bar was only checked on iOS and in the web build. Android is untested.

## Ownership

The development team is responsible for `app-tabs.tsx`, including its accessibility.

## Review

Revisit when upgrading the Expo SDK, if `expo-router/ui` changes or `NativeTabs` lets us set the bar's surface on iOS 26, and after the first test on Android.
