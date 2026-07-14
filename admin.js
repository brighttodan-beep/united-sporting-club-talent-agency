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
            console.error(e);
            alert("Error deleting. Check Firebase Rules.");
        }
    }
};

// --- 1. ADD PLAYER ---
const playerForm = document.getElementById('player-form');
if (playerForm) {
    playerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (document.getElementById('adminKey').value !== SECRET_KEY) { 
            alert("Wrong Key!"); 
            return; 
        }
        
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.innerText = "Adding player...";

        try {
            await addDoc(collection(db, "players"), {
                name: document.getElementById('playerName').value.trim(),
                position: document.getElementById('playerPosition').value.trim(),
                club: document.getElementById('playerClub').value.trim(),
                age: document.getElementById('playerAge').value,
                timestamp: new Date()
            });
            alert("✅ Added!");
            location.reload();
        } catch (e) { 
            console.error("Add Player Error:", e);
            alert("Error adding player. Please try again."); 
            if (statusDiv) statusDiv.innerText = "";
        }
    });
}

// --- 2. LOAD ROSTER ---
const btnLoadRoster = document.getElementById('btn-load-roster');
if (btnLoadRoster) {
    btnLoadRoster.addEventListener('click', async () => {
        const list = document.getElementById('roster-list');
        if (!list) return;
        
        list.innerHTML = "Loading...";
        try {
            // Using a structured fallback block in case Firebase Index is building
            let snap;
            try {
                snap = await getDocs(query(collection(db, "players"), orderBy("timestamp", "desc")));
            } catch (err) {
                console.warn("Index not ready yet, loading unsorted.", err);
                snap = await getDocs(query(collection(db, "players")));
            }

            list.innerHTML = "";
            snap.forEach(d => {
                const p = d.data();
                list.innerHTML += `
                    <div class="item-card">
                        <h4>${p.name || 'Unnamed Player'}</h4>
                        <p style="font-size: 0.85rem; color: #555;">Club: ${p.club || 'N/A'} | Position: ${p.position || 'N/A'} | Category: ${p.age}</p>
                        <button class="btn-delete" onclick="deleteItem('players', '${d.id}')">Remove Player</button>
                    </div>`;
            });
        } catch (e) {
            console.error(e);
            list.innerHTML = "Error loading roster.";
        }
    });
}

// --- 3. VIEW MESSAGES ---
const btnViewMessages = document.getElementById('btn-view-messages');
if (btnViewMessages) {
    btnViewMessages.addEventListener('click', async () => {
        if (document.getElementById('inboxKey').value !== SECRET_KEY) { 
            alert("Wrong Key!"); 
            return; 
        }
        
        const list = document.getElementById('message-list');
        if (!list) return;
        
        list.innerHTML = "Loading...";
        try {
            let snap;
            try {
                snap = await getDocs(query(collection(db, "inquiries"), orderBy("timestamp", "desc")));
            } catch (err) {
                console.warn("Index not ready yet, loading unsorted inbox.", err);
                snap = await getDocs(query(collection(db, "inquiries")));
            }

            list.innerHTML = "";
            snap.forEach(d => {
                const m = d.data();
                list.innerHTML += `
                    <div class="item-card">
                        <h4>From: ${m.name || 'Anonymous'}</h4>
                        <p>${m.message || 'No message content.'}</p>
                        <p style="font-size: 0.7rem; color: #888;">${m.email || 'No Email'}</p>
                        <button class="btn-delete" onclick="deleteItem('inquiries', '${d.id}')">Delete Message</button>
                    </div>`;
            });
        } catch (e) {
            console.error(e);
            list.innerHTML = "Error loading messages.";
        }
    });
}