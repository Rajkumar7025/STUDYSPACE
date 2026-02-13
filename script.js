// ==========================================
// 1. FIREBASE SETUP & IMPORTS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// ADD collection, addDoc, and serverTimestamp BELOW
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Web App's Firebase Configuration
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

// ==========================================
// 2. PRODUCT DATA (The Inventory)
// ==========================================
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let productsData = [];

// This function listens to the database in real-time
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    // Call your render function every time a product is added/changed
    renderAllProducts(); 
});

function renderAllProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    productsData.forEach(product => {
        // ... paste your existing product card HTML generation here ...
    });
}

// ==========================================
// 3. AUTHENTICATION LOGIC (Google Login)
// ==========================================

window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            lastLogin: new Date()
        }, { merge: true });

        showToast(`Welcome, ${user.displayName.split(' ')[0]}!`);
        if(window.location.pathname.includes('signin.html')) {
            setTimeout(() => window.location.href = "index.html", 1000);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
    }
}

window.handleLogout = async function() {
    try {
        await signOut(auth);
        showToast("Logged out successfully");
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Sync UI with Auth State
onAuthStateChanged(auth, async (user) => {
    const navBtn = document.getElementById('nav-signin-btn');
    if (user && navBtn) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Student';
        navBtn.innerHTML = `<i class="fa-regular fa-user"></i> Hi, ${firstName}`;
        navBtn.href = "#";
        navBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Do you want to log out?")) window.handleLogout();
        };
        // Sync cloud cart to local on login
        const cartDoc = await getDoc(doc(db, "carts", user.uid));
        if (cartDoc.exists()) {
            cart = cartDoc.data().items || [];
            updateCartUI();
        }
    } else if (navBtn) {
        navBtn.innerHTML = "Sign In";
        navBtn.href = "signin.html";
        navBtn.onclick = null;
    }
});

// ==========================================
// 4. SHOPPING CART & PERSISTENCE
// ==========================================
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

async function saveCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, "carts", user.uid), {
            items: cart,
            updatedAt: new Date()
        });
    }
    updateCartUI();
}

window.addToCart = function(id) {
    const product = productsData.find(p => p.id === id);
    if (product) {
        cart.push(product);
        saveCart();
        showToast(`Added ${product.name} to cart!`);
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if(cartCount) cartCount.innerText = cart.length;

    const cartContainer = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    if(cartContainer && totalEl) {
        cartContainer.innerHTML = '';
        let total = 0;
        if(cart.length === 0) {
            cartContainer.innerHTML = '<p class="empty-msg" style="text-align:center; color:#999; margin-top:20px;">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-remove" onclick="removeFromCart(${index})">Remove</div>
                    </div>`;
                cartContainer.appendChild(div);
            });
        }
        totalEl.innerText = '$' + total.toFixed(2);
    }
}

// ==========================================
// 5. UI FEATURES & INITIALIZATION
// ==========================================

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#22c55e"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    
    if (productGrid) {
        productGrid.innerHTML = ''; 
        const itemsToShow = isHome ? productsData.slice(0, 4) : productsData;
        itemsToShow.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category);
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <span class="product-badge" style="position:absolute; top:10px; right:10px; background:white; padding:4px 10px; border-radius:15px; font-size:0.7rem; font-weight:bold; color:var(--primary-color)">${product.category.toUpperCase()}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="rating"><i class="fa-solid fa-star"></i> 5.0</div>
                    <div class="price-row">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        <button class="btn btn-sm btn-primary" onclick="addToCart(${product.id})">Add</button>
                    </div>
                </div>`;
            productGrid.appendChild(card);
        });
    }

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('.product-card').forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) card.classList.remove('hidden');
                else card.classList.add('hidden');
            });
        });
    });

    // Cart Sidebar Toggle
    setTimeout(() => {
        const cartBtn = document.getElementById('open-cart-btn');
        const closeCartBtn = document.getElementById('close-cart-btn');
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        
        function toggleCart(e) {
            if(e) e.preventDefault();
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        }

        if(cartBtn) cartBtn.addEventListener('click', toggleCart);
        if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if(overlay) overlay.addEventListener('click', toggleCart);
        updateCartUI();
    }, 500);
});

// --- SCROLL TO TOP ---
const scrollBtn = document.createElement('button');
scrollBtn.id = 'scroll-top-btn';
scrollBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollBtn.classList.add('visible');
    else scrollBtn.classList.remove('visible');
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================
// 6. CHECKOUT LOGIC
// ==========================================

window.openCheckout = function() {
    if(cart.length === 0) return showToast("Your cart is empty!");
    
    if(!document.getElementById('checkout-modal')) {
        const modalHTML = `
        <div class="checkout-modal" id="checkout-modal">
            <div class="checkout-header">
                <i class="fa-regular fa-credit-card"></i>
                <h2>Secure Checkout</h2>
                <p>Complete your purchase</p>
            </div>
            <div class="order-summary" id="order-summary"></div>
            <form onsubmit="processPayment(event)">
                <input type="text" class="form-input" placeholder="Card Number (Simulated)" required>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <input type="text" class="form-input" placeholder="MM/YY" required>
                    <input type="text" class="form-input" placeholder="123" required>
                </div>
                <button type="submit" class="btn btn-primary full-width" id="pay-btn">Pay Now</button>
            </form>
            <button class="btn btn-outline full-width" style="margin-top:10px; border:none;" onclick="closeCheckout()">Cancel</button>
        </div>
        <div class="modal-overlay" id="checkout-overlay"></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('checkout-overlay').onclick = closeCheckout;
    }

    const sub = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('order-summary').innerHTML = `
        <div class="summary-row"><span>Total Items:</span> <span>${cart.length}</span></div>
        <div class="summary-total"><div class="summary-row"><span>Total:</span> <span>$${(sub * 1.08).toFixed(2)}</span></div></div>`;

    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('checkout-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.remove('open');
}

window.closeCheckout = () => {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

window.processPayment = (e) => {
    e.preventDefault();
    document.getElementById('pay-btn').innerText = "Processing...";
    setTimeout(() => {
        closeCheckout();
        cart = [];
        saveCart();
        showToast("Order Placed Successfully!");
    }, 2000);
}

// Global Checkout Event Listener
document.addEventListener('click', (e) => {
    if(e.target.innerText === 'Checkout' && e.target.closest('.cart-footer')) window.openCheckout();
});

window.processPayment = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    const user = auth.currentUser;
    
    btn.innerText = "Processing Order...";
    btn.disabled = true;

    try {
        // 1. Create the Order Object for the Admin
        const orderData = {
            userId: user ? user.uid : "guest",
            customerName: user ? user.displayName : "Guest Student",
            customerEmail: user ? user.email : "Not Provided",
            items: cart, // The full list of items
            subtotal: cart.reduce((s, i) => s + i.price, 0),
            status: "Pending Shipping", // Tells the admin to take action
            createdAt: serverTimestamp()
        };

        // 2. Save to Firebase "Orders" Collection
        await addDoc(collection(db, "orders"), orderData);

        // 3. Success UI
        window.closeCheckout();
        cart = []; 
        saveCart(); 
        showToast("Order Successful! Admin has been notified.");
        
        // 4. Show the "Success Message" to the User
        renderSuccessMessage(orderData.customerEmail);

    } catch (error) {
        console.error("Order Error:", error);
        alert("Transaction failed. Please try again.");
    } finally {
        btn.innerText = "Pay Now";
        btn.disabled = false;
    }
};

function renderSuccessMessage(email) {
    const container = document.querySelector('.section') || document.body;
    container.innerHTML = `
        <div class="container text-center" style="padding: 100px 20px;">
            <div class="icon-circle bg-green" style="margin: 0 auto 30px; width: 100px; height: 100px; font-size: 3rem;">
                <i class="fa-solid fa-truck-fast"></i>
            </div>
            <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Order Confirmed!</h1>
            <p style="font-size: 1.2rem; color: #6b7280; max-width: 600px; margin: 0 auto 30px;">
                Thank you for shopping with StudySpace. We've sent a confirmation to <strong>${email}</strong>.
                Our team is currently preparing your items for delivery to your accommodation.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <a href="index.html" class="btn btn-primary">Back to Home</a>
                <a href="products.html" class="btn btn-outline">Shop More</a>
            </div>
        </div>
    `;
}

window.renderSuccessMessage = function(email) {
    const container = document.querySelector('.section') || document.body;
    container.innerHTML = `
        <div class="container text-center" style="padding: 100px 20px;">
            <div class="icon-circle" style="margin: 0 auto 30px; width: 100px; height: 100px; font-size: 3rem; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Check your Inbox!</h1>
            <p style="font-size: 1.2rem; color: #6b7280; max-width: 600px; margin: 0 auto 30px;">
                A confirmation email has been sent to <strong>${email}</strong>. 
                Our team is now preparing your items for delivery.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        </div>
    `;
}


