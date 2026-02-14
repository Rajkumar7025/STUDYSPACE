// ==========================================
// 1. FIREBASE CONFIGURATION & IMPORTS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB47wH_KObIIMAksM8TqI7norRmSK0IXnY",
  authDomain: "studyspace-backend.firebaseapp.com",
  projectId: "studyspace-backend",
  storageBucket: "studyspace-backend.firebasestorage.app",
  messagingSenderId: "511542334086",
  appId: "1:511542334086:web:11e4de3014db2966743707",
  measurementId: "G-LFTQWBYXGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("🔥 Shop Connected to Backend");

// ==========================================
// 2. DATA VARIABLES
// ==========================================
let productsData = []; 
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

// ==========================================
// 3. FETCH PRODUCTS (Real-time from Admin)
// ==========================================
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderProducts('all'); // Refresh grid when data changes
});

// ==========================================
// 4. RENDER FUNCTIONS (Display Logic)
// ==========================================
function renderProducts(filterType) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    // Filter Logic
    const filteredItems = productsData.filter(product => {
        if (filterType === 'all') return true;
        return product.category && product.category.toLowerCase() === filterType.toLowerCase();
    });

    productGrid.innerHTML = '';
    
    if (filteredItems.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
        return;
    }

    filteredItems.forEach(product => {
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        
        // Product Card HTML
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                ${isOutOfStock ? '<div class="sold-out-overlay">SOLD OUT</div>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p style="font-size: 0.8rem; color: #666;">Stock: ${product.stock}</p>
                <div class="price-row">
                    <span class="price">$${Number(product.price).toFixed(2)}</span>
                    <button class="btn btn-sm ${isOutOfStock ? 'btn-disabled' : 'btn-primary'}" 
                            onclick="${isOutOfStock ? '' : `addToCart('${product.id}')`}"
                            ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Sold Out' : 'Add'}
                    </button>
                </div>
            </div>`;
        productGrid.appendChild(card);
    });
}

// ==========================================
// 5. GLOBAL WINDOW FUNCTIONS (For HTML Clicks)
// ==========================================

// Filter Button Click
window.filterProducts = function(btn) {
    // Visual Update
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Logic Update
    const category = btn.getAttribute('data-filter');
    renderProducts(category);
}

// Add To Cart
window.addToCart = function(id) {
    const p = productsData.find(item => item.id === id);
    if (p && p.stock > 0) {
        cart.push(p);
        updateCart();
        alert(`Added ${p.name} to cart!`);
    } else {
        alert("Sorry, this item is out of stock!");
    }
};

// Remove From Cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCart();
}

// Update Cart UI & Storage
function updateCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    
    // Update Cart Badge
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = cart.length;

    // Update Sidebar List
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    if(container) {
        container.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += Number(item.price);
            container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <div style="display:flex; gap:10px;">
                    <img src="${item.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                    <div>
                        <div style="font-weight:bold; font-size:0.9rem;">${item.name}</div>
                        <div style="font-size:0.8rem; color:#666;">$${Number(item.price).toFixed(2)}</div>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        });
        if(totalEl) totalEl.innerText = '$' + total.toFixed(2);
    }
}

// Open Checkout Modal
window.openCheckout = function() {
    if(cart.length === 0) return alert("Cart is empty!");
    
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('checkout-overlay');
    const summary = document.getElementById('checkout-summary');
    
    // Calculate Total
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    
    if(summary) summary.innerHTML = `
        <div style="text-align:center; padding:10px; background:#f0fdf4; border-radius:8px; color:#166534;">
            <h3>Total to Pay: $${total.toFixed(2)}</h3>
            <p>${cart.length} items</p>
        </div>
    `;

    if(modal) modal.classList.add('active'); 
    if(overlay) overlay.classList.add('active');
    
    // Close sidebar
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

// Close Checkout Modal
window.closeCheckout = function() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

// PROCESS PAYMENT (The Real Transaction)
window.processPayment = async function(e) {
    e.preventDefault();
    
    if(cart.length === 0) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    // 1. Create Order Data
    const orderData = {
        customerName: "Student Guest", 
        email: "student@uni.edu",
        items: cart, // Saves the items
        total: cart.reduce((sum, item) => sum + Number(item.price), 0),
        status: "Pending", // Admin will see this
        createdAt: new Date()
    };

    try {
        // 2. Save to 'orders' collection
        await addDoc(collection(db, "orders"), orderData);

        // 3. Reduce Stock for each item purchased
        for (const item of cart) {
            const productRef = doc(db, "products", item.id);
            await updateDoc(productRef, {
                stock: increment(-1) // Database magic: subtracts 1
            });
        }

        alert("✅ Order Placed! Admin has been notified.");
        cart = []; // Clear Cart
        updateCart(); // Update UI
        window.closeCheckout(); // Close Modal
        window.location.reload(); // Refresh Page

    } catch (error) {
        console.error(error);
        alert("❌ Error: " + error.message);
        submitBtn.innerText = "Pay Now";
        submitBtn.disabled = false;
    }
}

// Initialize Cart on Load
document.addEventListener('DOMContentLoaded', updateCart);

// Event Delegation for Filters (Fixes click issues)
document.addEventListener('click', (e) => {
    if(e.target.classList.contains('filter-btn')) {
        window.filterProducts(e.target);
    }
});

// ==========================================
// 6. STUDENT AUTHENTICATION (The Missing Piece)
// ==========================================

// Login Function
window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // (Optional) Save user to database
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            lastLogin: new Date()
        }, { merge: true });

        alert(`Welcome back, ${user.displayName.split(' ')[0]}!`);
        window.location.href = "index.html"; // Redirect to Home
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed: " + error.message);
    }
}

// Watch for Login State (Updates Navbar)
onAuthStateChanged(auth, (user) => {
    // 1. Update Sign In Page Text
    const authSubtitle = document.getElementById('auth-subtitle');
    if (user && authSubtitle) {
        authSubtitle.innerText = `You are signed in as ${user.email}`;
    }

    // 2. Update Navbar Button (if it exists)
    const navBtn = document.getElementById('nav-signin-btn');
    if (navBtn) {
        if (user) {
            navBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${user.displayName.split(' ')[0]}`;
            navBtn.href = "#";
            navBtn.onclick = (e) => {
                e.preventDefault();
                if(confirm("Sign out?")) {
                    signOut(auth).then(() => window.location.reload());
                }
            };
        } else {
            navBtn.innerHTML = "Sign In";
            navBtn.href = "signin.html";
            navBtn.onclick = null; // Remove signout listener
        }
    }
});

// Import setDoc since we used it above
import { setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// EXPORT CHECKOUT TO WINDOW (REQUIRED)
// ==========================================
window.openCheckout = function() {
    console.log("Opening Checkout...");
    if(cart.length === 0) return alert("Cart is empty!");
    
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('checkout-overlay');
    const summary = document.getElementById('checkout-summary');
    
    // Calculate Total
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    
    if(summary) summary.innerHTML = `
        <div style="text-align:center; padding:15px; background:#f0fdf4; border-radius:8px; color:#166534; margin-bottom:15px;">
            <h3 style="margin:0;">Total: $${total.toFixed(2)}</h3>
            <p style="margin:5px 0 0 0;">${cart.length} items</p>
        </div>
    `;

    if(modal) modal.classList.add('active'); 
    if(overlay) overlay.classList.add('active');
    
    // Force close sidebar
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

