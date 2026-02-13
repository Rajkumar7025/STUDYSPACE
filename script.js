// ==========================================
// 1. FIREBASE SETUP & IMPORTS
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
// 2. DATA STATES (Products & Cart)
// ==========================================
let productsData = []; 
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

// Real-time listener for the Product Database
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderAllProducts(); 
});

// ==========================================
// 3. AUTHENTICATION LOGIC
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

onAuthStateChanged(auth, async (user) => {
    const navBtn = document.getElementById('nav-signin-btn');
    if (user && navBtn) {
        navBtn.innerHTML = `<i class="fa-regular fa-user"></i> Hi, ${user.displayName.split(' ')[0]}`;
        navBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Log out of StudySpace?")) window.handleLogout();
        };
        // Sync Cloud Cart
        const cartDoc = await getDoc(doc(db, "carts", user.uid));
        if (cartDoc.exists()) {
            cart = cartDoc.data().items || [];
            updateCartUI();
        }
    }
});

// ==========================================
// 4. SHOPPING & INVENTORY LOGIC
// ==========================================

async function saveCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, "carts", user.uid), { items: cart });
    }
    updateCartUI();
}

window.addToCart = function(id) {
    const product = productsData.find(p => p.id === id);
    if (!product || product.stock <= 0) return showToast("Out of stock!");

    cart.push(product);
    saveCart();
    showToast(`Added ${product.name}!`);
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
}

// ==========================================
// 5. RENDERING & UI
// ==========================================

function renderAllProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const itemsToShow = isHome ? productsData.slice(0, 4) : productsData;

    productGrid.innerHTML = '';
    itemsToShow.forEach(product => {
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
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
                        ${isOutOfStock ? 'Empty' : 'Add'}
                    </button>
                </div>
            </div>`;
        productGrid.appendChild(card);
    });
}

function updateCartUI() {
    const count = document.getElementById('cart-count');
    if(count) count.innerText = cart.length;

    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    if(container && totalEl) {
        container.innerHTML = '';
        let total = 0;
        cart.forEach((item, idx) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-remove" onclick="removeFromCart(${idx})">Remove</div>
                </div>`;
            container.appendChild(div);
        });
        totalEl.innerText = '$' + total.toFixed(2);
    }
}

// ==========================================
// 6. CHECKOUT & DATABASE SYNC
// ==========================================

window.processPayment = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    const user = auth.currentUser;
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // Create Order Record
        const orderData = {
            userId: user ? user.uid : "guest",
            customerName: user ? user.displayName : "Guest",
            customerEmail: user ? user.email : "No Email",
            items: cart,
            subtotal: cart.reduce((s, i) => s + i.price, 0),
            status: "Pending Shipping",
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "orders"), orderData);

        // Update Stock Quantities in Database
        for (const item of cart) {
            const productRef = doc(db, "products", item.id);
            await updateDoc(productRef, { stock: increment(-1) });
        }

        window.closeCheckout();
        cart = [];
        saveCart();
        renderSuccessMessage(orderData.customerEmail);
    } catch (err) {
        alert("Transaction Error: " + err.message);
    } finally {
        btn.innerText = "Pay Now";
        btn.disabled = false;
    }
};

window.renderSuccessMessage = function(email) {
    const main = document.querySelector('.section') || document.body;
    main.innerHTML = `
        <div class="container text-center" style="padding: 100px 20px;">
            <div class="icon-circle" style="margin: 0 auto 30px; width: 100px; height: 100px; font-size: 3rem; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h1>Order Confirmed!</h1>
            <p>Details sent to <strong>${email}</strong>. Our shipping team is on it!</p>
            <a href="index.html" class="btn btn-primary" style="margin-top:20px;">Home</a>
        </div>`;
}

// ==========================================
// 7. GLOBAL UI HANDLERS
// ==========================================

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast show';
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.openCheckout = function() {
    if(cart.length === 0) return showToast("Cart is empty!");
    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('checkout-overlay').classList.add('active');
}

window.closeCheckout = () => {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const openCart = document.getElementById('open-cart-btn');
    const closeCart = document.getElementById('close-cart-btn');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if(openCart) openCart.onclick = () => { sidebar.classList.add('open'); overlay.classList.add('open'); };
    if(closeCart) closeCart.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
    if(overlay) overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
});
