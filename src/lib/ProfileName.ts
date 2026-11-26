import type { User } from '@supabase/supabase-js';

export type ProfileName = { firstName: string; lastName: string };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** First and last name the user typed in the profile, kept in the account metadata. */
export function profileName(user: User | undefined): ProfileName {
  const metadata = user?.user_metadata ?? {};
  return { firstName: text(metadata.first_name), lastName: text(metadata.last_name) };
}

export function fullName({ firstName, lastName }: ProfileName): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}
