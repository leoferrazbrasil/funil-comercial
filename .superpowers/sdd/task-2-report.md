# Task 2 Report: Type And Service Layer

## Implemented

- Added `InboxMessage.channel_id`, `InboxConversationState`, and required `CrmSnapshot.conversationStates` types.
- Updated `getCrmSnapshot` to load `inbox_conversation_states` ordered by `updated_at` descending, surface its query error, and return the typed state list.
- Added `archiveInboxConversations`, `unarchiveInboxConversation`, and `reopenInboxConversation`.
  - Archive upserts on `owner_id,telefone,channel_key` and normalizes each phone number.
  - Unarchive/reopen match the generated `channel_key`, using `legacy` for null channel IDs.
  - Archive writes use the authenticated user as `archived_by` and apply the requested default reason when empty.
- Added `conversationStates: []` to Inbox's local `emptySnapshot` fallback.

## Verification

- `git diff --check` passed.
- `npm run typecheck` ran and failed only because unrelated `CrmSnapshot` fallback fixtures have not yet been updated with the new required `conversationStates` field:
  - `src/App.tsx`
  - `src/components/SharedUI.tsx`
  - `src/lib/dashboardMetrics.test.ts`
  - `src/pages/Contacts.tsx`
  - `src/pages/Dashboard.tsx`
  - `src/pages/Leads.tsx`
  - `src/pages/Login.tsx`
  - `src/pages/Pipeline.tsx`

Those files are outside Task 2 ownership and were not modified.

## Typecheck Follow-up Fix

- Added `conversationStates: []` to the eight remaining `CrmSnapshot` empty fallbacks and to the dashboard metrics test snapshot builder.
- No unrelated behavior was changed.

## Verification

- `npm run typecheck` passed with exit code 0.

## Task 2 Re-review Fix

- Updated `conversationStatePhoneKey` to strip the trunk zero after country code `55`, matching Inbox `unifyPhone` for `550...` values such as `55011998765432`.
- Added Vitest coverage for the `550...` variant and a focused `reopenInboxConversation` assertion covering the canonical phone key and `legacy` channel key.

## Task 2 Re-review Verification

- `npm run test -- src/lib/crmService.test.ts` passed.
- `npm run typecheck` passed.

## Review Fix: Archive State Phone Keys

- Added exported `conversationStatePhoneKey` in `src/lib/crmService.ts` for archive-state identity. It strips formatting and leading zeroes, adds the Brazilian `55` country code to 10/11-digit numbers, and removes the mobile ninth digit from 13-digit Brazilian numbers so state keys match Inbox grouping.
- Kept `normalizePhone` unchanged for contacts, messages, and channels, where the dialable phone number must retain the ninth digit.
- Updated archive writes and unarchive lookups to use `conversationStatePhoneKey`; `reopenInboxConversation` remains covered because it delegates to unarchive.
- Exported `ConversationArchiveTarget`.
- Added `src/lib/crmService.test.ts` with focused helper cases plus mocked Supabase assertions for archive upsert payloads and null-channel legacy unarchive filters.

## Review Fix Verification

- `npm test -- src/lib/crmService.test.ts` passed: 7 tests.
- `git diff --check` passed.
- `npm run typecheck` passed with exit code 0.
