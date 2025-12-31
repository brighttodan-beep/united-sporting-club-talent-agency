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
            location.reload(); // Refresh to show changes
        } catch (e) {
            alert("Error deleting. Check Firebase Rules.");
        }
    }
};

// --- 1. ADD PLAYER ---
document.getElementById('player-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.getElementById('adminKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    
    try {
        await addDoc(collection(db, "players"), {
            name: document.getElementById('playerName').value,
            position: document.getElementById('playerPosition').value,
            age: document.getElementById('playerAge').value,
            imageUrl: document.getElementById('playerImage').value || "https://via.placeholder.com/150",
            timestamp: new Date()
        });
        alert("✅ Added!");
        location.reload();
    } catch (e) { alert("Error."); }
});

// --- 2. LOAD ROSTER TO MANAGE ---
document.getElementById('btn-load-roster').addEventListener('click', async () => {
    const list = document.getElementById('roster-list');
    list.innerHTML = "Loading...";
    const snap = await getDocs(query(collection(db, "players"), orderBy("timestamp", "desc")));
    list.innerHTML = "";
    snap.forEach(d => {
        const p = d.data();
        list.innerHTML += `<div class="item-card">
            <h4>${p.name} (${p.age})</h4>
            <button class="btn-delete" onclick="deleteItem('players', '${d.id}')">Remove Player</button>
        </div>`;
    });
});

// --- 3. VIEW MESSAGES ---
document.getElementById('btn-view-messages').addEventListener('click', async () => {
    if (document.getElementById('inboxKey').value !== SECRET_KEY) { alert("Wrong Key!"); return; }
    const list = document.getElementById('message-list');
    list.innerHTML = "Loading...";
    const snap = await getDocs(query(collection(db, "inquiries"), orderBy("timestamp", "desc")));
    list.innerHTML = "";
    snap.forEach(d => {
        const m = d.data();
        list.innerHTML += `<div class="item-card">
            <h4>From: ${m.name}</h4>
            <p>${m.message}</p>
            <button class="btn-delete" onclick="deleteItem('inquiries', '${d.id}')">Delete Message</button>
        </div>`;
    });
});