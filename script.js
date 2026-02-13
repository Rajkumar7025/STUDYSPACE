// ==========================================
// 1. FIREBASE SETUP (The Connection)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, onSnapshot, addDoc, serverTimestamp, increment, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Specific Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB47wH_KObIIMAksM8TqI7norRmSK0IXnY",
  authDomain: "studyspace-backend.firebaseapp.com",
  projectId: "studyspace-backend",
  storageBucket: "studyspace-backend.firebasestorage.app",
  messagingSenderId: "511542334086",
  appId: "1:511542334086:web:11e4de3014db2966743707",
  measurementId: "G-LFTQWBYXGS"
};

// Initialize Connection
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("🔥 Firebase Connected!"); // Check your console for this message

// ==========================================
// 2. FETCH PRODUCTS (Real-time Link to Admin)
// ==========================================
let productsData = []; 
let cart = JSON.parse(localStorage.getItem('studySpaceCart')) || [];

// This listener waits for changes in your Admin Panel
onSnapshot(collection(db, "products"), (snapshot) => {
    productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    console.log("📦 Products loaded:", productsData.length);
    renderProducts('all'); // Render immediately when data arrives
});

// ==========================================
// 3. RENDER FUNCTION (Displays the Data)
// ==========================================
function renderProducts(filterType) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    // Filter Logic
    const filteredItems = productsData.filter(product => {
        if (filterType === 'all') return true;
        // Check if category exists before lowering case to prevent errors
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
// 4. GLOBAL FUNCTIONS (So HTML can see them)
// ==========================================

// Filter Button Logic
window.filterProducts = function(category, btn) {
    // Visual Update
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    // Render Update
    renderProducts(category);
}

// Add event listeners to buttons manually if they don't use onclick
document.addEventListener('click', (e) => {
    if(e.target.classList.contains('filter-btn')) {
        const cat = e.target.getAttribute('data-filter');
        window.filterProducts(cat, e.target);
    }
});

window.addToCart = function(id) {
    const p = productsData.find(item => item.id === id);
    if (p && p.stock > 0) {
        cart.push(p);
        updateCart();
        alert(`Added ${p.name} to cart!`);
    }
};

function updateCart() {
    localStorage.setItem('studySpaceCart', JSON.stringify(cart));
    // Dispatch event so main.js knows to update the number
    document.dispatchEvent(new Event('cartUpdated'));
    
    // Update the UI if the sidebar is open
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
        
        // Update count badge
        const badge = document.getElementById('cart-count');
        if(badge) badge.innerText = cart.length;
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCart();
}

// Run cart update on load
window.addEventListener('DOMContentLoaded', updateCart);

// ==========================================
// 5. CHECKOUT LOGIC
// ==========================================
window.openCheckout = function() {
    if(cart.length === 0) return alert("Cart is empty!");
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('checkout-overlay');
    if(modal) modal.classList.add('active'); // CSS must have .active { display:block } or opacity:1
    if(overlay) overlay.classList.add('active');
    
    // Auto-calculate total for the modal
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    const summary = document.getElementById('checkout-summary');
    if(summary) summary.innerHTML = `<h3>Total to Pay: $${total.toFixed(2)}</h3>`;
}

window.closeCheckout = function() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('checkout-overlay').classList.remove('active');
}

// ==========================================
// REPLACE YOUR EXISTING processPayment FUNCTION
// ==========================================
window.processPayment = async function(e) {
    e.preventDefault();
    
    if(cart.length === 0) return alert("Cart is empty!");

    // 1. Collect Order Details
    const orderData = {
        customerName: "Guest Student", // You can add an input field for this later
        customerEmail: "student@example.com",
        items: cart, // Saves the whole cart array
        total: cart.reduce((sum, item) => sum + Number(item.price), 0),
        status: "Pending", // Default status
        createdAt: new Date() // Timestamp
    };

    try {
        // 2. Save Order to 'orders' Collection
        await addDoc(collection(db, "orders"), orderData);

        // 3. Reduce Stock for Each Item
        // We loop through the cart and update the 'products' collection
        for (const item of cart) {
            const productRef = doc(db, "products", item.id);
            await updateDoc(productRef, {
                stock: increment(-1) // Magically subtracts 1 from current stock
            });
        }

        // 4. Success!
        alert("✅ Order Placed! We have received your order.");
        cart = []; // Clear local cart
        updateCart(); // Update UI
        window.closeCheckout(); // Close modal

    } catch (error) {
        console.error("Order Failed:", error);
        alert("❌ Error placing order: " + error.message);
    }
}

