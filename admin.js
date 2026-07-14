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

// --- 1. ADD PLAYER (REMOVED IMAGE URL LOGIC) ---
document.getElementById('player-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.getElementById('adminKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    
    try {
        await addDoc(collection(db, "players"), {
            name: document.getElementById('playerName').value,
            position: document.getElementById('playerPosition').value,
            club: document.getElementById('playerClub').value,
            age: document.getElementById('playerAge').value,
            // Removed imageUrl line here
            timestamp: new Date()
        });
        alert("✅ Added!");
        location.reload();
    } catch (e) { 
        console.error(e);
        alert("Error adding player. Make sure all fields are filled."); 
    }
});

// --- 2. LOAD ROSTER ---
document.getElementById('btn-load-roster').addEventListener('click', async () => {
    const list = document.getElementById('roster-list');
    list.innerHTML = "Loading...";
    try {
        const snap = await getDocs(query(collection(db, "players"), orderBy("timestamp", "desc")));
        list.innerHTML = "";
        snap.forEach(d => {
            const p = d.data();
            list.innerHTML += `<div class="item-card">
                <h4>${p.name}</h4>
                <p style="font-size: 0.85rem; color: #555;">Club: ${p.club || 'N/A'} | ${p.age}</p>
                <button class="btn-delete" onclick="deleteItem('players', '${d.id}')">Remove Player</button>
            </div>`;
        });
    } catch (e) {
        list.innerHTML = "Error loading roster.";
    }
});

// --- 3. VIEW MESSAGES ---
document.getElementById('btn-view-messages').addEventListener('click', async () => {
    if (document.getElementById('inboxKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    const list = document.getElementById('message-list');
    list.innerHTML = "Loading...";
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