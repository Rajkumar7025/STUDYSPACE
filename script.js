// ==========================================
// 1. FIREBASE IMPORTS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, increment, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB47wH_KObIIMAksM8TqI7norRmSK0IXnY",
  authDomain: "studyspace-backend.firebaseapp.com",
  projectId: "studyspace-backend",
  storageBucket: "studyspace-backend.firebasestorage.app",
  messagingSenderId: "511542334086",
  appId: "1:511542334086:web:11e4de3014db2966743707",
  measurementId: "G-LFTQWBYXGS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 2. DATA STATES
// ==========================================
let productsData = []; 
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];
let currentFilter = 'all'; // Track active filter

// Sync Products from Database
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    // Once data arrives, render with current filter
    renderProducts(currentFilter);
});

// ==========================================
// 3. RENDERING & FILTERING (FIXED)
// ==========================================
function renderProducts(filterType) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    // Filter Data Logic
    // Matches if filter is 'all' OR product category matches exactly (case insensitive)
    const filteredItems = productsData.filter(product => {
        if (filterType === 'all') return true;
        return product.category && product.category.toLowerCase() === filterType.toLowerCase();
    });

    productGrid.innerHTML = '';
    
    if (filteredItems.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem;">No products found in this category.</p>';
        return;
    }

    filteredItems.forEach(product => {
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${isOutOfStock ? '<div class="sold-out-overlay">SOLD OUT</div>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p style="font-size: 0.8rem; color: #666;">Stock: ${product.stock}</p>
                <div class="price-row">
                    <span class="price">$${product.price.toFixed(2)}</span>
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

// Event Delegation for Filter Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        // 1. Update Visuals
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // 2. Apply Filter
        currentFilter = e.target.getAttribute('data-filter');
        renderProducts(currentFilter);
    }
});

// ==========================================
// 4. CART LOGIC (GLOBAL)
// ==========================================
// Make addToCart global so HTML onclick works
window.addToCart = function(id) {
    const p = productsData.find(item => item.id === id);
    if (p && p.stock > 0) {
        cart.push(p);
        saveCart();
        showToast(`Added ${p.name} to cart!`);
        
        // Optional: Open cart immediately
        document.dispatchEvent(new Event('openCart')); 
    }
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
};

function saveCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    updateCartUI();
}

// Note: This updates the CONTENTS of the cart sidebar
function updateCartUI() {
    const countBadge = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    // If navbar hasn't loaded yet, these might be null. 
    // We retry or check existence.
    if (!container) return; 

    if (countBadge) countBadge.innerText = cart.length;

    container.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" style="width:50px; height:50px; border-radius:5px; object-fit:cover;">
                <div style="flex:1;">
                    <h4 style="font-size:0.9rem; margin:0;">${item.name}</h4>
                    <div class="price" style="font-size:0.9rem;">$${item.price.toFixed(2)}</div>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        });
    }
    
    if(totalEl) totalEl.innerText = '$' + total.toFixed(2);
}

// Listen for Navbar Load to refresh cart count
document.addEventListener('navbarLoaded', updateCartUI);

// ==========================================
// 5. AUTH & CHECKOUT
// ==========================================
window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Save user to 'users' collection (matches your rules)
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName, 
            email: user.email, 
            lastLogin: serverTimestamp()
        }, { merge: true });
        
        showToast(`Welcome, ${user.displayName.split(' ')[0]}!`);
        setTimeout(() => window.location.href = "index.html", 1000);
    } catch (error) { alert(error.message); }
}

onAuthStateChanged(auth, async (user) => {
    const navBtn = document.getElementById('nav-signin-btn');
    if (user && navBtn) {
        navBtn.innerHTML = `<i class="fa-regular fa-user"></i> ${user.displayName.split(' ')[0]}`;
        navBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Log out?")) signOut(auth).then(() => window.location.reload());
        };
    }
});

// Toast Notification Helper
function showToast(msg) {
    // Remove existing toast if any
    const existing = document.querySelector('.toast');
    if(existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'toast show';
    t.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ... (keep all your existing code) ...

// ==========================================
// 6. EXPORT TO WINDOW (REQUIRED FOR HTML CLICK)
// ==========================================
window.openCheckout = function() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('checkout-overlay');
    const summary = document.getElementById('checkout-summary');
    
    // Calculate Total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    summary.innerHTML = `<p>Total Amount: <strong>$${total.toFixed(2)}</strong></p><p>Items: ${cart.length}</p>`;

    if(modal) modal.classList.add('active');
    if(overlay) overlay.classList.add('active');
    
    // Close the sidebar so it doesn't block the modal
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

window.closeCheckout = function() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

window.processPayment = async function(e) {
    e.preventDefault();
    alert("Payment Successful! (Demo Mode)");
    
    // Clear Cart
    cart = [];
    localStorage.setItem('studySpaceCart', JSON.stringify([]));
    
    // Refresh Page
    window.location.reload();
}

