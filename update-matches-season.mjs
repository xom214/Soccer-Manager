import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD41A_pA9h8e5vAnG3R2CtMsrd-TA-YEvs",
    authDomain: "crfc-a.firebaseapp.com",
    projectId: "crfc-a",
    storageBucket: "crfc-a.firebasestorage.app",
    messagingSenderId: "278682006586",
    appId: "1:278682006586:web:2fee95112d32950755f103",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
    console.log('Fetching matches...');
    const snap = await getDocs(collection(db, 'matches'));
    console.log(`Found ${snap.docs.length} matches.`);
    
    let count = 0;
    for (const d of snap.docs) {
        await updateDoc(doc(db, 'matches', d.id), {
            seasonId: 'haL4BZhVklJ0zrdu3j5B'
        });
        count++;
    }
    
    console.log(`Successfully updated ${count} matches with seasonId: haL4BZhVklJ0zrdu3j5B`);
    process.exit(0);
}

main().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
