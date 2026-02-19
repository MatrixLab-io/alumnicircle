/**
 * One-time script: sync emailVerified from Firebase Auth → Firestore
 *
 * Usage:
 *   node scripts/sync-email-verified.mjs
 *
 * Requirements:
 *   - Place your Firebase service account key at: scripts/serviceAccountKey.json
 *   - Download it from: Firebase Console → Project Settings → Service accounts → Generate new private key
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function syncEmailVerified() {
  console.log('Starting emailVerified sync...\n');

  let updated = 0;
  let skipped = 0;
  let pageToken;

  do {
    const listResult = await auth.listUsers(1000, pageToken);

    for (const userRecord of listResult.users) {
      if (!userRecord.emailVerified) {
        skipped++;
        continue;
      }

      const userRef = db.collection('users').doc(userRecord.uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        console.log(`  [SKIP] ${userRecord.email} — no Firestore profile`);
        skipped++;
        continue;
      }

      const data = snap.data();

      if (data.emailVerified === true) {
        skipped++;
        continue;
      }

      await userRef.update({ emailVerified: true });
      console.log(`  [UPDATED] ${userRecord.email}`);
      updated++;
    }

    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

syncEmailVerified().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
