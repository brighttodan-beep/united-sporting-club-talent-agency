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

// Local cache array to store retrieved players for offline filtering
let cachedPlayers = [];

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

// --- 2. FETCH AND DISPLAY PLAYERS WITH LOCAL FILTERING SYSTEM ---
async function loadPlayers() {
    const playerGrid = document.getElementById('player-grid');
    if (!playerGrid) return;

    try {
        let querySnapshot;
        try {
            const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
            querySnapshot = await getDocs(q);
        } catch (indexError) {
            console.warn("Index not ready yet. Falling back to unsorted fetch...", indexError);
            const fallbackQuery = query(collection(db, "players"));
            querySnapshot = await getDocs(fallbackQuery);
        }
        
        if (querySnapshot.empty) {
            playerGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Currently scouting new talent. Check back soon.</p>";
            return;
        }

        // Cache database records locally
        cachedPlayers = [];
        querySnapshot.forEach((doc) => {
            const playerData = doc.data();
            playerData.id = doc.id; // Store ID for reference
            cachedPlayers.push(playerData);
        });

        // Initial render
        renderPlayerGrid(cachedPlayers);

    } catch (error) {
        console.error("Error loading players:", error);
        playerGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Error loading roster. Please refresh.</p>";
    }
}

// Render dynamic cards to the DOM
function renderPlayerGrid(playersToRender) {
    const playerGrid = document.getElementById('player-grid');
    if (!playerGrid) return;

    if (playersToRender.length === 0) {
        playerGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #999;'>No prospects match your active search filters.</p>";
        return;
    }

    playerGrid.innerHTML = ""; 

    playersToRender.forEach((player) => {
        const passportIcon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        const playerCard = document.createElement('div');
        playerCard.className = "card talent-card";
        playerCard.style.cssText = "text-align: center; border-bottom: 4px solid #c5a028;";
        
        playerCard.innerHTML = `
            <div class="icon-bg" style="background: #f4f4f4; width: 110px; height: 110px; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; border: 2px solid #eee;">
                <img src="${passportIcon}" alt="Profile Silhouette" style="width: 60px; opacity: 0.4;">
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
        `;

        // Event listener to open modal on click
        playerCard.addEventListener('click', () => openPlayerModal(player));
        playerGrid.appendChild(playerCard);
    });
}

// --- 3. FILTERING EVENT LOGIC ---
function filterPlayers() {
    const searchQuery = document.getElementById('search-bar').value.toLowerCase().trim();
    const positionFilter = document.getElementById('filter-position').value;
    const ageFilter = document.getElementById('filter-age').value;

    const filtered = cachedPlayers.filter(player => {
        const matchesSearch = (player.name || '').toLowerCase().includes(searchQuery);
        
        // Match base position keyword (e.g. forward matches Center Forward)
        let matchesPosition = true;
        if (positionFilter !== 'all') {
            matchesPosition = (player.position || '').toLowerCase().includes(positionFilter.toLowerCase());
        }

        const matchesAge = (ageFilter === 'all') || (player.age === ageFilter);

        return matchesSearch && matchesPosition && matchesAge;
    });

    renderPlayerGrid(filtered);
}

// Bind filter event listeners to DOM controls
function initializeFilters() {
    const searchBar = document.getElementById('search-bar');
    const filterPosition = document.getElementById('filter-position');
    const filterAge = document.getElementById('filter-age');

    if (searchBar) searchBar.addEventListener('input', filterPlayers);
    if (filterPosition) filterPosition.addEventListener('change', filterPlayers);
    if (filterAge) filterAge.addEventListener('change', filterPlayers);
}

// --- 4. PROFILE MODAL CONTROLLER ---
function openPlayerModal(player) {
    const modal = document.getElementById('player-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    const passportIcon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    modalBody.innerHTML = `
        <div class="modal-avatar">
            <img src="${passportIcon}" alt="Profile Silhouette" style="width: 70px; opacity: 0.4;">
        </div>
        <h2 style="text-align: center; font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #050a1a; margin-bottom: 5px;">
            ${player.name || 'Elite Prospect'}
        </h2>
        <p style="text-align: center; color: #c5a028; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 25px; font-size: 0.85rem;">
            USC Verified Talent Sheet
        </p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #f0f0f0; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 0.95rem; color: #333;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #777;">Position:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #050a1a;">${player.position || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #777;">Current Affiliation:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #050a1a;">${player.club || 'Free Agent'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0; font-weight: bold; color: #777;">Age Classification:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #050a1a;">${player.age || 'U17'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #777;">Status:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #27ae60;">✓ Ghana Card Documented</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center;">
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 15px;">
                Interested in requesting video reels, statistics, or establishing club trials for this prospect?
            </p>
            <a href="#contact" id="modal-inquire-btn" class="btn-main" style="display: inline-block; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 0.9rem;">
                Request Scout Report
            </a>
        </div>
    `;

    // Intercept inquiry click to slide close modal
    const inquireBtn = document.getElementById('modal-inquire-btn');
    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => closeModal());
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.remove('active');
}

// Bind close button actions
const closeBtn = document.getElementById('modal-close-btn');
if (closeBtn) closeBtn.addEventListener('click', closeModal);

const modalOverlay = document.getElementById('player-modal');
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// --- 5. INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    initializeFilters();
});