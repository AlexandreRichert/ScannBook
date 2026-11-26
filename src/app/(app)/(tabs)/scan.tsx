import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Platform, StyleSheet, View } from 'react-native';

import { ScanOverlay } from '@/components/scan/ScanOverlay';
import { ScanUnavailable } from '@/components/scan/ScanUnavailable';
import { ScanScreenColors as C } from '@/constants/ScanScreenColors';
import { useNavigateOnce } from '@/hooks/useNavigateOnce';
import { parseIsbn } from '@/lib/Isbn';

/** How long « Ce code-barres n'est pas un ISBN » stays after the code leaves the frame. */
const REJECTED_MESSAGE_MS = 3000;

/**
 * Scans a book's barcode. A book barcode is always an EAN-13 (ISBN-13), even
 * when an ISBN-10 is printed next to it.
 */
export default function ScanScreen() {
  // Shared by the scan and both buttons: only the first one opens a screen.
  const navigate = useNavigateOnce();
  // Manual ISBN entry, shown as a modal over the scanner.
  const openManualEntry = () => navigate('/isbn');
  const openSearch = () => navigate('/search');

  if (Platform.OS === 'web') {
    return (
      <ScanUnavailable
        icon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
        title="Scan indisponible sur le web"
        body="Le scan de code-barres se fait depuis l’application mobile. Ici, saisis l’ISBN du livre ou cherche-le par titre ou auteur."
        onManualEntry={openManualEntry}
        onSearch={openSearch}
      />
    );
  }

  return <CameraScanner navigate={navigate} onManualEntry={openManualEntry} onSearch={openSearch} />;
}

type CameraScannerProps = {
  navigate: (href: Href) => void;
  onManualEntry: () => void;
  onSearch: () => void;
};

function CameraScanner({ navigate, onManualEntry, onSearch }: CameraScannerProps) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [torch, setTorch] = useState(false);
  const [locked, setLocked] = useState(false);
  const [rejected, setRejected] = useState(false);
  // The callback fires several times per second: a ref locks synchronously,
  // before the state update is rendered, so only one navigation happens.
  const lockedRef = useRef(false);
  const rejectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resume = useCallback(() => {
    lockedRef.current = false;
    setLocked(false);
    setRejected(false);
  }, []);

  // Only one camera preview can be active: mount it only while the screen is
  // focused, and start a fresh scan each time the user comes back.
  useFocusEffect(
    useCallback(() => {
      resume();
      setFocused(true);
      return () => {
        setFocused(false);
        setTorch(false);
      };
    }, [resume]),
  );

  // The permission may have been granted in the settings meanwhile.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void getPermission();
    });
    return () => subscription.remove();
  }, [getPermission]);

  useEffect(
    () => () => {
      if (rejectedTimerRef.current) clearTimeout(rejectedTimerRef.current);
    },
    [],
  );

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (lockedRef.current) return;

    const parsed = parseIsbn(data);
    if (parsed.ok) {
      lockedRef.current = true;
      if (rejectedTimerRef.current) clearTimeout(rejectedTimerRef.current);
      setRejected(false);
      setLocked(true);
      navigate(`/book/${parsed.isbn13}`);
      return;
    }

    // Shown as long as the code stays in view, then a little longer.
    setRejected(true);
    if (rejectedTimerRef.current) clearTimeout(rejectedTimerRef.current);
    rejectedTimerRef.current = setTimeout(() => setRejected(false), REJECTED_MESSAGE_MS);
  };

  // Waiting for the permission state.
  if (!permission) {
    return (
      <View style={[styles.camera, styles.loading]}>
        <ActivityIndicator color={C.onCamera} accessibilityLabel="Chargement de la caméra" />
      </View>
    );
  }

  if (!permission.granted) {
    // The system can still show its prompt: never asked, or denied once on
    // Android (with Expo Go, the permission is Expo Go's, so it may already
    // be denied on the first visit). Explain first, the prompt only comes on tap.
    if (permission.canAskAgain) {
      return (
        <ScanUnavailable
          icon={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }}
          title="Scanner tes livres"
          body="ScannBook utilise la caméra pour lire le code-barres de tes livres et les retrouver sans rien saisir."
          primary={{ label: 'Autoriser la caméra', onPress: () => void requestPermission() }}
          onManualEntry={onManualEntry}
          onSearch={onSearch}
        />
      );
    }

    // The system will not ask again: only the settings can grant it now.
    return (
      <ScanUnavailable
        icon={{ ios: 'video.slash', android: 'no_photography', web: 'no_photography' }}
        title="Accès à la caméra refusé"
        body="ScannBook a besoin de la caméra pour lire le code-barres de tes livres. Autorise-la dans les réglages du téléphone."
        primary={{ label: 'Ouvrir les réglages', onPress: () => void Linking.openSettings() }}
        onManualEntry={onManualEntry}
        onSearch={onSearch}
      />
    );
  }

  return (
    <View style={styles.camera}>
      <StatusBar style="light" />
      {focused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
          onBarcodeScanned={locked ? undefined : handleScan}
          enableTorch={torch}
        />
      )}
      <ScanOverlay
        torch={torch}
        onToggleTorch={() => setTorch((value) => !value)}
        locked={locked}
        rejected={rejected}
        onManualEntry={onManualEntry}
        onSearch={onSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: C.camera,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
