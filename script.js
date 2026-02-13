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

// --- 2. FETCH AND DISPLAY TRANSFERS (DONE DEALS) ---
async function loadTransfers() {
    const transferGrid = document.getElementById('transfer-grid');
    if (!transferGrid) return;

    try {
        const q = query(collection(db, "transfers"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            transferGrid.innerHTML = ""; 
            querySnapshot.forEach((doc) => {
                const tr = doc.data();
                transferGrid.innerHTML += `
                    <div class="transfer-card">
                        <span class="transfer-tag">${tr.type || 'Done Deal'}</span>
                        <h3 style="margin: 15px 0 5px 0; font-family: 'Oswald'; text-transform: uppercase;">${tr.playerName}</h3>
                        <div class="transfer-path">
                            <span>${tr.fromClub}</span>
                            <span class="transfer-arrow">➔</span>
                            <span style="color: #007bff;">${tr.toClub}</span>
                        </div>
                        <p style="font-size: 0.75rem; color: #888; font-style: italic;">Verified by USC Agency</p>
                    </div>
                `;
            });
        } else {
            transferGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; opacity: 0.6;'>Our 2026 transfer window movements will appear here.</p>";
        }
    } catch (error) {
        console.error("Error loading transfers:", error);
    }
}

// --- 3. FETCH AND DISPLAY EVENTS (TRIALS & TOURS) ---
async function loadEvents() {
    const eventGrid = document.getElementById('events-grid');
    if (!eventGrid) return;

    try {
        const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            eventGrid.innerHTML = ""; 
            querySnapshot.forEach((doc) => {
                const ev = doc.data();
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

// --- 4. FETCH AND DISPLAY PLAYERS (ENHANCED SCOUT REPORT) ---
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
            const p = doc.data();
            const passportIcon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

            playerGrid.innerHTML += `
                <div class="card talent-card" style="border-bottom: 4px solid #c5a028; padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; text-align: left;">
                        <img src="${passportIcon}" alt="Profile" style="width: 50px; opacity: 0.3;">
                        <div>
                            <h3 style="color: #050a1a; font-family: 'Oswald', sans-serif; text-transform: uppercase; margin: 0; line-height: 1.2;">${p.name}</h3>
                            <span style="background: #050a1a; color: #d4af37; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: bold;">${p.position} | ${p.age}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 0.85rem; text-align: left; margin-bottom: 15px;">
                        <div><span style="color: #888; font-size: 0.7rem; display: block;">CLUB</span><strong>${p.club}</strong></div>
                        <div><span style="color: #888; font-size: 0.7rem; display: block;">HEIGHT</span><strong>${p.height || 'N/A'}</strong></div>
                        <div><span style="color: #888; font-size: 0.7rem; display: block;">FOOT</span><strong>${p.foot || 'Right'}</strong></div>
                    </div>

                    <div style="display: flex; justify-content: space-around; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 15px;">
                        <div style="text-align: center;"><span style="display: block; font-weight: bold; font-size: 1.2rem;">${p.apps || 0}</span><small style="color: #888; font-size: 0.65rem;">APPS</small></div>
                        <div style="text-align: center;"><span style="display: block; font-weight: bold; font-size: 1.2rem; color: #c5a028;">${p.goals || 0}</span><small style="color: #888; font-size: 0.65rem;">GOALS</small></div>
                        <div style="text-align: center;"><span style="display: block; font-weight: bold; font-size: 1.2rem;">${p.assists || 0}</span><small style="color: #888; font-size: 0.65rem;">ASST</small></div>
                    </div>

                    ${p.video ? `
                        <a href="${p.video}" target="_blank" style="display: block; background: #007bff; color: white; text-decoration: none; padding: 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px; transition: 0.3s;">
                           ▶ WATCH HIGHLIGHTS
                        </a>
                    ` : '<div style="height: 42px;"></div>'}

                    <p style="color: #c5a028; font-weight: bold; font-size: 0.6rem; letter-spacing: 1px; text-transform: uppercase; margin: 0;">
                        ✓ USC VERIFIED TALENT
                    </p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading players:", error);
    }
}

// Run everything on page load
loadTransfers(); 
loadEvents();
loadPlayers();
