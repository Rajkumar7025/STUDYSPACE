// ==========================================
// 1. FIREBASE SETUP (The Backend Brain)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// ADD collection, addDoc, and serverTimestamp BELOW
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Specific Configuration
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
// 2. AUTHENTICATION LOGIC (Google Login)
// ==========================================

// Function to handle Google Login
window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Save user to database (Firestore)
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            lastLogin: new Date()
        }, { merge: true });

        showToast(`Welcome, ${user.displayName.split(' ')[0]}!`);
        
        // Redirect if on signin page
        if(window.location.pathname.includes('signin.html')) {
            setTimeout(() => window.location.href = "index.html", 1000);
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
    }
}

// Function to handle Logout
window.handleLogout = async function() {
    try {
        await signOut(auth);
        showToast("Logged out successfully");
        // Reload page to reset UI
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Listen for Login State Changes (Runs automatically)
onAuthStateChanged(auth, (user) => {
    const navBtn = document.getElementById('nav-signin-btn');
    
    if (user && navBtn) {
        // User is Logged In -> Change Button to Profile/Logout
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Student';
        navBtn.innerHTML = `<i class="fa-regular fa-user"></i> Hi, ${firstName}`;
        navBtn.classList.remove('btn-primary');
        navBtn.style.background = 'transparent';
        navBtn.style.color = 'var(--primary-color)';
        navBtn.style.border = '1px solid var(--primary-color)';
        
        // Change the link behavior to Logout
        navBtn.href = "#";
        navBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Do you want to log out?")) {
                window.handleLogout();
            }
        };
    } else if (navBtn) {
        // User is Logged Out -> Reset Button
        navBtn.innerHTML = "Sign In";
        navBtn.href = "signin.html";
        navBtn.classList.add('btn-primary');
        navBtn.style.background = '';
        navBtn.style.color = '';
        navBtn.style.border = '';
        navBtn.onclick = null; // Remove logout listener
    }
});

// ==========================================
// 3. PRODUCT DATA (The Inventory)
// ==========================================
const productsData = [
    { id: 1, name: "Study Desk & Chair", category: "furniture", price: 149.99, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80" },
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
// 4. SHOPPING CART LOGIC
// ==========================================
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

function saveCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    updateCartUI();
}

// MAKE GLOBAL so HTML can see it
window.addToCart = function(id) {
    const product = productsData.find(p => p.id === id);
    if (!product) return;

    cart.push(product);
    saveCart();
    showToast(`Added ${product.name} to cart!`);
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
                    </div>
                `;
                cartContainer.appendChild(div);
            });
        }
        totalEl.innerText = '$' + total.toFixed(2);
    }
}

// ==========================================
// 5. UI & INITIALIZATION
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
// Expose showToast to window so other scripts can use it
window.showToast = showToast; 

document.addEventListener('DOMContentLoaded', () => {

    // 1. Render Products (Dynamic Grid)
    const productGrid = document.querySelector('.product-grid');
    // Check if we are on products.html OR index.html
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isProducts = window.location.pathname.includes('products.html');

    if (productGrid) {
        productGrid.innerHTML = ''; 
        // If Home, show only 4 items. If Products, show all.
        const itemsToShow = isHome ? productsData.slice(0, 4) : productsData;
        
        itemsToShow.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category);
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <span class="product-badge" style="position:absolute; top:10px; right:10px; background:white; padding:4px 10px; border-radius:15px; font-size:0.7rem; font-weight:bold;">${product.category.toUpperCase()}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="rating"><i class="fa-solid fa-star"></i> 5.0</div>
                    <div class="price-row">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        <button class="btn btn-sm btn-primary" onclick="addToCart(${product.id})">Add</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // 2. Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.product-card').forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // 3. Cart Sidebar Logic
    setTimeout(() => {
        const cartBtn = document.getElementById('open-cart-btn');
        const closeCartBtn = document.getElementById('close-cart-btn');
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        const mobileCart = document.querySelector('a[onclick*="openCart"]');
        
        function toggleCart(e) {
            if(e) e.preventDefault();
            if(sidebar) sidebar.classList.toggle('open');
            if(overlay) overlay.classList.toggle('open');
        }

        if(cartBtn) cartBtn.addEventListener('click', toggleCart);
        if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if(overlay) overlay.addEventListener('click', toggleCart);
        if(mobileCart) mobileCart.addEventListener('click', toggleCart);
        
        updateCartUI();
    }, 500);
});

// ==========================================
// 6. CHECKOUT LOGIC
// ==========================================

window.injectCheckoutModal = function() {
    if(document.getElementById('checkout-modal')) return; // Don't duplicate
    const modalHTML = `
    <div class="checkout-modal" id="checkout-modal">
        <div class="checkout-header">
            <i class="fa-regular fa-credit-card"></i>
            <h2>Secure Checkout</h2>
            <p>Complete your purchase</p>
        </div>
        <div class="order-summary" id="order-summary"></div>
        <form id="payment-form" onsubmit="processPayment(event)">
            <input type="text" class="form-input" placeholder="Card Number (Simulated)" required>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <input type="text" class="form-input" placeholder="MM/YY" required>
                <input type="text" class="form-input" placeholder="123" required>
            </div>
            <button type="submit" class="btn btn-primary full-width" id="pay-btn">Pay Now</button>
        </form>
        <button class="btn btn-outline full-width" style="margin-top:10px; border:none;" onclick="closeCheckout()">Cancel</button>
    </div>
    <div class="modal-overlay" id="checkout-overlay"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach listener to overlay
    document.getElementById('checkout-overlay').addEventListener('click', window.closeCheckout);
}

window.openCheckout = function() {
    if(cart.length === 0) return showToast("Your cart is empty!");
    
    // Check if modal exists, if not inject it
    injectCheckoutModal();

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const summary = document.getElementById('order-summary');
    if(summary) {
        summary.innerHTML = `
            <div class="summary-row"><span>Subtotal</span> <span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Tax (8%)</span> <span>$${tax.toFixed(2)}</span></div>
            <div class="summary-total"><div class="summary-row" style="margin:0;"><span>Total</span> <span>$${total.toFixed(2)}</span></div></div>
        `;
    }

    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('checkout-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.remove('open');
}

window.closeCheckout = function() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

window.processPayment = function(e) {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    btn.innerText = "Processing...";
    
    setTimeout(() => {
        window.closeCheckout();
        cart = [];
        saveCart();
        showToast("Order Placed Successfully!");
        btn.innerText = "Pay Now";
        document.getElementById('payment-form').reset();
    }, 2000);
}

// Attach checkout to sidebar button dynamically
document.addEventListener('click', function(e){
    if(e.target && e.target.innerText === 'Checkout' && e.target.closest('.cart-footer')){
        window.openCheckout();
    }

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
