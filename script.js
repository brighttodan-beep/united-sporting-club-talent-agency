import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
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

// --- 1. CONTACT FORM LOGIC ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button');
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        const clientData = {
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            message: document.getElementById('message').value,
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, "inquiries"), clientData);
            alert("Success! Your inquiry has been sent to the USC Management team.");
            contactForm.reset();
        } catch (error) {
            console.error("Firebase Error:", error);
            alert("Could not send message. Please check your connection.");
        } finally {
            submitBtn.innerText = "Submit Inquiry";
            submitBtn.disabled = false;
        }
    });
}

// --- 2. LOAD TRANSFERS (DONE DEALS) ---
async function loadTransfers() {
    const grid = document.getElementById('transfer-grid');
    if (!grid) return;

    try {
        const snap = await getDocs(query(collection(db, "transfers"), orderBy("timestamp", "desc")));
        grid.innerHTML = snap.empty ? `<p style="grid-column: 1/-1; opacity: 0.5;">No transfers recorded for the current window.</p>` : "";
        
        snap.forEach(doc => {
            const tr = doc.data();
            grid.innerHTML += `
                <div class="transfer-card">
                    <span class="transfer-tag">${tr.type || 'Verified Transfer'}</span>
                    <h3 style="margin: 15px 0 5px 0; font-family: 'Oswald'; font-weight: 700;">${tr.playerName}</h3>
                    <div class="transfer-path">
                        <span>${tr.fromClub}</span>
                        <span class="transfer-arrow">➔</span>
                        <span style="color: #c5a028;">${tr.toClub}</span>
                    </div>
                </div>`;
        });
    } catch (e) { console.error("Transfer Load Error:", e); }
}

// --- 3. LOAD TRIALS & EVENTS ---
async function loadEvents() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    try {
        const snap = await getDocs(query(collection(db, "events"), orderBy("timestamp", "desc")));
        if (snap.empty) return; // Keep the default HTML placeholder if empty

        grid.innerHTML = ""; 
        snap.forEach(doc => {
            const ev = doc.data();
            grid.innerHTML += `
                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #d4af37; padding: 25px; border-radius: 8px;">
                    <h3 style="color: #fff; font-family: 'Oswald'; text-transform: uppercase;">${ev.title}</h3>
                    <p style="color: #d4af37; margin: 10px 0; font-weight: 600;">📍 ${ev.location}</p>
                    <p style="font-size: 0.85rem; opacity: 0.8;">📅 ${ev.date}</p>
                    <a href="${ev.link || '#contact'}" target="_blank" class="btn-main" style="margin-top: 15px; padding: 8px 20px; font-size: 0.75rem;">Apply for Trial</a>
                </div>`;
        });
    } catch (e) { console.error("Events Load Error:", e); }
}

// --- 4. LOAD PROSPECTS (ELITE ROSTER) ---
async function loadPlayers() {
    const grid = document.getElementById('player-grid');
    if (!grid) return;

    try {
        const snap = await getDocs(query(collection(db, "players"), orderBy("timestamp", "desc")));
        if (snap.empty) {
            grid.innerHTML = `<p style="grid-column: 1/-1;">Roster update in progress...</p>`;
            return;
        }

        grid.innerHTML = ""; 
        snap.forEach(doc => {
            const p = doc.data();
            grid.innerHTML += `
                <div class="card talent-card" style="border-top: 5px solid #050a1a; padding: 25px; text-align: left;">
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-family: 'Oswald'; font-size: 1.4rem; color: #050a1a; margin-bottom: 5px;">${p.name}</h3>
                        <span style="background: #c5a028; color: #fff; font-size: 0.65rem; padding: 3px 10px; border-radius: 20px; font-weight: 800; text-transform: uppercase;">
                            ${p.position} | Age: ${p.age}
                        </span>
                    </div>

                    <div style="background: #fcfcfc; border: 1px solid #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem;">
                            <p><span style="color: #999;">CLUB:</span> <br><strong>${p.club}</strong></p>
                            <p><span style="color: #999;">HEIGHT:</span> <br><strong>${p.height}</strong></p>
                            <p><span style="color: #999;">FOOT:</span> <br><strong>${p.foot}</strong></p>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 20px; padding: 0 10px;">
                        <div><strong style="font-size: 1.1rem; display: block;">${p.apps}</strong><small style="font-size: 0.6rem; color: #999;">APPS</small></div>
                        <div><strong style="font-size: 1.1rem; display: block; color: #c5a028;">${p.goals}</strong><small style="font-size: 0.6rem; color: #999;">GOALS</small></div>
                        <div><strong style="font-size: 1.1rem; display: block;">${p.assists}</strong><small style="font-size: 0.6rem; color: #999;">ASST</small></div>
                    </div>

                    ${p.video ? `
                        <a href="${p.video}" target="_blank" class="btn-navy" style="display: block; text-align: center; text-decoration: none; background: #050a1a; color: #fff; padding: 12px; border-radius: 5px; font-weight: 700; font-size: 0.8rem;">
                            VIEW HIGHLIGHTS 🎥
                        </a>
                    ` : ''}
                    
                    <p style="margin-top: 15px; font-size: 0.6rem; color: #c5a028; font-weight: 800; letter-spacing: 1px;">✓ OFFICIAL USC SCOUTING REPORT</p>
                </div>`;
        });
    } catch (e) { console.error("Roster Load Error:", e); }
}

// Initial Sync
document.addEventListener('DOMContentLoaded', () => {
    loadTransfers();
    loadEvents();
    loadPlayers();
});
