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

// --- 2. FETCH AND DISPLAY EVENTS (TRIALS & TOURS) ---
async function loadEvents() {
    const eventGrid = document.getElementById('events-grid');
    if (!eventGrid) return;

    try {
        const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            eventGrid.innerHTML = ""; // Clear placeholder
            querySnapshot.forEach((doc) => {
                const ev = doc.data();
                
                // Use the link from the database, or default to contact section if missing
                const regLink = ev.link || "#contact";

                eventGrid.innerHTML += `
                    <div style="background: rgba(255,255,255,0.05); border-left: 5px solid #d4af37; padding: 25px; border-radius: 4px; transition: 0.3s;">
                        <h3 style="color: #fff; margin: 0; font-family: 'Oswald'; text-transform: uppercase; letter-spacing: 1px;">${ev.title}</h3>
                        <p style="color: #d4af37; margin: 10px 0; font-weight: bold;">📍 ${ev.location}</p>
                        <p style="font-size: 0.9rem; opacity: 0.7; color: #fff;">📅 ${ev.date}</p>
                        
                        <div style="margin-top: 15px;">
                            <a href="${regLink}" target="_blank" style="display: inline-block; background: #d4af37; color: #050a1a; padding: 10px 20px; font-size: 0.8rem; font-weight: bold; border-radius: 4px; text-decoration: none; text-transform: uppercase; transition: 0.3s;">
                                Register Now
                            </a>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// --- 3. FETCH AND DISPLAY PLAYERS ---
async function loadPlayers() {
    const playerGrid = document.getElementById('player-grid');
    if (!playerGrid) return;

    try {
        const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            playerGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Currently scouting new talent. Check back soon.</p>";
            return;
        }

        playerGrid.innerHTML = ""; 

        querySnapshot.forEach((doc) => {
            const player = doc.data();
            const passportIcon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

            playerGrid.innerHTML += `
                <div class="card talent-card" style="text-align: center; border-bottom: 4px solid #c5a028;">
                    <div class="icon-bg" style="background: #f4f4f4; width: 110px; height: 110px; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; border: 2px solid #eee;">
                        <img src="${passportIcon}" alt="Profile" style="width: 60px; opacity: 0.4;">
                    </div>
                    
                    <h3 style="color: #050a1a; font-family: 'Oswald', sans-serif; text-transform: uppercase; margin-bottom: 12px; font-size: 1.4rem;">
                        ${player.name || 'Elite Talent'}
                    </h3>
                    
                    <div style="text-align: left; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #f0f0f0;">
                        <p style="margin: 5px 0; font-size: 0.9rem; color: #333;"><strong>POS:</strong> ${player.position || 'N/A'}</p>
                        <p style="margin: 5px 0; font-size: 0.9rem; color: #333;"><strong>CLUB:</strong> ${player.club || 'Free Agent'}</p>
                        <p style="margin: 5px 0; font-size: 0.9rem; color: #333;"><strong>CAT:</strong> ${player.age || 'U17'}</p>
                    </div>

                    <p style="color: #c5a028; font-weight: bold; font-size: 0.7rem; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">
                        ✓ USC VERIFIED PROSPECT
                    </p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading players:", error);
        playerGrid.innerHTML = "<p>Error loading roster. Please refresh.</p>";
    }
}

// Run everything on page load
loadEvents();
loadPlayers();