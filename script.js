import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your exact Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACdkdP5dUmxnULRtMmD6O47VyCmQkOmLs",
    authDomain: "usctalent-agency.firebaseapp.com",
    projectId: "usctalent-agency",
    storageBucket: "usctalent-agency.firebasestorage.app",
    messagingSenderId: "299067234272",
    appId: "1:299067234272:web:06f4311a171d6b5ef63d85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to handle the contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const clientData = {
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            message: document.getElementById('message').value,
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, "inquiries"), clientData);
            alert("Message sent to USC Talent Agency! We will contact you soon.");
            contactForm.reset();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error sending message. Please try again.");
        }
    });
}

// Function to fetch and display players (example fetch)
async function loadPlayers() {
    const playerGrid = document.getElementById('player-grid');
    const querySnapshot = await getDocs(collection(db, "players"));
    
    if (querySnapshot.empty) {
        playerGrid.innerHTML = "<p>Currently scouting new talent. Check back soon.</p>";
        return;
    }

    playerGrid.innerHTML = ""; // Clear loader
    querySnapshot.forEach((doc) => {
        const player = doc.data();
        playerGrid.innerHTML += `
            <div class="card">
                <h3>${player.name || 'Elite Talent'}</h3>
                <p><strong>Position:</strong> ${player.position || 'Forward'}</p>
                <p><strong>Age:</strong> ${player.age || 'U17'}</p>
                <p><strong>Status:</strong> Verified</p>
            </div>
        `;
    });
}

loadPlayers();