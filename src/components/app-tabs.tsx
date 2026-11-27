import {
  defaultTabsSlotRender,
  TabList,
  type TabListProps,
  Tabs,
  TabSlot,
  type TabSlotProps,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { BottomTabBar, Fonts, Palette } from '@/constants/theme';

type IconName = SymbolViewProps['name'];

// A JS bar rather than NativeTabs: on iOS 26 the system draws the liquid glass
// bar and ignores backgroundColor, so the bar's own surface cannot be set natively
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} renderFn={renderTab} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton
              testID="tab-home"
              label="Accueil"
              icon={{ ios: 'house', android: 'home', web: 'home' }}
              focusedIcon={{ ios: 'house.fill', android: 'home', web: 'home' }}
            />
          </TabTrigger>
          <TabTrigger name="library" href="/library" asChild>
            <TabButton
              testID="tab-library"
              label="Bibliothèque"
              icon={{ ios: 'books.vertical', android: 'library_books', web: 'library_books' }}
              focusedIcon={{ ios: 'books.vertical.fill', android: 'library_books', web: 'library_books' }}
            />
          </TabTrigger>
          <TabTrigger name="scan" href="/scan" asChild>
            <TabButton
              testID="tab-scan"
              label="Scanner"
              icon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
              focusedIcon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
            />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton
              testID="tab-profile"
              label="Profil"
              icon={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
              focusedIcon={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
            />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children, style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View {...props} style={[styles.dock, { bottom: Math.max(insets.bottom, BottomTabBar.gap) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist">
        {children}
      </View>
    </View>
  );
}

// The trigger's ref is typed against expo-router's own View type, which Pressable rejects; nothing needs it
type TabButtonProps = TabTriggerSlotProps & { label: string; icon: IconName; focusedIcon: IconName };

function TabButton({ label, icon, focusedIcon, isFocused, ref: _ref, ...props }: TabButtonProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  // A plain fade: any scale or bounce here reads as a pulse on every tab change
  const discStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  useEffect(() => {
    progress.set(withTiming(isFocused ? 1 : 0, { duration: 140 }));
  }, [isFocused, progress]);

  return (
    <PressableScale
      {...props}
      haptic={!isFocused}
      pressedScale={1}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tab}>
      <View style={styles.icon}>
        <Animated.View style={[styles.disc, discStyle]} />
        <SymbolView
          name={isFocused ? focusedIcon : icon}
          size={20}
          tintColor={isFocused ? Palette.inkInverse : Palette.inkSecondary}
        />
      </View>
      <Text style={[styles.label, isFocused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

// Tab screens stay mounted, so the fade replays each time one comes to the front
function FocusFade({ focused, children }: PropsWithChildren<{ focused: boolean }>) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(6);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ translateY: offset.get() }] }));

  useEffect(() => {
    if (!focused) return;
    opacity.set(0);
    offset.set(6);
    opacity.set(withTiming(1, { duration: 200 }));
    offset.set(withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) }));
  }, [focused, opacity, offset]);

  return <Animated.View style={[styles.slot, style]}>{children}</Animated.View>;
}

const renderTab: TabSlotProps['renderFn'] = (descriptor, options) =>
  defaultTabsSlotRender(
    { ...descriptor, render: () => <FocusFade focused={options.isFocused}>{descriptor.render()}</FocusFade> },
    options,
  );

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    height: BottomTabBar.height,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  disc: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    backgroundColor: Palette.accent,
  },
  label: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  labelFocused: {
    color: Palette.ink,
    fontWeight: '700',
  },
});
