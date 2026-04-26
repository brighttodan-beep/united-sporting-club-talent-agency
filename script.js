import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
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

// --- 1. CONTACT FORM ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        btn.innerText = "Sending...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "inquiries"), {
                name: document.getElementById('clientName').value,
                email: document.getElementById('clientEmail').value,
                message: document.getElementById('message').value,
                timestamp: new Date()
            });
            alert("Message Sent Successfully!");
            contactForm.reset();
        } catch (err) {
            console.error(err);
            alert("Submission failed. Try again.");
        } finally {
            btn.innerText = "Submit Inquiry";
            btn.disabled = false;
        }
    });
}

// --- 2. LIVE ROSTER LOAD (THE FIX) ---
function loadPlayers() {
    const grid = document.getElementById('player-grid');
    if (!grid) return;

    // We use onSnapshot for live updates from the Admin panel
    // Removed 'orderBy' temporarily to ensure data shows even if indexes aren't set
    const q = query(collection(db, "players"), limit(20));

    onSnapshot(q, (snap) => {
        if (snap.empty) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #999;">No players currently in the elite roster.</p>`;
            return;
        }

        grid.innerHTML = ""; 
        snap.forEach(doc => {
            const p = doc.data();
            // Using || logic to handle different field naming conventions
            const playerName = p.name || p.playerName || "Unknown Talent";
            const position = p.position || "Pro Player";
            
            grid.innerHTML += `
                <div class="card talent-card" style="border-top: 5px solid #050a1a; background: #fff; padding: 25px;">
                    <div style="margin-bottom: 15px;">
                        <h3 style="font-family: 'Oswald'; color: #050a1a; text-transform: uppercase;">${playerName}</h3>
                        <span style="background: #c5a028; color: #fff; font-size: 0.7rem; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                            ${position} ${p.age ? '| Age: ' + p.age : ''}
                        </span>
                    </div>

                    <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 0.8rem;">
                        <p><strong>CLUB:</strong> ${p.club || 'Available'}</p>
                        <p><strong>FOOT:</strong> ${p.foot || 'N/A'}</p>
                    </div>

                    <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div style="text-align:center;"><b style="display:block;">${p.apps || 0}</b><small>APPS</small></div>
                        <div style="text-align:center;"><b style="display:block; color:#c5a028;">${p.goals || 0}</b><small>GOALS</small></div>
                        <div style="text-align:center;"><b style="display:block;">${p.assists || 0}</b><small>ASST</small></div>
                    </div>

                    ${p.video ? `<a href="${p.video}" target="_blank" class="btn-main" style="display:block; text-align:center; padding: 10px; font-size: 0.8rem;">WATCH FILM 🎥</a>` : ''}
                </div>`;
        });
    }, (error) => {
        console.error("Roster Error:", error);
        grid.innerHTML = `<p>Error loading roster. Check console.</p>`;
    });
}

// --- 3. LOAD TRANSFERS & EVENTS ---
function loadTransfers() {
    const grid = document.getElementById('transfer-grid');
    if (!grid) return;
    onSnapshot(collection(db, "transfers"), (snap) => {
        grid.innerHTML = snap.empty ? `<p>No recent transfers.</p>` : "";
        snap.forEach(doc => {
            const tr = doc.data();
            grid.innerHTML += `<div class="transfer-card">
                <span class="transfer-tag">Verified</span>
                <h3>${tr.playerName}</h3>
                <p>${tr.fromClub} ➔ <span style="color:#c5a028">${tr.toClub}</span></p>
            </div>`;
        });
    });
}

function loadEvents() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;
    onSnapshot(collection(db, "events"), (snap) => {
        if (snap.empty) return;
        grid.innerHTML = "";
        snap.forEach(doc => {
            const ev = doc.data();
            grid.innerHTML += `<div class="event-card" style="background:#111; padding:20px; border-left:4px solid #c5a028; margin-bottom:10px;">
                <h4 style="color:#fff; font-family:'Oswald'">${ev.title}</h4>
                <p style="color:#c5a028; font-size:0.8rem;">📍 ${ev.location}</p>
                <p style="font-size:0.75rem; color:#ccc;">📅 ${ev.date}</p>
            </div>`;
        });
    });
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    loadTransfers();
    loadEvents();
});
