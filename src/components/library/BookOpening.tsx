import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BookCover } from '@/components/BookCover';
import { Palette } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';

/** What a `ref` on a View holds: the type to give `useRef` for a book that can be opened. */
export type BookTarget = ComponentRef<typeof View>;

type Rect = { x: number; y: number; width: number; height: number };
type Opening = {
  book: LibraryBook;
  from: Rect;
  stage: { width: number; height: number };
  /** Color of the pressed spine, faded out as the cover comes forward. */
  tint?: string;
};
type OpenBook = (book: LibraryBook, target: BookTarget | null, tint?: string) => void;

const MOVE_MS = 300;
const OPEN_DELAY_MS = 240;
const OPEN_MS = 280;
// Long enough for the book screen to cover this one before the overlay is removed
const CLEAR_AFTER_MS = 500;

const BookOpeningContext = createContext<OpenBook | null>(null);

/**
 * Opens a book's screen. Inside a `BookOpeningProvider` the pressed book first
 * comes forward and opens; anywhere else it is a plain navigation.
 */
export function useOpenBook() {
  const router = useRouter();
  const open = useContext(BookOpeningContext);

  return useCallback(
    (book: LibraryBook, target: RefObject<BookTarget | null>, tint?: string) => {
      if (open) open(book, target.current, tint);
      else router.push(`/book/${book.isbn13}`);
    },
    [open, router],
  );
}

/** Wraps a screen whose books should come forward and open before their own screen takes over. */
export function BookOpeningProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const stageRef = useRef<BookTarget>(null);
  const [opening, setOpening] = useState<Opening | null>(null);
  const busy = useRef(false);

  const open = useCallback<OpenBook>(
    (book, target, tint) => {
      if (busy.current) return;
      const stage = stageRef.current;
      if (!target || !stage) {
        router.push(`/book/${book.isbn13}`);
        return;
      }
      busy.current = true;
      // Both measured in the window, then subtracted: the overlay is laid out inside the stage, below the header
      stage.measureInWindow((stageX, stageY, stageWidth, stageHeight) => {
        target.measureInWindow((x, y, width, height) => {
          setOpening({
            book,
            tint,
            from: { x: x - stageX, y: y - stageY, width, height },
            stage: { width: stageWidth, height: stageHeight },
          });
        });
      });
    },
    [router],
  );

  const pushed = useRef(false);
  const finish = useCallback(() => {
    // Called by the end of the animation and by its safety timer: only the first one may open the screen
    if (!opening || pushed.current) return;
    pushed.current = true;
    router.push(`/book/${opening.book.isbn13}`);
    setTimeout(() => {
      busy.current = false;
      pushed.current = false;
      setOpening(null);
    }, CLEAR_AFTER_MS);
  }, [opening, router]);

  return (
    <BookOpeningContext value={open}>
      <View ref={stageRef} style={styles.stage} collapsable={false}>
        {children}
        {opening && <OpeningBook key={opening.book.id} opening={opening} onDone={finish} />}
      </View>
    </BookOpeningContext>
  );
}

function OpeningBook({ opening, onDone }: { opening: Opening; onDone: () => void }) {
  const { book, from, stage, tint } = opening;
  const width = Math.min(190, stage.width * 0.5);
  const height = width * 1.5;
  const centerX = stage.width / 2;
  const centerY = stage.height * 0.42;
  const offsetX = from.x + from.width / 2 - centerX;
  const offsetY = from.y + from.height / 2 - centerY;
  const startScaleX = from.width / width;
  const startScaleY = from.height / height;

  const move = useSharedValue(0);
  const open = useSharedValue(0);

  useEffect(() => {
    move.set(withTiming(1, { duration: MOVE_MS, easing: Easing.out(Easing.cubic) }));
    open.set(
      withDelay(
        OPEN_DELAY_MS,
        withTiming(1, { duration: OPEN_MS, easing: Easing.inOut(Easing.cubic) }, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(onDone);
        }),
      ),
    );
    // Whatever happens to the animation, the tap must still open the book
    const fallback = setTimeout(onDone, OPEN_DELAY_MS + OPEN_MS + 400);
    return () => clearTimeout(fallback);
  }, [move, open, onDone]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: 0.94 * move.get() }));
  const bookStyle = useAnimatedStyle(() => {
    const progress = move.get();
    const zoom = 1 + 0.1 * open.get();
    return {
      transform: [
        { translateX: (1 - progress) * offsetX },
        { translateY: (1 - progress) * offsetY },
        { scaleX: (startScaleX + (1 - startScaleX) * progress) * zoom },
        { scaleY: (startScaleY + (1 - startScaleY) * progress) * zoom },
      ],
    };
  });
  const coverStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${-80 * open.get()}deg` }],
  }));
  const tintStyle = useAnimatedStyle(() => ({ opacity: 1 - move.get() }));

  return (
    <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View
        style={[styles.book, { left: centerX - width / 2, top: centerY - height / 2, width, height }, bookStyle]}>
        <View style={styles.pages}>
          {[0.22, 0.34, 0.46, 0.58, 0.7].map((top) => (
            <View key={top} style={[styles.line, { top: height * top }]} />
          ))}
        </View>
        <Animated.View style={[styles.cover, coverStyle]}>
          <BookCover
            isbn13={book.isbn13}
            title={book.title}
            authors={book.authors}
            coverUrl={book.cover_url ?? undefined}
            width={width}
          />
          {tint && <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: tint }, tintStyle]} />}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.paper,
  },
  book: {
    position: 'absolute',
  },
  pages: {
    ...StyleSheet.absoluteFill,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  line: {
    position: 'absolute',
    left: '16%',
    right: '12%',
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.line,
  },
  // Swings on its left edge, like a cover on its hinge
  cover: {
    transformOrigin: 'left center',
    overflow: 'hidden',
    borderRadius: 4,
  },
});
