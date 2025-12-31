import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const SECRET_KEY = "USC-2025"; // SET YOUR PASSWORD HERE

document.getElementById('player-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('status');
    const enteredKey = document.getElementById('adminKey').value;

    // Security Check
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