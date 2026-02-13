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
// 2. DATA STATES
// ==========================================
let productsData = []; 
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

// Sync Products from Database
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderAllProducts(); 
});

// ==========================================
// 3. AUTHENTICATION
// ==========================================
window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName, email: user.email, lastLogin: new Date()
        }, { merge: true });
        showToast(`Welcome, ${user.displayName.split(' ')[0]}!`);
        if(window.location.pathname.includes('signin.html')) window.location.href = "index.html";
    } catch (error) { alert(error.message); }
}

onAuthStateChanged(auth, async (user) => {
    const navBtn = document.getElementById('nav-signin-btn');
    if (user && navBtn) {
        navBtn.innerHTML = `<i class="fa-regular fa-user"></i> Hi, ${user.displayName.split(' ')[0]}`;
        navBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Log out?")) signOut(auth).then(() => window.location.reload());
        };
    }
});

// ==========================================
// 4. RENDERING & FILTERING
// ==========================================
function renderAllProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '';
    productsData.forEach(product => {
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        // IMPORTANT: data-category is needed for filtering
        card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.setAttribute('data-category', product.category.toLowerCase());
        
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
                        ${isOutOfStock ? 'Sold Out' : 'Add'}
                    </button>
                </div>
            </div>`;
        productGrid.appendChild(card);
    });
}

// Filter Logic
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        document.querySelectorAll('.product-card').forEach(card => {
            const cat = card.getAttribute('data-category');
            card.style.display = (filter === 'all' || cat === filter) ? "block" : "none";
        });
    }
});

// ==========================================
// 5. CART & CHECKOUT
// ==========================================
window.addToCart = function(id) {
    const p = productsData.find(item => item.id === id);
    if (p && p.stock > 0) {
        cart.push(p);
        localStorage.setItem('studySpaceCart', JSON.stringify(cart));
        updateCartUI();
        showToast("Added to cart!");
    }
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
            container.innerHTML += `<div class="cart-item">
                <img src="${item.image}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price.toFixed(2)}</div>
                </div>
            </div>`;
        });
        totalEl.innerText = '$' + total.toFixed(2);
    }
}

window.openCheckout = function() {
    if(cart.length === 0) return alert("Cart is empty!");
    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('checkout-overlay').classList.add('active');
}

window.closeCheckout = () => {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

window.processPayment = async (e) => {
    e.preventDefault();
    try {
        const orderData = { items: cart, subtotal: cart.reduce((s,i)=>s+i.price,0), createdAt: serverTimestamp() };
        await addDoc(collection(db, "orders"), orderData);
        for (const item of cart) {
            await updateDoc(doc(db, "products", item.id), { stock: increment(-1) });
        }
        cart = []; localStorage.removeItem('studySpaceCart');
        window.location.reload(); 
        alert("Order Successful!");
    } catch (err) { alert(err.message); }
};

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast show';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}
