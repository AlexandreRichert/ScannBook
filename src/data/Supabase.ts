import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing Supabase environment variables');

// Expo Router renders web pages in Node first (web.output "server"), where window does not exist
const isServer = typeof window === 'undefined';

export const supabase = createClient(url, key, {
  auth: {
    storage: isServer ? undefined : AsyncStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    // No browser URL on native, the session never comes from a redirect
    detectSessionInUrl: false,
  },
});

if (!isServer) {
  // Token refresh timers only run while the app is in the foreground
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}