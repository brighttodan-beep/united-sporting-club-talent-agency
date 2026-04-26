import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyACdkdP5dUmxnULRtMmD6O47VyCmQkOmLs",
    authDomain: "usctalent-agency.firebaseapp.com",
    projectId: "usctalent-agency",
    storageBucket: "usctalent-agency.firebasestorage.app",
    messagingSenderId: "299067234272",
    appId: "1:299067234272:web:06f4311a171d6b5ef63d85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- AGGRESSIVE DATA LOADING ---
function loadData(collectionName, gridId, templateFn) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // We use onSnapshot because it updates the main site 
    // the INSTANT you click "Save" on the admin site.
    onSnapshot(collection(db, collectionName), (snap) => {
        console.log(`Checking ${collectionName}: Found ${snap.size} items.`);
        
        if (snap.empty) {
            // Keep the grid visible so we know it's working
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">No ${collectionName} found yet.</p>`;
            return;
        }

        grid.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            grid.innerHTML += templateFn(data);
        });
    }, (error) => {
        console.error(`Error loading ${collectionName}:`, error);
    });
}

// --- TEMPLATES ---
const playerTemplate = (p) => `
    <div class="card talent-card" style="border-top: 5px solid #050a1a; padding: 25px; background: white; color: #050a1a;">
        <h3 style="font-family: 'Oswald'; text-transform: uppercase;">${p.name || p.playerName || 'Elite Prospect'}</h3>
        <span style="background: #c5a028; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">
            ${p.position || 'Pro Player'} ${p.age ? '| Age ' + p.age : ''}
        </span>
        <div style="margin-top: 15px; font-size: 0.85rem; background: #f8f9fa; padding: 10px; border-radius: 5px;">
            <p><strong>CLUB:</strong> ${p.club || 'Free Agent'}</p>
        </div>
    </div>
`;

const transferTemplate = (tr) => `
    <div class="transfer-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <span class="transfer-tag" style="background: #c5a028; color: white; padding: 2px 8px; font-size: 0.6rem; text-transform: uppercase;">Done Deal</span>
        <h3 style="font-family: 'Oswald'; margin-top: 10px;">${tr.playerName || tr.name}</h3>
        <p style="font-size: 0.9rem;">${tr.fromClub} ➔ <span style="color: #c5a028; font-weight: bold;">${tr.toClub}</span></p>
    </div>
`;

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    // Try lowercase first (Standard)
    loadData('players', 'player-grid', playerTemplate);
    loadData('transfers', 'transfer-grid', transferTemplate);
    
    // Also try checking the console to see if "Found 0 items" appears.
    // If it says "Found 0", your Admin site is likely using a different 
    // collection name like "Players" (Capital P) or "ElitePlayers".
});
