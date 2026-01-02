import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 1. HANDLE CONTACT FORM ---
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

// --- 2. FETCH AND DISPLAY PLAYERS (INCLUDES CLUB) ---
async function loadPlayers() {
    const playerGrid = document.getElementById('player-grid');
    if (!playerGrid) return;

    try {
        // We order by timestamp so the newest players show up first
        const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            playerGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Currently scouting new talent. Check back soon.</p>";
            return;
        }

        playerGrid.innerHTML = ""; // Clear existing content

        querySnapshot.forEach((doc) => {
            const player = doc.data();
            
            // Image fallback: Use a default placeholder if no URL is provided
            const photoUrl = player.imageUrl || "https://via.placeholder.com/300x400?text=USC+Prospect";

            playerGrid.innerHTML += `
                <div class="card talent-card">
                    <div class="player-image-container" style="margin-bottom: 15px; overflow: hidden; border-radius: 4px;">
                        <img src="${photoUrl}" alt="${player.name}" style="width: 100%; height: 300px; object-fit: cover; display: block;">
                    </div>
                    <h3 style="color: var(--gold); font-family: 'Oswald', sans-serif; text-transform: uppercase;">${player.name || 'Elite Talent'}</h3>
                    <p><strong>Position:</strong> ${player.position || 'N/A'}</p>
                    <p><strong>Current Club:</strong> ${player.club || 'Free Agent'}</p>
                    <p><strong>Category:</strong> ${player.age || 'U17'}</p>
                    <p style="color: green; font-weight: bold; font-size: 0.8rem; margin-top: 5px;">✓ USC VERIFIED</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading players:", error);
        playerGrid.innerHTML = "<p>Error loading roster. Please refresh.</p>";
    }
}

loadPlayers();