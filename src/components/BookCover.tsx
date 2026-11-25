import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BookCoverProps = {
  title: string;
  coverUrl?: string;
  width?: number;
};

/**
 * Book cover with a placeholder showing the title, used when the source has no
 * cover (frequent for French editions on Google Books) or when it fails to load.
 *
 * Give it a `key` tied to the book so the error state resets between books.
 */
export function BookCover({ title, coverUrl, width = 120 }: BookCoverProps) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const size = { width, height: width * 1.5 };

  if (!coverUrl || failed) {
    return (
      <View
        style={[styles.placeholder, size, { backgroundColor: theme.backgroundSelected }]}
        accessibilityRole="image"
        accessibilityLabel={`Pas de couverture pour ${title}`}>
        <ThemedText type="smallBold" style={styles.placeholderTitle} numberOfLines={5}>
          {title}
        </ThemedText>
      </View>
    );
  }

  return (
    <Image
      source={coverUrl}
      style={[styles.image, size]}
      contentFit="cover"
      transition={200}
      accessibilityLabel={`Couverture de ${title}`}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: Spacing.one,
  },
  placeholder: {
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
  placeholderTitle: {
    textAlign: 'center',
  },
});
