import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { tapFeedback } from '@/lib/Haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  /** Static style only: the press feedback is the scale, and it replaces any transform given here. */
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  haptic?: boolean;
};

/** Pressable that sinks slightly under the finger and springs back, run on the UI thread. */
export function PressableScale({
  style,
  pressedScale = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.set(withTiming(pressedScale, { duration: 90 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, { damping: 14, stiffness: 320 }));
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic) tapFeedback();
        onPress?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
