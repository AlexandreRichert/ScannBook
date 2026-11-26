# ADR-004: Resetting Passwords with an Email Code

- **Status**: Accepted
- **Date**: 2026-11-26

## Decision

A user who forgot their password receives a one-time code by email, then types it in the app along with a new password:

- **Flow**: `resetPasswordForEmail(email)` sends the code, `verifyOtp({ email, token, type: 'recovery' })` checks it, and `updateUser({ password })` saves the new password. Two screens in the `(auth)` group: `forgot-password` and `reset-password`.
- **Email template**: the Supabase _Reset password_ template shows `{{ .Token }}` instead of a link.
- **Email delivery**: custom SMTP through a Gmail account created for the project, authenticated with an app password. Supabase only lets us edit email templates once custom SMTP is set up.
- **Navigation**: a valid code opens a session before the new password is saved. `useAuth` exposes `isRecovering`, set on the `PASSWORD_RECOVERY` event, and the root layout keeps the user in `(auth)` until the password is changed.

## Background

Issue #18 asks for a reset email and a confirmation message that does not reveal whether an account exists. By default, Supabase emails a link that must reopen the app on the right screen. Its built-in email service only delivers to members of the project team, at 2 emails per hour, and does not allow editing templates.

## Considerations

Reset method:

- **Link with a deep link** (Supabase default): no template change. But in Expo Go the redirect URL looks like `exp://<local IP>:8081/--/...`, which changes with the network and must be allow-listed in Supabase. The app must also read the tokens from the URL, and email security scanners can open the link first and use it up.
- **Code by email**: works the same on iOS, Android and web, with no URL configuration. It requires a custom template, and therefore custom SMTP.

Email provider:

- **Supabase built-in**: team members only, 2 emails per hour, templates locked. Not usable.
- **Resend**: needs a verified domain to send to other addresses. We have no domain.
- **Brevo**: free tier of 300 emails per day, but free emails carry a Brevo banner, and a Gmail sender relayed through Brevo may land in spam.
- **Gmail with an app password**: no domain needed, around 500 emails per day, and the sender matches the sending server. Supabase warns that Gmail is meant for personal mail.

We chose the code and Gmail: the simplest setup that works in Expo Go within the week.

## Consequences

- Every Supabase auth email now goes out from the project Gmail account. The team must keep access to it.
- The app password only lives in the Supabase SMTP settings. If the Gmail password changes, Google revokes it and emails stop until a new one is entered.
- Custom SMTP is limited to 30 emails per hour by default (Authentication > Rate Limits).
- `resetPasswordForEmail` succeeds for unknown addresses and the screen shows the same message either way, so it never reveals who has an account.
- If the app is killed after the code is accepted but before the new password is saved, the user is signed in with the old password on next launch. This is acceptable: they proved they own the address.
- The SMTP and template settings live in the Supabase dashboard, not in git. They are documented here and in the pull request.

## Ownership

The development team owns the project Gmail account, its app password and the Supabase email settings.

## Review

Before a real release, move to a transactional email provider with our own domain. That will also make it reasonable to turn email confirmation back on (see ADR-003).