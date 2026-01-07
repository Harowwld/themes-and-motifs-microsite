// --- Firebase Config (fill these and set ENABLE_FIREBASE = true) ---
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
const ENABLE_FIREBASE = false; // flip to true after adding real config

let db = null;
let vendors = [];
let vendorBranches = [];
let reviews = [];

const seedVendors = [
  {
    id: 1,
    name: "Nice Print Photography",
    owner: "Nice Print Team",
    email: "inquiry@niceprint.com",
  },
  {
    id: 2,
    name: "Juan Carlo The Caterer",
    owner: "Juan Carlo Team",
    email: "info@juancarlo.ph",
  },
  {
    id: 3,
    name: "Narra Hill",
    owner: "Narra Hill Events",
    email: "events@narrahill.com",
  },
  {
    id: 4,
    name: "Gideon Hermosa",
    owner: "Gideon Hermosa",
    email: "gideon@events.com",
  },
  {
    id: 5,
    name: "Luna Bridal Couture",
    owner: "Luna Bridal Team",
    email: "contact@lunabridal.com",
  },
];

const seedBranches = [
  {
    id: 101,
    vendorId: 1,
    branchName: "Main Studio",
    type: "Photography",
    location: "Quezon City",
    city: "Quezon City",
    price: 85000,
    rating: 4.8,
    desc: "Flagship studio for celebrity weddings with cinematic touch and rapid delivery.",
    images: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600",
      "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=600",
    ],
    contact: "inquiry@niceprint.com",
    map: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d30891.31983141765!2d121.060034!3d14.575414!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c86ba5e7765d%3A0x75cf2996244ddf5c!2sNice%20Print%20Photography!5e0!3m2!1sen!2sph!4v1764139324982!5m2!1sen!2sph",
  },
  {
    id: 102,
    vendorId: 1,
    branchName: "BGC Studio",
    type: "Photography",
    location: "Bonifacio Global City",
    city: "Taguig",
    price: 90000,
    rating: 4.7,
    desc: "Boutique studio offering fashion-forward wedding sets in central BGC.",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
    ],
    contact: "inquiry@niceprint.com",
    map: "",
  },
  {
    id: 201,
    vendorId: 2,
    branchName: "Manila HQ",
    type: "Catering",
    location: "Manila",
    city: "Manila",
    price: 150000,
    rating: 4.9,
    desc: "Luxury catering with the famous roast beef carving station and elegant service.",
    images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=600",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    ],
    contact: "info@juancarlo.ph",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.717306885943!2d121.0648817!3d14.671977799999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7b1b96dfd45%3A0xaccb0094540ee603!2sJuan%20Carlo%20the%20Caterer!5e0!3m2!1sen!2sph!4v1764139352872!5m2!1sen!2sph",
  },
  {
    id: 202,
    vendorId: 2,
    branchName: "Batangas Kitchen",
    type: "Catering",
    location: "Batangas",
    city: "Batangas",
    price: 160000,
    rating: 4.8,
    desc: "Destination-ready kitchen supporting Tagaytay and Batangas weddings with full service.",
    images: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
    ],
    contact: "info@juancarlo.ph",
    map: "",
  },
  {
    id: 301,
    vendorId: 3,
    branchName: "Pavilion",
    type: "Venue",
    location: "Tagaytay",
    city: "Tagaytay",
    price: 250000,
    rating: 4.7,
    desc: "Lush gardens overlooking Taal with glass pavilion and bridal suite.",
    images: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/17/b4/31/img-20190929-170312-01.jpg?w=900&h=500&s=1",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/17/b4/31/img-20190929-170312-01.jpg?w=900&h=500&s=1",
    ],
    contact: "events@narrahill.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.996388699278!2d120.88108777509622!3d14.07739038634928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd9d9ab0ec3cad%3A0x8ef3766ca783045!2sNarra%20Hill!5e0!3m2!1sen!2sph!4v1764139376867!5m2!1sen!2sph",
  },
  {
    id: 401,
    vendorId: 4,
    branchName: "Makati Atelier",
    type: "Stylist",
    location: "Makati",
    city: "Makati",
    price: 500000,
    rating: 5.0,
    desc: "Luxury event styling studio creating grand, immersive wedding worlds.",
    images: [
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600",
      "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=600",
    ],
    contact: "gideon@events.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.501866464829!2d120.33251907578385!3d16.03942614023384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33915d56d91f0771%3A0x4412384e5abc5cc1!2sThe%20Events%20Studio%20By%20Gideon%20Hermosa!5e0!3m2!1sen!2sph!4v1764139401427!5m2!1sen!2sph",
  },
  {
    id: 501,
    vendorId: 5,
    branchName: "BGC Salon",
    type: "Attire",
    location: "Taguig",
    city: "Taguig",
    price: 250000,
    rating: 4.8,
    desc: "Handcrafted couture gowns with bespoke fittings for modern brides.",
    images: [
      "https://thumbs.dreamstime.com/b/store-window-display-wedding-dresses-290002443.jpg",
      "https://thumbs.dreamstime.com/b/store-window-display-wedding-dresses-290002443.jpg",
    ],
    contact: "contact@lunabridal.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.59334703639!2d120.97790827576873!3d14.848063870968893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ad846615206b%3A0x71ce09d75de14e76!2sLuna%27s%20Bridal%20Shop!5e0!3m2!1sen!2sph!4v1764139422037!5m2!1sen!2sph",
  },
];

const seedReviews = [
  {
    id: 101,
    branchId: 101,
    user: "Sarah J.",
    rating: 5,
    text: "Absolutely stunning photos!",
    date: "2023-10-15",
    pros: "Cinematic quality",
    cons: "None",
  },
  {
    id: 102,
    branchId: 101,
    user: "Mark D.",
    rating: 4,
    text: "Great team, slight delay in delivery.",
    date: "2023-11-02",
    pros: "Friendly staff",
    cons: "Timeline",
  },
  {
    id: 103,
    branchId: 201,
    user: "Jenny L.",
    rating: 5,
    text: "The food was the highlight!",
    date: "2023-09-20",
    pros: "Roast Beef",
    cons: "None",
  },
];

// New Mock Data for Fairs
const mockFairs = [
  {
    id: 1,
    title: "The Philippine Wedding Summit",
    date: "June 22 & 23, 2024",
    venue: "SMX Convention Center Manila",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=600",
    desc: "The biggest mid-year wedding fair in the country.",
  },
  {
    id: 2,
    title: "Wedding Expo Philippines",
    date: "September 28 & 29, 2024",
    venue: "SMX Convention Center Manila",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600",
    desc: "Asia's Biggest Wedding Fair. 1,000+ Exhibitors.",
  },
  {
    id: 3,
    title: "Bridal Fair at The Fort",
    date: "November 15, 2024",
    venue: "Shangri-La at the Fort",
    image: "https://images.unsplash.com/photo-1522673607200-1645062cd958?w=600",
    desc: "An exclusive gathering of premium suppliers for the discerning bride.",
  },
];

const sameId = (a, b) => String(a) === String(b);

const app = {
  currentUser: null,

  init: async () => {
    await app.loadData();
    app.renderHome(vendorBranches);
    app.updateCategoryUI();
    document.getElementById("search-type").addEventListener("change", () => {
      app.handleSearch();
      app.updateCategoryUI();
    });
    document
      .getElementById("search-location")
      .addEventListener("change", () => app.handleSearch());
    const searchInput = document.getElementById("search-text");
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        app.handleSearch(true);
      }
    });

    const loginEmail = document.getElementById("login-email");
    const loginPass = document.getElementById("login-pass");
    [loginEmail, loginPass].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          app.login();
        }
      });
    });
  },

  // VENDOR REGISTRATION FLOW (prototype)
  submitVendorRegistration: (e) => {
    if (e) e.preventDefault();

    // Basic validation for required fields
    const requiredIds = ["reg-vendor-name", "reg-contact"];
    for (const id of requiredIds) {
      const field = document.getElementById(id);
      if (field && !field.value) {
        field.focus();
        return false;
      }
    }

    const selectedCats = document.querySelectorAll(
      'input[name="reg-category"]:checked'
    );
    if (!selectedCats.length) {
      const group = document.getElementById("reg-category-group");
      if (group) {
        group.scrollIntoView({ behavior: "smooth", block: "center" });
        group.classList.add("field-error");
        setTimeout(() => group.classList.remove("field-error"), 1200);
      }
      return false;
    }

    app.openPlanModal();
    app.clearRegForm();
    return false;
  },

  clearRegForm: () => {
    const form = document.getElementById("vendor-reg-form");
    if (form) form.reset();
    document
      .querySelectorAll('input[name="reg-category"]')
      .forEach((el) => (el.checked = false));
  },

  openPlanModal: () => {
    const modal = document.getElementById("plan-modal");
    if (modal) {
      modal.style.display = "flex";
      const firstPlan = modal.querySelector('input[name="modal-plan"]');
      if (firstPlan && !modal.querySelector('input[name="modal-plan"]:checked')) {
        firstPlan.checked = true;
      }
    }
  },

  closePlanModal: () => {
    const modal = document.getElementById("plan-modal");
    if (modal) modal.style.display = "none";
  },

  confirmPlan: () => {
    const selected =
      document.querySelector('input[name="modal-plan"]:checked') || {};
    const plan = selected.value || "Starter";
    alert(`You chose the ${plan} plan. We’ll reach out with next steps (prototype).`);
    app.closePlanModal();
  },

  // DATA LOADING
  initFirebase: async () => {
    if (!ENABLE_FIREBASE || !window.firebase || db) return !!db;
    if (!FIREBASE_CONFIG.projectId || !FIREBASE_CONFIG.apiKey) return false;
    if (firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.firestore();
    return true;
  },

  fetchCollection: async (collection) => {
    const snap = await db.collection(collection).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  loadData: async () => {
    const firebaseReady = await app.initFirebase();
    if (firebaseReady && db) {
      try {
        vendors = await app.fetchCollection("vendors");
        vendorBranches = await app.fetchCollection("vendor_branches");
        reviews = await app.fetchCollection("reviews");
        if (vendors.length === 0 && vendorBranches.length === 0) {
          vendors = [...seedVendors];
          vendorBranches = [...seedBranches];
          reviews = [...seedReviews];
        }
        return;
      } catch (err) {
        console.warn("Firebase load failed, falling back to seeds:", err);
      }
    }
    vendors = [...seedVendors];
    vendorBranches = [...seedBranches];
    reviews = [...seedReviews];
  },

  // NAVIGATION
  navigate: (viewId) => {
    document.querySelectorAll(".container").forEach((el) => {
      if (
        el.id !== "view-home" &&
        el.id !== "view-detail" &&
        el.id !== "view-login" &&
        el.id !== "view-admin" &&
        el.id !== "view-fairs"
      )
        return;
      el.classList.add("hidden");
    });

    if (viewId === "home") {
      document.getElementById("view-home").classList.remove("hidden");
    } else if (viewId === "fairs") {
      app.renderFairs(); // Render fairs on nav
      document.getElementById("view-fairs").classList.remove("hidden");
    } else if (viewId === "login") {
      document.getElementById("view-login").classList.remove("hidden");
    } else if (viewId === "admin") {
      if (app.currentUser && app.currentUser.role === "admin") {
        app.renderAdmin();
        document.getElementById("view-admin").classList.remove("hidden");
      } else {
        alert("Access Denied: Admins only.");
        app.navigate("login");
      }
    }
  },

  // FAIRS LOGIC
  renderFairs: () => {
    const container = document.getElementById("fairs-list-container");
    container.innerHTML = mockFairs
      .map(
        (f) => `
                        <div class="v-card">
                            <div class="v-img" style="background-image:url('${f.image}'); height: 200px;"></div>
                            <div class="v-body">
                                <span class="fair-date-badge">${f.date}</span>
                                <h3 class="serif" style="color:var(--brand-brown); margin: 5px 0;">${f.title}</h3>
                                <p style="color:#666; font-size:0.9rem; margin-bottom:10px;">📍 ${f.venue}</p>
                                <p style="font-size:0.9rem; margin-bottom: 15px;">${f.desc}</p>
                                <button class="btn-primary" style="margin-top:auto; width:100%" onclick="alert('You are pre-registered for ${f.title}! Check your email.')">Pre-Register Free</button>
                            </div>
                        </div>
                    `
      )
      .join("");
  },

  // AUTH SYSTEM
  login: () => {
    const email = document.getElementById("login-email").value;
    if (email && email.includes("admin")) {
      app.currentUser = {
        name: "Admin User",
        role: "admin",
        email: email,
      };
      document.getElementById("nav-admin").style.display = "block";
      app.navigate("admin");
    } else {
      const userName = email ? email.split("@")[0] : "Guest User";
      app.currentUser = {
        name: userName,
        role: "user",
        email: email || "",
      };
      app.navigate("home");
    }

    document.getElementById("auth-section").innerHTML = `
                    <span style="font-weight:bold; margin-right:10px;">Hi, ${app.currentUser.name}</span>
                    <button class="btn-auth" onclick="app.logout()">Logout</button>
                `;
  },

  logout: () => {
    app.currentUser = null;
    document.getElementById("nav-admin").style.display = "none";
    document.getElementById(
      "auth-section"
    ).innerHTML = `<button class="btn-auth" onclick="app.navigate('login')">Sign In / Register</button>`;
    app.navigate("home");
  },

  // HOME & SEARCH
  renderHome: (list) => {
    const container = document.getElementById("vendor-list-container");
    const countLabel = document.getElementById("vendor-count");

    if (!list || list.length === 0) {
      container.innerHTML = `<div style="padding:40px; text-align:center; color:#666; grid-column: 1 / -1;">No vendors found for this category.</div>`;
      if (countLabel) countLabel.innerText = "(0)";
      return;
    }

    if (countLabel) countLabel.innerText = `(${list.length})`;

    container.innerHTML = list
      .map((branch) => {
        const vendor =
          vendors.find((v) => sameId(v.id, branch.vendorId)) || {};
        return `
                    <div class="v-card" onclick="app.showVendorDetail(${branch.id})">
                        <div class="v-img" style="background-image:url('${branch.images[0]}'); position:relative;">
                            <span class="v-score">${branch.rating}</span>
                        </div>
                        <div class="v-body">
                            <small style="color:#888; text-transform:uppercase; font-size:0.7rem;">${branch.type} • ${branch.location}</small>
                            <h3 class="serif" style="color:var(--brand-brown); margin: 5px 0;">${vendor.name || "Vendor"} — ${branch.branchName}</h3>
                            <p style="font-size:0.9rem; color:#555; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${branch.desc}</p>
                            <div style="margin-top:auto; padding-top:15px; font-weight:bold;">
                                Starts at ₱${branch.price.toLocaleString()}
                            </div>
                        </div>
                    </div>
                `;
      })
      .join("");
  },

  handleSearch: (clearAfter = false) => {
    const txt = document.getElementById("search-text").value.toLowerCase();
    const type = document.getElementById("search-type").value;
    const location = document.getElementById("search-location").value;
    const sort = document.getElementById("search-sort").value;

    let filtered = vendorBranches.filter((branch) => {
      const vendor =
        vendors.find((v) => sameId(v.id, branch.vendorId)) || {};
      const matchesText =
        branch.branchName.toLowerCase().includes(txt) ||
        (vendor.name || "").toLowerCase().includes(txt);
      const matchesType = type === "" || branch.type === type;
      const matchesLocation =
        location === "" ||
        branch.location === location ||
        branch.city === location;
      return matchesText && matchesType && matchesLocation;
    });

    if (sort === "price_low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price_high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    app.renderHome(filtered);
    if (app.updateCategoryUI) app.updateCategoryUI();

    if (clearAfter) {
      document.getElementById("search-text").value = "";
      document.getElementById("search-type").value = "";
      document.getElementById("search-location").value = "";
      if (app.updateCategoryUI) app.updateCategoryUI();
    }
  },

  filterByCat: (cat) => {
    const select = document.getElementById("search-type");
    const current = select.value;
    if (current === cat) {
      select.value = "";
    } else {
      select.value = cat;
    }
    app.handleSearch();
  },

  updateCategoryUI: () => {
    const selected = document.getElementById("search-type").value;
    document.querySelectorAll(".cat-card").forEach((el) => {
      const cat = el.getAttribute("data-cat") || "";
      if (cat === selected && selected !== "") {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    });
  },

  /* Add vendor modal controls */
  openAddVendorModal: () => {
    document.getElementById("add-vendor-modal").style.display = "flex";
  },
  closeAddVendorModal: () => {
    document.getElementById("add-vendor-modal").style.display = "none";
  },
  submitNewVendor: async () => {
    const name = document.getElementById("new-v-name").value || "New Vendor";
    const type = document.getElementById("new-v-type").value || "Venue";
    const location = document.getElementById("new-v-location").value || "";
    const price = parseInt(document.getElementById("new-v-price").value || "0");
    const rating = 0;
    const contact = document.getElementById("new-v-contact").value || "";
    const image = document.getElementById("new-v-image").value || "";
    const desc = document.getElementById("new-v-desc").value || "";

    if (db) {
      const vendorDoc = await db.collection("vendors").add({
        name,
        owner: `${name} Owner`,
        email: contact,
      });
      const vendorId = vendorDoc.id;
      const branchDoc = await db.collection("vendor_branches").add({
        vendorId,
        branchName: "Main Branch",
        type,
        location,
        city: location,
        price,
        rating,
        desc: desc || "New vendor branch",
        images: image
          ? [image]
          : ["https://via.placeholder.com/600x400?text=Vendor"],
        contact,
        map: "",
      });
      vendors.push({
        id: vendorId,
        name,
        owner: `${name} Owner`,
        email: contact,
      });
      vendorBranches.push({
        id: branchDoc.id,
        vendorId,
        branchName: "Main Branch",
        type,
        location,
        city: location,
        price,
        rating,
        desc: desc || "New vendor branch",
        images: image
          ? [image]
          : ["https://via.placeholder.com/600x400?text=Vendor"],
        contact,
        map: "",
      });
    } else {
      const newVendorId =
        vendors.reduce((m, v) => Math.max(m, Number(v.id) || 0), 0) + 1;
      vendors.push({
        id: newVendorId,
        name: name,
        owner: `${name} Owner`,
        email: contact,
      });

      const newBranchId =
        vendorBranches.reduce((m, v) => Math.max(m, Number(v.id) || 0), 0) + 1;
      vendorBranches.push({
        id: newBranchId,
        vendorId: newVendorId,
        branchName: "Main Branch",
        type: type,
        location: location,
        city: location,
        price: price,
        rating: rating,
        desc: desc || "New vendor branch",
        images: image
          ? [image]
          : ["https://via.placeholder.com/600x400?text=Vendor"],
        contact: contact,
        map: "",
      });
    }

    alert("Vendor added (prototype).");
    app.closeAddVendorModal();
    app.renderAdmin();
    app.renderHome(vendorBranches);
  },

  // VENDOR DETAILS & BOOKING
  showVendorDetail: (id) => {
    const branch = vendorBranches.find((x) => sameId(x.id, id));
    if (!branch) return;
    const vendor =
      vendors.find((v) => sameId(v.id, branch.vendorId)) || {};
    const vReviews = reviews.filter((r) => sameId(r.branchId, id));

    document.getElementById("view-home").classList.add("hidden");
    document.getElementById("view-detail").classList.remove("hidden");

    const content = document.getElementById("detail-content");

    // Function to generate stars string
    const getStars = (r) => {
      return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
    };

    content.innerHTML = `
                    <div class="detail-header">
                        <h1 class="serif">${vendor.name || "Vendor"} — ${branch.branchName}</h1>
                        <p> 📍 ${branch.location} &nbsp;|&nbsp; ⭐ ${branch.rating} (${reviews.filter((r) => sameId(r.branchId, id)).length} Reviews)</p>
                    </div>

                    <div class="detail-gallery">
                        <div class="gal-main" style="background-image:url('${branch.images[0]}')"></div>
                        <div class="gal-sub">
                            <div class="gal-item" style="background-image:url('${branch.images[1] || branch.images[0]}')"></div>
                            <div class="gal-item" style="background-image:url('${branch.images[0]}')"></div>
                        </div>
                    </div>

                    <div class="detail-layout">
                        <div>
                            <h3 class="serif">About this vendor</h3>
                            <p style="margin-bottom:20px;">${branch.desc}</p>
                            
                            <h3 class="serif">Location</h3>
                            <div style="background:#eee; height:200px; display:flex; align-items:center; justify-content:center; margin-bottom:30px;">
                                ${
                                  branch.map
                                    ? `<iframe src="${branch.map}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
                                    : "Map Unavailable in Demo"
                                }
                            </div>

                            <div class="review-box">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <h3 class="serif">Reviews</h3>
                                    <button class="btn-primary" onclick="app.toggleReviewForm()" style="font-size:0.8rem;">Write a Review</button>
                                </div>
                                
                                <div id="review-form-container" class="hidden" style="margin-top:20px; background:#f9f9f9; padding:15px;">
                                    ${
                                      app.currentUser
                                        ? `
                                        <strong>Posting as ${app.currentUser.name}</strong>
                                        <select id="new-rating" class="form-select" style="margin:10px 0;"><option value="5">5 - Excellent</option><option value="4">4 - Very Good</option><option value="3">3 - Good</option></select>
                                        <textarea id="new-review-text" class="form-input" placeholder="Share your experience..."></textarea>
                                        <button class="btn-primary" style="margin-top:10px;" onclick="app.submitReview(${branch.id})">Submit Review</button>
                                    `
                                        : `<p><a onclick="app.navigate('login')" style="color:blue; cursor:pointer;">Log in</a> to write a review.</p>`
                                    }
                                </div>

                                <div id="reviews-list" style="margin-top:20px;">
                                    ${
                                      vReviews.length === 0
                                        ? "<p>No reviews yet.</p>"
                                        : vReviews
                                            .map((r) => {
                                              const initial = r.user.charAt(0).toUpperCase();
                                              return `
                                        <div class="r-item">
                                            <div class="r-item-flex">
                                                <div class="r-avatar-circle">${initial}</div>
                                                <div class="r-content">
                                                    <div class="r-user-name">${r.user}</div>
                                                    <div class="r-stars">${getStars(r.rating)}</div>
                                                    <p class="r-text">"${r.text}"</p>
                                                    <small class="r-date">${r.date}</small>
                                                    ${
                                                      app.currentUser && app.currentUser.name === r.user
                                                        ? `<button style="font-size:0.7rem; color:red; border:none; background:none; text-decoration:underline; margin-top:5px;" onclick="app.deleteReview(${r.id}, ${branch.id})">Delete</button>`
                                                        : ""
                                                    }
                                                </div>
                                                <div class="r-numeric-score">★ ${r.rating}.0</div>
                                            </div>
                                        </div>
                                    `;
                                            })
                                            .join("")
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="booking-card">
                                <h3 class="serif" style="margin-bottom:15px;">Book ${vendor.name || "Vendor"} — ${branch.branchName}</h3>
                                <div style="font-size:1.5rem; font-weight:bold; color:var(--brand-brown); margin-bottom:20px;">₱${branch.price.toLocaleString()} <span style="font-size:0.9rem; color:#666; font-weight:normal;">starting price</span></div>
                                
                                <label style="font-size:0.8rem; font-weight:bold;">Wedding Date</label>
                                <input type="date" class="form-input" style="margin-bottom:15px;">
                                
                                <label style="font-size:0.8rem; font-weight:bold;">Message</label>
                                <textarea class="form-input" rows="3" placeholder="I'm interested in..." style="margin-bottom:15px;"></textarea>

                                <button class="btn-primary" style="width:100%" onclick="alert('Booking Inquiry Sent! The vendor will contact you at ' + (app.currentUser ? app.currentUser.email : 'your email address') + '.')">Check Availability</button>
                                <p style="font-size:0.8rem; color:#666; text-align:center; margin-top:10px;">You won't be charged yet</p>
                            </div>
                        </div>
                    </div>
                `;
  },

  // REVIEW LOGIC
  toggleReviewForm: () => {
    document.getElementById("review-form-container").classList.toggle("hidden");
  },

  submitReview: async (vendorId) => {
    const text = document.getElementById("new-review-text").value;
    const rating = document.getElementById("new-rating").value;

    const reviewPayload = {
      branchId: vendorId,
      user: app.currentUser.name,
      rating: parseInt(rating),
      text: text,
      date: new Date().toISOString().split("T")[0],
      pros: "New Experience",
      cons: "None",
    };

    if (db) {
      const docRef = await db.collection("reviews").add(reviewPayload);
      reviews.push({ id: docRef.id, ...reviewPayload });
    } else {
      reviews.push({ id: Date.now(), ...reviewPayload });
    }

    alert("Review Submitted!");
    app.showVendorDetail(vendorId); // Refresh
  },

  deleteReview: async (reviewId, vendorId) => {
    if (confirm("Are you sure?")) {
      reviews = reviews.filter((r) => !sameId(r.id, reviewId));
      if (db) {
        await db.collection("reviews").doc(String(reviewId)).delete();
      }
      app.showVendorDetail(vendorId);
    }
  },

  // ADMIN LOGIC
  renderAdmin: () => {
    document.getElementById("admin-v-count").innerText = vendors.length;
    document.getElementById("admin-r-count").innerText = reviews.length;

    const tbody = document.getElementById("admin-v-list");
    tbody.innerHTML = vendorBranches
      .map((branch) => {
        const vendor =
          vendors.find((v) => sameId(v.id, branch.vendorId)) || {};
        return `
                    <tr>
                        <td>${branch.id}</td>
                        <td>${vendor.name || "Vendor"} — ${branch.branchName}</td>
                        <td>${branch.type}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick="alert('Edit Modal')">Edit</button>
                            <button class="action-btn btn-del" onclick="app.adminDeleteVendor(${branch.id})">Delete</button>
                        </td>
                    </tr>
                `;
      })
      .join("");
  },

  adminDeleteVendor: (id) => {
    if (confirm("Delete this vendor listing?")) {
      const idx = vendorBranches.findIndex((v) => sameId(v.id, id));
      if (idx > -1) vendorBranches.splice(idx, 1);
      if (db) {
        db.collection("vendor_branches").doc(String(id)).delete();
      }
      app.renderAdmin();
    }
  },
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
