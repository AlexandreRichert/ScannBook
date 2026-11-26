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
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { BottomTabBar, Fonts, Palette } from '@/constants/theme';

type IconName = SymbolViewProps['name'];

// A JS bar rather than NativeTabs: on iOS 26 the system draws the liquid glass
// bar and ignores backgroundColor, so the dark mockup bar cannot be reproduced natively
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} renderFn={renderTab} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton
              label="Accueil"
              icon={{ ios: 'house', android: 'home', web: 'home' }}
              focusedIcon={{ ios: 'house.fill', android: 'home', web: 'home' }}
            />
          </TabTrigger>
          <TabTrigger name="library" href="/library" asChild>
            <TabButton
              label="Bibliothèque"
              icon={{ ios: 'books.vertical', android: 'library_books', web: 'library_books' }}
              focusedIcon={{ ios: 'books.vertical.fill', android: 'library_books', web: 'library_books' }}
            />
          </TabTrigger>
          <TabTrigger name="scan" href="/scan" asChild>
            <ScanButton />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton
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
  const color = isFocused ? Palette.inkInverse : Palette.inkDisabled;
  const progress = useSharedValue(isFocused ? 1 : 0);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * progress.get() }, { scale: 1 + 0.08 * progress.get() }],
  }));

  useEffect(() => {
    progress.set(withSpring(isFocused ? 1 : 0, { damping: 16, stiffness: 260 }));
  }, [isFocused, progress]);

  return (
    <PressableScale
      {...props}
      haptic={!isFocused}
      pressedScale={0.92}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tab}>
      <Animated.View style={iconStyle}>
        <SymbolView name={isFocused ? focusedIcon : icon} size={22} tintColor={color} />
      </Animated.View>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

function ScanButton({ isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <View style={styles.tab}>
      <PressableScale
        {...props}
        haptic={!isFocused}
        pressedScale={0.9}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel="Scanner un livre"
        style={[styles.scan, isFocused && styles.scanFocused]}>
        <SymbolView
          name={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
          size={24}
          tintColor={Palette.inkInverse}
        />
      </PressableScale>
    </View>
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
    backgroundColor: Palette.ink,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  scan: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Palette.accent,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  scanFocused: {
    borderColor: Palette.inkInverse,
  },
});
