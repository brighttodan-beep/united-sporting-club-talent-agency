import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 1. HANDLE PLAYER UPLOADS ---
document.getElementById('player-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('status');
    const enteredKey = document.getElementById('adminKey').value;

    if (enteredKey !== SECRET_KEY) {
        status.innerHTML = "❌ Incorrect Secret Key!";
        status.style.color = "red";
        return;
    }

    status.innerHTML = "Uploading talent...";

    const playerData = {
        name: document.getElementById('playerName').value,
        position: document.getElementById('playerPosition').value,
        age: document.getElementById('playerAge').value,
        imageUrl: document.getElementById('playerImage').value || "https://via.placeholder.com/150",
        timestamp: new Date()
    };

    try {
        await addDoc(collection(db, "players"), playerData);
        status.innerHTML = "✅ Player successfully added to USC Roster!";
        status.style.color = "green";
        document.getElementById('player-form').reset();
    } catch (error) {
        console.error("Error:", error);
        status.innerHTML = "❌ Error uploading. Check Firebase Rules.";
    }
});

// --- 2. HANDLE VIEWING MESSAGES (INBOX) ---
const viewBtn = document.getElementById('btn-view-messages');
if (viewBtn) {
    viewBtn.addEventListener('click', async () => {
        const enteredKey = document.getElementById('inboxKey').value;
        const messageList = document.getElementById('message-list');

        if (enteredKey !== SECRET_KEY) {
            alert("❌ Incorrect Secret Key!");
            return;
        }

        messageList.innerHTML = "<p>Loading messages...</p>";

        try {
            // Fetch messages ordered by newest first
            const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            messageList.innerHTML = ""; // Clear loader

            if (querySnapshot.empty) {
                messageList.innerHTML = "<p>No messages found in your inbox.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const msg = doc.data();
                const date = msg.timestamp ? msg.timestamp.toDate().toLocaleString() : "Date unknown";
                
                messageList.innerHTML += `
                    <div class="message-card">
                        <h4>From: ${msg.name}</h4>
                        <p><strong>Email:</strong> <a href="mailto:${msg.email}" style="color:#d4af37;">${msg.email}</a></p>
                        <p><strong>Message:</strong> ${msg.message}</p>
                        <div class="msg-date">Received: ${date}</div>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
            messageList.innerHTML = "<p style='color:red;'>❌ Access Denied. Ensure your Firebase Rules allow 'read' for inquiries.</p>";
        }
    });
}