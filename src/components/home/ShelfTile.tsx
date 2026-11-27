import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import { spineFor } from '@/lib/Spines';

const MAX_SPINES = 6;

type ShelfTileProps = {
  label: string;
  isbns: string[];
  onPress: () => void;
};

/** A shelf in miniature: its first spines standing on a thin plank, as on the « Mes piles » screen. */
export function ShelfTile({ label, isbns, onPress }: ShelfTileProps) {
  const count = isbns.length;
  const countLabel = `${count} ${count > 1 ? 'livres' : 'livre'}`;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${countLabel}`}
      style={styles.tile}>
      <View style={styles.books}>
        {count === 0 ? (
          <View style={styles.ghost} />
        ) : (
          isbns.slice(0, MAX_SPINES).map((isbn) => {
            const spine = spineFor(isbn);
            return (
              <View
                key={spine.key}
                style={[styles.spine, { backgroundColor: spine.color, width: spine.width, height: spine.height }]}
              />
            );
          })
        )}
      </View>
      <View style={styles.plank} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.count}>{countLabel}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
  },
  books: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  spine: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(0, 0, 0, 0.34) 100%)',
  },
  ghost: {
    width: 12,
    height: 58,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.lineStrong,
  },
  plank: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  count: {
    textAlign: 'center',
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
});
