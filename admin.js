import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const SECRET_KEY = "USC-2025"; 

// --- HELPER: DELETE FUNCTION ---
window.deleteItem = async (collectionName, id) => {
    const key = prompt("Enter Secret Key to Confirm Deletion:");
    if (key !== SECRET_KEY) {
        alert("Incorrect Key. Delete cancelled.");
        return;
    }
    if (confirm("Are you sure you want to delete this? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert("Deleted successfully.");
            location.reload(); 
        } catch (e) {
            alert("Error deleting. Check Firebase Rules.");
        }
    }
};

// --- 1. ADD PLAYER (UPDATED WITH STATS) ---
document.getElementById('player-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.getElementById('adminKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    
    try {
        await addDoc(collection(db, "players"), {
            name: document.getElementById('playerName').value,
            position: document.getElementById('playerPosition').value,
            club: document.getElementById('playerClub').value,
            age: document.getElementById('playerAge').value,
            // New Scouting Stats
            height: document.getElementById('playerHeight').value || "N/A",
            foot: document.getElementById('playerFoot').value,
            apps: document.getElementById('playerApps').value || 0,
            goals: document.getElementById('playerGoals').value || 0,
            assists: document.getElementById('playerAssists').value || 0,
            video: document.getElementById('playerVideo').value || "",
            timestamp: new Date()
        });
        alert("✅ Player Added to Roster with Stats!");
        location.reload();
    } catch (e) { 
        console.error(e);
        alert("Error adding player."); 
    }
});

// --- 2. ADD DONE DEAL (TRANSFER) ---
const transferForm = document.getElementById('transfer-form');
if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('trAdminKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }

        try {
            await addDoc(collection(db, "transfers"), {
                playerName: document.getElementById('trPlayerName').value,
                fromClub: document.getElementById('trFromClub').value,
                toClub: document.getElementById('trToClub').value,
                type: document.getElementById('trType').value,
                timestamp: new Date()
            });
            alert("✅ Transfer Published Successfully!");
            location.reload();
        } catch (e) {
            console.error(e);
            alert("Error publishing transfer.");
        }
    });
}

// --- 3. ADD TRIAL / TOUR ---
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.getElementById('eventAdminKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }

    try {
        await addDoc(collection(db, "events"), {
            title: document.getElementById('eventTitle').value,
            location: document.getElementById('eventLocation').value,
            date: document.getElementById('eventDate').value,
            link: document.getElementById('eventLink').value,
            timestamp: new Date()
        });
        alert("✅ Event Published Successfully!");
        location.reload();
    } catch (e) {
        console.error(e);
        alert("Error publishing event.");
    }
});

// --- 4. LOAD ROSTER ---
document.getElementById('btn-load-roster').addEventListener('click', async () => {
    const list = document.getElementById('roster-list');
    list.innerHTML = "Loading talent...";
    try {
        const snap = await getDocs(query(collection(db, "players"), orderBy("timestamp", "desc")));
        list.innerHTML = "";
        snap.forEach(d => {
            const p = d.data();
            list.innerHTML += `<div class="item-card">
                <h4>${p.name}</h4>
                <p style="font-size: 0.85rem; color: #555;">Club: ${p.club || 'N/A'} | ${p.age}</p>
                <p style="font-size: 0.75rem; color: #888;">HT: ${p.height} | Foot: ${p.foot} | G: ${p.goals}</p>
                <button class="btn-delete" onclick="deleteItem('players', '${d.id}')">Remove Player</button>
            </div>`;
        });
    } catch (e) {
        list.innerHTML = "Error loading roster.";
    }
});

// --- 5. LOAD TRANSFERS ---
const btnLoadTransfers = document.getElementById('btn-load-transfers');
if (btnLoadTransfers) {
    btnLoadTransfers.addEventListener('click', async () => {
        const list = document.getElementById('transfer-list');
        list.innerHTML = "Loading deals...";
        try {
            const snap = await getDocs(query(collection(db, "transfers"), orderBy("timestamp", "desc")));
            list.innerHTML = "";
            snap.forEach(d => {
                const tr = d.data();
                list.innerHTML += `<div class="item-card" style="border-left-color: #007bff;">
                    <h4>${tr.playerName}</h4>
                    <p style="font-size: 0.85rem; color: #555;">${tr.fromClub} ➔ ${tr.toClub}</p>
                    <button class="btn-delete" onclick="deleteItem('transfers', '${d.id}')">Remove Transfer</button>
                </div>`;
            });
        } catch (e) {
            list.innerHTML = "Error loading transfers.";
        }
    });
}

// --- 6. LOAD EVENTS ---
document.getElementById('btn-load-events').addEventListener('click', async () => {
    const list = document.getElementById('events-list');
    list.innerHTML = "Loading events...";
    try {
        const snap = await getDocs(query(collection(db, "events"), orderBy("timestamp", "desc")));
        list.innerHTML = "";
        snap.forEach(d => {
            const ev = d.data();
            list.innerHTML += `<div class="item-card" style="border-left-color: #28a745;">
                <h4>${ev.title}</h4>
                <p style="font-size: 0.85rem; color: #555;">📍 ${ev.location} | 📅 ${ev.date}</p>
                <button class="btn-delete" onclick="deleteItem('events', '${d.id}')">Remove Event</button>
            </div>`;
        });
    } catch (e) {
        list.innerHTML = "Error loading events.";
    }
});

// --- 7. VIEW MESSAGES ---
document.getElementById('btn-view-messages').addEventListener('click', async () => {
    if (document.getElementById('inboxKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    const list = document.getElementById('message-list');
    list.innerHTML = "Loading messages...";
    try {
        const snap = await getDocs(query(collection(db, "inquiries"), orderBy("timestamp", "desc")));
        list.innerHTML = "";
        snap.forEach(d => {
            const m = d.data();
            list.innerHTML += `<div class="item-card">
                <h4>From: ${m.name}</h4>
                <p>${m.message}</p>
                <p style="font-size: 0.7rem; color: #888;">${m.email}</p>
                <button class="btn-delete" onclick="deleteItem('inquiries', '${d.id}')">Delete Message</button>
            </div>`;
        });
    } catch (e) {
        list.innerHTML = "Error loading messages.";
    }
});
