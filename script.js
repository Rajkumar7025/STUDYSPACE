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
const productsData = [
    { id: 1, name: "Study Desk & Chair", category: "furniture", price: 0.00, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80" },
    { id: 2, name: "Cozy Bedding Set", category: "bedding", price: 79.99, image: "https://images.unsplash.com/photo-1522771753035-1a5b65a9f176?w=500&q=80" },
    { id: 3, name: "Kitchen Starter Pack", category: "kitchen", price: 89.99, image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=500&q=80" },
    { id: 4, name: "Under-bed Storage", category: "storage", price: 29.99, image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=500&q=80" },
    { id: 5, name: "Ergonomic Office Chair", category: "furniture", price: 120.00, image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80" },
    { id: 6, name: "LED Desk Lamp", category: "furniture", price: 25.00, image: "https://images.unsplash.com/photo-1534281303260-5920f0728475?w=500&q=80" },
    { id: 7, name: "Non-Stick Cookware Set", category: "kitchen", price: 55.00, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80" },
    { id: 8, name: "Memory Foam Pillow", category: "bedding", price: 35.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&q=80" },
    { id: 9, name: "Laundry Basket", category: "storage", price: 15.99, image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80" },
    { id: 10, name: "Compact Bookshelf", category: "furniture", price: 65.00, image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80" },
    { id: 11, name: "Electric Kettle", category: "kitchen", price: 22.50, image: "https://images.unsplash.com/photo-1594213114663-d94db9b17126?w=500&q=80" },
    { id: 12, name: "Duvet Insert (Queen)", category: "bedding", price: 45.00, image: "https://images.unsplash.com/photo-1616486701797-0f33f61038ec?w=500&q=80" },
    { id: 13, name: "Cutlery Set (16pc)", category: "kitchen", price: 19.99, image: "https://images.unsplash.com/photo-1581643799863-12d42436f56b?w=500&q=80" },
    { id: 14, name: "Shoe Rack Organizer", category: "storage", price: 32.00, image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80" },
    { id: 15, name: "Throw Blanket", category: "bedding", price: 24.99, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80" },
    { id: 16, name: "Mini Fridge", category: "kitchen", price: 150.00, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80" },
    { id: 17, name: "Closet Hangers (20pk)", category: "storage", price: 12.00, image: "https://images.unsplash.com/photo-1610336829705-18cb6641e469?w=500&q=80" },
    { id: 18, name: "Bean Bag Chair", category: "furniture", price: 55.00, image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=500&q=80" },
    { id: 19, name: "Food Storage Containers", category: "kitchen", price: 28.00, image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80" },
    { id: 20, name: "Bedside Rug", category: "bedding", price: 35.00, image: "https://images.unsplash.com/photo-1575414723226-972a9e38d780?w=500&q=80" }
];

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

