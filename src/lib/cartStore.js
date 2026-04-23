// Simple cart store using localStorage
const CART_KEY = 'solargear_cart';

function getCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartItems() {
  return getCart();
}

export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find(item => item.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url,
      slug: product.slug,
    });
  }
  saveCart(items);
}

export function updateCartQuantity(productId, quantity) {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter(item => item.product_id !== productId);
  } else {
    const item = items.find(item => item.product_id === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(items);
}

export function removeFromCart(productId) {
  const items = getCart().filter(item => item.product_id !== productId);
  saveCart(items);
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function subscribeToCart(callback) {
  // Call this in useEffect
  const handler = () => callback();
  window.addEventListener('cart-updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('cart-updated', handler);
    window.removeEventListener('storage', handler);
  };
}