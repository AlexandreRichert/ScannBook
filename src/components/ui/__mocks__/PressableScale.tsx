import { Pressable, type PressableProps } from 'react-native';

type PressableScaleProps = PressableProps & { pressedScale?: number; haptic?: boolean };

/**
 * PressableScale without its press animation: Reanimated does not load under
 * Jest. Behavior and accessibility props go through unchanged.
 * Use it with `jest.mock('@/components/ui/PressableScale')`.
 */
export function PressableScale({ pressedScale: _pressedScale, haptic: _haptic, ...props }: PressableScaleProps) {
  return <Pressable {...props} />;
}
