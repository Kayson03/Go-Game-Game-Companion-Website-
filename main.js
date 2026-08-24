// ==========================
// 1. Get the logged-in user (saved by script.js on the login page)
// ==========================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// If nobody is logged in, send them back to the login page
if (!currentUser) {
    window.location.href = "index.html";
}

// ==========================
// 2. Set up shared navbar bits (name, avatar, logout)
// ==========================
document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
document.getElementById("avatarInitial").textContent = currentUser.name.charAt(0).toUpperCase();

document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
});

// ==========================
// Role switch button — lets you flip between Player and Companion view
// without logging out, so you can quickly check both sides while building.
// (In a real app a single account usually wouldn't have both roles like this —
// this is here purely to make development/testing easier.)
// ==========================
const roleSwitchBtn = document.getElementById("roleSwitchBtn");
roleSwitchBtn.textContent = currentUser.role === "provider" ? "Switch to Player View" : "Switch to Companion View";

roleSwitchBtn.addEventListener("click", function () {
    currentUser.role = currentUser.role === "provider" ? "user" : "provider";
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    window.location.reload(); // simplest way to re-run the role check at the top of this file
});

// ==========================
// Shared detail modal controls (used by the Player view's "View Details")
// ==========================
function closeModal() {
    document.getElementById("detailModalOverlay").classList.remove("open");
}

// Clicking the dark overlay (outside the box) also closes it
document.getElementById("detailModalOverlay").addEventListener("click", function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// ==========================
// 3. THE KEY IDEA: same page, different view depending on role
//    Everything below just shows/hides sections based on currentUser.role
// ==========================
if (currentUser.role === "provider") {
    document.getElementById("providerNavLinks").style.display = "flex";
    document.getElementById("providerView").style.display = "block";
    initProviderView();
} else {
    document.getElementById("userNavLinks").style.display = "flex";
    document.getElementById("userView").style.display = "block";
    initUserView();
}


// ==========================================================
// PLAYER VIEW LOGIC
// ==========================================================
function initUserView() {

    // Fixed hourly slots a companion can be booked at (a real app would
    // instead check the companion's actual saved availability)
    const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00", "22:00"];

    // Fake data standing in for what would come from a backend API
    const services = [
        {
            id: 1, name: "Mira", game: "League of Legends", gameKey: "lol", price: 25, rating: 4.9, online: true,
            desc: "Diamond jungle/support main, friendly and easygoing — let's climb together.", color: "#7494ec",
            region: "Malaysia", languages: ["English", "Malay", "Chinese"],
            reviews: [
                { user: "JayT", from: "Singapore", rating: 5, comment: "Super patient and actually knows how to shotcall. Climbed 2 divisions with her." },
                { user: "kenny_88", from: "Malaysia", rating: 5, comment: "Really friendly, made ranked way less stressful." },
                { user: "n0va", from: "Philippines", rating: 4, comment: "Good games overall, sometimes queue times were a bit long." }
            ]
        },
        {
            id: 2, name: "Kai", game: "Valorant", gameKey: "valorant", price: 35, rating: 4.7, online: true,
            desc: "Immortal-ranked sentinel main. Coaching and duo queue both available.", color: "#f2994a",
            region: "Taiwan", languages: ["Chinese", "English"],
            reviews: [
                { user: "wraith_", from: "Taiwan", rating: 5, comment: "Coaching session was actually useful, fixed my crosshair placement issues." },
                { user: "mm_lee", from: "Hong Kong", rating: 4, comment: "Solid sentinel plays, comms could be a bit clearer in English." }
            ]
        },
        {
            id: 3, name: "Yuki", game: "Genshin Impact", gameKey: "genshin", price: 18, rating: 4.8, online: false,
            desc: "Cleared Spiral Abyss floor 12. Casual co-op for dailies and domains.", color: "#56ccf2",
            region: "Japan", languages: ["Japanese", "English"],
            reviews: [
                { user: "aeris.gg", from: "USA", rating: 5, comment: "So chill to play with, great for relaxed daily runs." },
                { user: "hu_tao_fan", from: "Malaysia", rating: 5, comment: "Very knowledgeable about team comps, helped me clear my abyss floor." }
            ]
        },
        {
            id: 4, name: "Wade", game: "Apex Legends", gameKey: "apex", price: 30, rating: 4.6, online: true,
            desc: "Masters predator duo, clear comms, no toxicity — trios or duos welcome.", color: "#eb5757",
            region: "USA", languages: ["English"],
            reviews: [
                { user: "ping_zero", from: "Canada", rating: 4, comment: "Great rotations, callouts were on point." },
                { user: "reaperx", from: "USA", rating: 5, comment: "Zero toxicity even when we were getting third-partied constantly. Respect." }
            ]
        },
        {
            id: 5, name: "Sana", game: "League of Legends", gameKey: "lol", price: 22, rating: 5.0, online: true,
            desc: "Grandmaster mid laner, full voice chat, great for beginners too.", color: "#bb6bd9",
            region: "South Korea", languages: ["Korean", "English"],
            reviews: [
                { user: "beginner_ben", from: "Australia", rating: 5, comment: "Extremely patient with me as a total beginner, explained matchups clearly." },
                { user: "faded.mid", from: "South Korea", rating: 5, comment: "Mechanically really strong, learned a lot just watching her play." }
            ]
        },
        {
            id: 6, name: "Theo", game: "Valorant", gameKey: "valorant", price: 28, rating: 4.5, online: false,
            desc: "Diamond controller/IGL, good shotcalling for 5-stack ranked pushes.", color: "#27ae60",
            region: "Malaysia", languages: ["English", "Malay"],
            reviews: [
                { user: "5stackgc", from: "Malaysia", rating: 4, comment: "Great IGL, kept the team organized during clutch rounds." }
            ]
        }
    ];

    const cardGrid = document.getElementById("cardGrid");
    const emptyState = document.getElementById("emptyState");
    const resultsCount = document.getElementById("resultsCount");
    const searchInput = document.getElementById("searchInput");
    const gameFilter = document.getElementById("gameFilter");
    const sortFilter = document.getElementById("sortFilter");

    // ---------- Bookings storage ----------
    // Each booking is its own record so it survives even if the fake
    // "services" list above changes later — it snapshots the details
    // that mattered at the time of booking (name, game, price...).
    const BOOKINGS_KEY = "myBookings_" + currentUser.email;
    let myBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];

    const browseSection = document.getElementById("browseSection");
    const bookingsSection = document.getElementById("bookingsSection");
    const navBrowse = document.getElementById("navBrowse");
    const navBookings = document.getElementById("navBookings");
    const bookingsGrid = document.getElementById("bookingsGrid");
    const bookingsEmptyState = document.getElementById("bookingsEmptyState");
    const bookingsCount = document.getElementById("bookingsCount");

    // ---------- Switching between Browse and My Bookings ----------
    navBrowse.addEventListener("click", function (e) {
        e.preventDefault();
        browseSection.style.display = "block";
        bookingsSection.style.display = "none";
        navBrowse.classList.add("active");
        navBookings.classList.remove("active");
    });

    navBookings.addEventListener("click", function (e) {
        e.preventDefault();
        browseSection.style.display = "none";
        bookingsSection.style.display = "block";
        navBookings.classList.add("active");
        navBrowse.classList.remove("active");
        renderBookings();
    });

    function createCard(item) {
        const statusClass = item.online ? "" : "offline";
        const statusText = item.online ? "Online" : "Offline";

        return `
            <div class="service-card">
                <div class="card-top">
                    <div class="card-avatar" style="background:${item.color}">${item.name.charAt(0)}</div>
                    <div class="card-name-wrap">
                        <div class="card-name">
                            ${item.name}
                            <span class="status-dot ${statusClass}" title="${statusText}"></span>
                        </div>
                        <div class="card-rating">⭐ ${item.rating.toFixed(1)}</div>
                    </div>
                </div>
                <div class="card-tag">${item.game}</div>
                <p class="card-desc">${item.desc}</p>
                <div class="card-footer">
                    <div class="card-price">$${item.price} <span>/ hr</span></div>
                    <button class="card-btn" onclick="openDetail(${item.id})">View Details</button>
                </div>
            </div>
        `;
    }

    // Exposed globally so the inline onclick in createCard() can reach it
    window.openDetail = function (id) {
        const item = services.find(s => s.id === id);
        const statusClass = item.online ? "" : "offline";
        const statusText = item.online ? "Online" : "Offline";
        const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD", used so users can't pick a past date

        // Build one line of HTML per review, reusing the same
        // "map over an array, join into a string" pattern as createCard()
        const reviewsHTML = item.reviews.map(r => `
            <div class="review-item">
                <div class="review-top">
                    <span class="review-user">${r.user}</span>
                    <span class="review-from">${r.from}</span>
                    <span class="review-stars">⭐ ${r.rating}</span>
                </div>
                <p class="review-comment">${r.comment}</p>
            </div>
        `).join("");

        document.getElementById("modalContent").innerHTML = `
            <div class="modal-avatar" style="background:${item.color}">${item.name.charAt(0)}</div>
            <div class="modal-name">
                ${item.name}
                <span class="status-dot ${statusClass}" title="${statusText}"></span>
            </div>
            <div class="modal-rating">⭐ ${item.rating.toFixed(1)} · ${item.game} · ${statusText}</div>

            <div class="modal-meta">
                <div class="modal-meta-item">
                    <span class="modal-meta-label">Region</span>
                    <span class="modal-meta-value">${item.region}</span>
                </div>
                <div class="modal-meta-item">
                    <span class="modal-meta-label">Languages</span>
                    <span class="modal-meta-value">${item.languages.join(", ")}</span>
                </div>
            </div>

            <p class="modal-desc">${item.desc}</p>

            <div class="modal-reviews">
                <div class="modal-reviews-title">Reviews (${item.reviews.length})</div>
                <div class="modal-reviews-list">
                    ${reviewsHTML}
                </div>
            </div>

            <div class="modal-book-row">
                <label for="bookingDate" class="modal-meta-label">Session date</label>
                <input type="date" id="bookingDate" min="${todayStr}">
            </div>

            <div class="modal-book-row-split">
                <div>
                    <label for="bookingTime" class="modal-meta-label">Start time</label>
                    <select id="bookingTime">
                        <option value="">-- Select --</option>
                        ${TIME_SLOTS.map(t => `<option value="${t}">${t}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label for="bookingDuration" class="modal-meta-label">Duration</label>
                    <select id="bookingDuration" onchange="updateBookingTotal(${item.price})">
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                    </select>
                </div>
            </div>

            <div class="modal-total-row">
                <span>Total</span>
                <span id="bookingTotal">$${item.price}</span>
            </div>

            <div class="modal-footer">
                <div class="modal-price">$${item.price} <span>/ hr</span></div>
                <button class="card-btn" onclick="bookSession(${item.id})">Book Session</button>
            </div>
        `;

        document.getElementById("detailModalOverlay").classList.add("open");
    };

    // Recalculates the "Total" line whenever the duration dropdown changes
    window.updateBookingTotal = function (pricePerHour) {
        const duration = Number(document.getElementById("bookingDuration").value);
        document.getElementById("bookingTotal").textContent = `$${pricePerHour * duration}`;
    };

    // Exposed globally so the inline onclick in the modal footer can reach it
    window.bookSession = function (id) {
        const item = services.find(s => s.id === id);
        const date = document.getElementById("bookingDate").value;
        const time = document.getElementById("bookingTime").value;
        const duration = Number(document.getElementById("bookingDuration").value);

        if (!date) {
            alert("Please select a session date first.");
            return;
        }
        if (!time) {
            alert("Please select a start time first.");
            return;
        }

        const booking = {
            id: Date.now(), // unique id for this booking, not the companion's id
            companionId: item.id,
            companionName: item.name,
            companionColor: item.color,
            game: item.game,
            pricePerHour: item.price,
            date: date,
            time: time,
            duration: duration,
            totalPrice: item.price * duration,
            status: "confirmed" // could later be "pending" / "cancelled" etc.
        };

        myBookings.push(booking);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(myBookings));

        closeModal();
        alert(`Booked! ${item.name} on ${date} at ${time} (${duration}h). Check "My Bookings" to view it.`);
    };

    function createBookingCard(b) {
        return `
            <div class="service-card">
                <div class="card-top">
                    <div class="card-avatar" style="background:${b.companionColor}">${b.companionName.charAt(0)}</div>
                    <div class="card-name-wrap">
                        <div class="card-name">${b.companionName}</div>
                        <div class="card-rating">${b.game}</div>
                    </div>
                </div>
                <div class="card-tag">${b.date} · ${b.time} · ${b.duration}h</div>
                <p class="card-desc">Status: ${b.status}</p>
                <div class="card-footer">
                    <div class="card-price">$${b.totalPrice} <span>total</span></div>
                    <button class="card-btn danger" onclick="cancelBooking(${b.id})">Cancel</button>
                </div>
            </div>
        `;
    }

    function renderBookings() {
        bookingsCount.textContent = `${myBookings.length} booking(s)`;

        if (myBookings.length === 0) {
            bookingsGrid.style.display = "none";
            bookingsEmptyState.style.display = "block";
            return;
        }

        bookingsGrid.style.display = "grid";
        bookingsEmptyState.style.display = "none";
        // Show soonest sessions first
        const sorted = [...myBookings].sort((a, b) => a.date.localeCompare(b.date));
        bookingsGrid.innerHTML = sorted.map(createBookingCard).join("");
    }

    // Exposed globally so the inline onclick in createBookingCard() can reach it
    window.cancelBooking = function (id) {
        myBookings = myBookings.filter(b => b.id !== id);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(myBookings));
        renderBookings();
    };

    function renderCards() {
        const keyword = searchInput.value.trim().toLowerCase();
        const selectedGame = gameFilter.value;
        const sortBy = sortFilter.value;

        let filtered = services.filter(item => {
            const matchesKeyword = item.game.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword);
            const matchesGame = selectedGame ? item.gameKey === selectedGame : true;
            return matchesKeyword && matchesGame;
        });

        if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
        else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

        resultsCount.textContent = `${filtered.length} companions found`;

        if (filtered.length === 0) {
            cardGrid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        cardGrid.style.display = "grid";
        emptyState.style.display = "none";
        cardGrid.innerHTML = filtered.map(createCard).join("");
    }

    searchInput.addEventListener("input", renderCards);
    gameFilter.addEventListener("change", renderCards);
    sortFilter.addEventListener("change", renderCards);

    renderCards();
}


// ==========================================================
// COMPANION (PROVIDER) VIEW LOGIC
// ==========================================================
function initProviderView() {

    // Which games can be offered, and which in-game roles each one has.
    // This drives both the checkbox list and the per-game role dropdowns.
    const GAME_ROLES = {
        lol: { label: "League of Legends", roles: ["Top", "Jungle", "Mid", "ADC", "Support"] },
        valorant: { label: "Valorant", roles: ["Duelist", "Controller", "Initiator", "Sentinel"] },
        genshin: { label: "Genshin Impact", roles: ["DPS", "Sub-DPS", "Support", "Healer"] },
        apex: { label: "Apex Legends", roles: ["Assault", "Skirmisher", "Recon", "Support"] }
    };

    const STORAGE_KEY = "myServices_" + currentUser.email;

    // Load this provider's own published services from localStorage,
    // or start with an empty list if they haven't published anything yet.
    let myServices = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const grid = document.getElementById("myServiceGrid");
    const emptyState = document.getElementById("myEmptyState");
    const countLabel = document.getElementById("myServicesCount");
    const form = document.getElementById("publishForm");
    const gameCheckboxes = document.getElementById("gameCheckboxes");
    const gameRoleFields = document.getElementById("gameRoleFields");

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(myServices));
    }

    // ---------- Build the game checkbox list from GAME_ROLES ----------
    gameCheckboxes.innerHTML = Object.keys(GAME_ROLES).map(key => `
        <label class="game-checkbox">
            <input type="checkbox" value="${key}" class="gameCheck">
            ${GAME_ROLES[key].label}
        </label>
    `).join("");

    // ---------- Whenever a checkbox is (un)checked, rebuild the role dropdowns ----------
    gameCheckboxes.addEventListener("change", function () {
        const checkedGames = [...document.querySelectorAll(".gameCheck:checked")].map(cb => cb.value);

        gameRoleFields.innerHTML = checkedGames.map(key => `
            <div class="game-role-row">
                <span class="game-role-label">${GAME_ROLES[key].label} — Role</span>
                <select class="roleSelect" data-game="${key}" required>
                    <option value="">-- Select role --</option>
                    ${GAME_ROLES[key].roles.map(r => `<option value="${r}">${r}</option>`).join("")}
                </select>
            </div>
        `).join("");
    });

    function createCard(item) {
        const typeLabel = item.type === "ranked" ? "Skilled / Ranked" : "Casual / Fun";
        return `
            <div class="service-card">
                <div class="card-tag">${item.game} · ${item.role}</div>
                <p class="card-desc">${item.desc}</p>
                <div class="card-desc" style="margin-top:-10px; font-size:12px; color:#999;">${typeLabel}</div>
                <div class="card-footer">
                    <div class="card-price">$${item.price} <span>/ hr</span></div>
                    <div class="card-actions">
                        <button class="card-btn danger" onclick="removeService(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    function render() {
        countLabel.textContent = `${myServices.length} service(s) published`;

        if (myServices.length === 0) {
            grid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        grid.style.display = "grid";
        emptyState.style.display = "none";
        grid.innerHTML = myServices.map(createCard).join("");
    }

    // Exposed globally so the inline onclick in createCard() can reach it
    window.removeService = function (id) {
        myServices = myServices.filter(s => s.id !== id);
        save();
        render();
    };

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // stop the page from reloading

        const checkedGames = [...document.querySelectorAll(".gameCheck:checked")].map(cb => cb.value);

        if (checkedGames.length === 0) {
            alert("Please select at least one game.");
            return;
        }

        // Make sure every checked game has a role picked
        const roleSelects = [...document.querySelectorAll(".roleSelect")];
        const missingRole = roleSelects.some(sel => sel.value === "");
        if (missingRole) {
            alert("Please select a role for each game you checked.");
            return;
        }

        const price = Number(document.getElementById("pubPrice").value);
        const desc = document.getElementById("pubDesc").value;
        const type = document.querySelector('input[name="pubType"]:checked').value;

        // One selected game can mean different roles — publish one service
        // per game, each carrying its own role but sharing price/desc/type.
        roleSelects.forEach(sel => {
            const gameKey = sel.dataset.game;
            myServices.push({
                id: Date.now() + Math.random(), // Date.now() alone could collide if games are added in the same millisecond
                game: GAME_ROLES[gameKey].label,
                role: sel.value,
                type: type,
                price: price,
                desc: desc
            });
        });

        save();
        render();
        form.reset();
        gameRoleFields.innerHTML = ""; // clear the dynamically-built role dropdowns too
    });

    render();
}