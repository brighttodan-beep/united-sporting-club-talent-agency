import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// USC Agency Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACdkdP5dUmxnULRtMmD6O47VyCmQkOmLs",
    authDomain: "usctalent-agency.firebaseapp.com",
    projectId: "usctalent-agency",
    storageBucket: "usctalent-agency.firebasestorage.app",
    messagingSenderId: "299067234272",
    appId: "1:299067234272:web:06f4311a171d6b5ef63d85"
};

// Initialize Firebase & Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SECRET_KEY = "USC-2025"; 

// --- 1. GLOBAL UTILITY: SECURE DELETE ---
// Attached to window so it's accessible from dynamically generated HTML buttons
window.deleteItem = async (collectionName, id) => {
    const key = prompt("⚠️ Security Check: Enter Admin Key to confirm deletion:");
    if (key !== SECRET_KEY) {
        alert("Action Denied: Invalid Secret Key.");
        return;
    }

    if (confirm("Are you sure? This data will be permanently removed from the USC database.")) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert("Success: Entry removed.");
            location.reload(); 
        } catch (e) {
            console.error("Firestore Error:", e);
            alert("System Error: Could not delete entry.");
        }
    }
};

// --- 2. TALENT ROSTER MANAGEMENT ---
const playerForm = document.getElementById('player-form');
if (playerForm) {
    playerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('adminKey').value !== SECRET_KEY) { alert("Invalid Admin Key!"); return; }

        const playerDoc = {
            name: document.getElementById('playerName').value,
            position: document.getElementById('playerPosition').value,
            club: document.getElementById('playerClub').value,
            age: document.getElementById('playerAge').value,
            height: document.getElementById('playerHeight').value || "N/A",
            foot: document.getElementById('playerFoot').value,
            apps: parseInt(document.getElementById('playerApps').value) || 0,
            goals: parseInt(document.getElementById('playerGoals').value) || 0,
            assists: parseInt(document.getElementById('playerAssists').value) || 0,
            video: document.getElementById('playerVideo').value || "",
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, "players"), playerDoc);
            alert("⚽ Player added to the Elite Roster!");
            playerForm.reset();
            location.reload();
        } catch (e) {
            alert("Failed to upload player data.");
        }
    });
}

// --- 3. TRANSFER (DONE DEALS) MANAGEMENT ---
const transferForm = document.getElementById('transfer-form');
if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('trAdminKey').value !== SECRET_KEY) { alert("Invalid Admin Key!"); return; }

        try {
            await addDoc(collection(db, "transfers"), {
                playerName: document.getElementById('trPlayerName').value,
                fromClub: document.getElementById('trFromClub').value,
                toClub: document.getElementById('trToClub').value,
                type: document.getElementById('trType').value,
                timestamp: new Date()
            });
            alert("🤝 Transfer deal published!");
            location.reload();
        } catch (e) {
            alert("Error publishing transfer.");
        }
    });
}

// --- 4. EVENTS (TRIALS/TOURS) MANAGEMENT ---
const eventForm = document.getElementById('event-form');
if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('eventAdminKey').value !== SECRET_KEY) { alert("Invalid Admin Key!"); return; }

        try {
            await addDoc(collection(db, "events"), {
                title: document.getElementById('eventTitle').value,
                location: document.getElementById('eventLocation').value,
                date: document.getElementById('eventDate').value,
                link: document.getElementById('eventLink').value,
                timestamp: new Date()
            });
            alert("📅 New event added to calendar!");
            location.reload();
        } catch (e) {
            alert("Error publishing event.");
        }
    });
}

// --- 5. DATA FETCHING (DASHBOARD LOADERS) ---

const loadData = async (btnId, listId, colName, templateFn) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const list = document.getElementById(listId);
        list.innerHTML = `<p style="padding: 20px; font-style: italic;">Syncing with USC Database...</p>`;
        
        try {
            const q = query(collection(db, colName), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            list.innerHTML = snap.empty ? `<p style="padding: 20px;">No data found in ${colName}.</p>` : "";
            
            snap.forEach(d => {
                list.innerHTML += templateFn(d.id, d.data());
            });
        } catch (e) {
            list.innerHTML = `<p style="color: red; padding: 20px;">Error connecting to database.</p>`;
        }
    });
};

// Player Template
loadData('btn-load-roster', 'roster-list', 'players', (id, p) => `
    <div class="item-card">
        <div>
            <strong>${p.name}</strong><br>
            <small>${p.position} | ${p.club}</small>
        </div>
        <button class="btn-delete" onclick="deleteItem('players', '${id}')">Remove</button>
    </div>
`);

// Transfer Template
loadData('btn-load-transfers', 'transfer-list', 'transfers', (id, tr) => `
    <div class="item-card" style="border-left-color: #007bff;">
        <div>
            <strong>${tr.playerName}</strong><br>
            <small>${tr.fromClub} ➔ ${tr.toClub}</small>
        </div>
        <button class="btn-delete" onclick="deleteItem('transfers', '${id}')">Remove</button>
    </div>
`);

// Events Template
loadData('btn-load-events', 'events-list', 'events', (id, ev) => `
    <div class="item-card" style="border-left-color: #28a745;">
        <div>
            <strong>${ev.title}</strong><br>
            <small>${ev.date} | ${ev.location}</small>
        </div>
        <button class="btn-delete" onclick="deleteItem('events', '${id}')">Remove</button>
    </div>
`);

// Inbox Template
const btnViewMessages = document.getElementById('btn-view-messages');
if (btnViewMessages) {
    btnViewMessages.addEventListener('click', async () => {
        if (document.getElementById('inboxKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
        const list = document.getElementById('message-list');
        list.innerHTML = "Opening Secure Inbox...";
        
        try {
            const snap = await getDocs(query(collection(db, "inquiries"), orderBy("timestamp", "desc")));
            list.innerHTML = snap.empty ? "Inbox is empty." : "";
            snap.forEach(d => {
                const m = d.data();
                list.innerHTML += `
                    <div class="item-card" style="display: block;">
                        <div style="margin-bottom: 10px;">
                            <strong>From: ${m.name}</strong> (${m.email})
                            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; margin-top: 5px;">${m.message}</p>
                        </div>
                        <button class="btn-delete" onclick="deleteItem('inquiries', '${d.id}')">Delete Message</button>
                    </div>`;
            });
        } catch (e) {
            list.innerHTML = "Failed to load messages.";
        }
    });
}
