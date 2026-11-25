import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Platform, StyleSheet, View } from 'react-native';

import { ScanOverlay } from '@/components/scan/ScanOverlay';
import { ScanUnavailable } from '@/components/scan/ScanUnavailable';
import { parseIsbn } from '@/lib/Isbn';

/** How long « Ce code-barres n'est pas un ISBN » stays after the code leaves the frame. */
const REJECTED_MESSAGE_MS = 3000;

/**
 * Scans a book's barcode. A book barcode is always an EAN-13 (ISBN-13), even
 * when an ISBN-10 is printed next to it.
 */
export default function ScanScreen() {
  const router = useRouter();
  // TODO(US-01): open the manual ISBN entry, a modal shown over the scanner
  // (`/isbn`, Figma frame 05). Until it exists, the ISBN test tab stands in.
  const openManualEntry = () => router.navigate('/isbn-test');

  if (Platform.OS === 'web') {
    return (
      <ScanUnavailable
        icon={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
        title="Scan indisponible sur le web"
        body="Le scan de code-barres se fait depuis l’application mobile. Ici, saisis l’ISBN du livre."
        onManualEntry={openManualEntry}
      />
    );
  }

  return <CameraScanner onManualEntry={openManualEntry} />;
}

function CameraScanner({ onManualEntry }: { onManualEntry: () => void }) {
  const router = useRouter();
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
      router.push(`/book/${parsed.isbn13}`);
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
        <ActivityIndicator color="#fff" accessibilityLabel="Chargement de la caméra" />
      </View>
    );
  }

  // Never asked: explain first, the system prompt only comes on tap.
  if (permission.status === 'undetermined') {
    return (
      <ScanUnavailable
        icon={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }}
        title="Scanner tes livres"
        body="ScannBook utilise la caméra pour lire le code-barres de tes livres et les retrouver sans rien saisir."
        primary={{ label: 'Autoriser la caméra', onPress: () => void requestPermission() }}
        onManualEntry={onManualEntry}
      />
    );
  }

  // Denied: ask again while the system allows it, otherwise send to the settings.
  if (!permission.granted) {
    return (
      <ScanUnavailable
        icon={{ ios: 'video.slash', android: 'no_photography', web: 'no_photography' }}
        title="Accès à la caméra refusé"
        body={
          permission.canAskAgain
            ? 'ScannBook a besoin de la caméra pour lire le code-barres de tes livres.'
            : 'ScannBook a besoin de la caméra pour lire le code-barres de tes livres. Autorise-la dans les réglages du téléphone.'
        }
        primary={
          permission.canAskAgain
            ? { label: 'Autoriser la caméra', onPress: () => void requestPermission() }
            : { label: 'Ouvrir les réglages', onPress: () => void Linking.openSettings() }
        }
        onManualEntry={onManualEntry}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
