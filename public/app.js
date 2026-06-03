'use strict';

const $ = (s) => document.querySelector(s);
const money = (p) => '£' + (Number(p) / 100).toFixed(2);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const cart = new Map(); // sku -> { product, qty }
let products = [];

async function init() {
  try {
    const h = await (await fetch('./health')).json();
    if (h.status === 'ok') $('#health').textContent = 'live';
  } catch { $('#health').textContent = 'offline'; }

  try {
    products = await (await fetch('./products')).json();
    renderProducts();
  } catch {
    $('#products').innerHTML = '<p class="loading">Could not load products.</p>';
  }
  $('#placeOrder').addEventListener('click', placeOrder);
}

function renderProducts() {
  const grid = $('#products');
  grid.innerHTML = '';
  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML =
      `<div class="emoji">${esc(p.emoji)}</div>` +
      `<div class="name">${esc(p.name)}</div>` +
      `<div class="blurb">${esc(p.blurb)}</div>` +
      `<div class="price">${money(p.price)}</div>` +
      `<button data-sku="${esc(p.sku)}">Add to cart</button>`;
    card.querySelector('button').addEventListener('click', () => addToCart(p.sku));
    grid.append(card);
  }
}

function addToCart(sku) {
  const product = products.find((p) => p.sku === sku);
  if (!product) return;
  const entry = cart.get(sku) || { product, qty: 0 };
  entry.qty += 1;
  cart.set(sku, entry);
  renderCart();
}

function setQty(sku, delta) {
  const entry = cart.get(sku);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cart.delete(sku);
  renderCart();
}

function renderCart() {
  const box = $('#cartItems');
  if (cart.size === 0) {
    box.innerHTML = '<p class="empty">Your cart is empty — add something nice.</p>';
    $('#summary').innerHTML = '';
    $('#placeOrder').disabled = true;
    return;
  }
  box.innerHTML = '';
  let subtotal = 0;
  for (const { product, qty } of cart.values()) {
    subtotal += product.price * qty;
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML =
      `<div class="l-name">${esc(product.emoji)} ${esc(product.name)}<small>${money(product.price)} each</small></div>` +
      `<div class="qty"><button data-d="-1">−</button><span>${qty}</span><button data-d="1">+</button></div>` +
      `<div class="l-price">${money(product.price * qty)}</div>`;
    const [minus, plus] = line.querySelectorAll('button');
    minus.addEventListener('click', () => setQty(product.sku, -1));
    plus.addEventListener('click', () => setQty(product.sku, 1));
    box.append(line);
  }
  $('#summary').innerHTML = `<div class="row total"><span>Subtotal</span><b>${money(subtotal)}</b></div>` +
    `<div class="row"><span>Tax &amp; total calculated at checkout</span></div>`;
  $('#placeOrder').disabled = false;
}

async function placeOrder() {
  const name = $('#customerName').value.trim();
  const coupon = $('#coupon').value.trim();
  const err = $('#formError');
  err.classList.add('hidden');
  if (!name) { err.textContent = 'Please enter your name.'; err.classList.remove('hidden'); return; }

  const btn = $('#placeOrder');
  btn.disabled = true; btn.textContent = 'Placing order…';
  const cartId = 'web-' + Date.now();
  try {
    // sync the cart to the service, then check out
    for (const { product, qty } of cart.values()) {
      await fetch(`./cart/${cartId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: product.sku, name: product.name, price: product.price, quantity: qty }),
      });
    }
    const body = { cartId, customer: { name } };
    if (coupon) body.couponCode = coupon;
    const res = await fetch('./checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { showError(res.status, data); }
    else { showReceipt(data); }
  } catch (e) {
    showError(0, { message: String(e) });
  } finally {
    btn.disabled = false; btn.textContent = 'Place order';
  }
}

function showReceipt(o) {
  const fmt = o.formattedTotal;
  const fmtRow = fmt
    ? `<div class="row grand"><span>Total</span><span>${esc(fmt)}</span></div>`
    : `<div class="row grand"><span>Total</span><span class="warn">${money(o.total)} — formattedTotal missing!</span></div>`;
  const lines = (o.lineItems || []).map((li) =>
    `<div class="li"><span>${esc(li.name)} × ${esc(li.quantity)}</span><span>${money(li.price * li.quantity)}</span></div>`).join('');
  $('#receipt').innerHTML =
    `<div class="ok-badge">✓ Order confirmed</div>` +
    `<h3>Thanks, ${esc(o.customer && o.customer.name)}!</h3>` +
    `<div class="order-id">${esc(o.orderId)}</div>` +
    `<div class="lines">${lines}</div>` +
    `<div class="totals">` +
      `<div class="row"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>` +
      `<div class="row"><span>Discount</span><span>−${money(o.discount)}</span></div>` +
      `<div class="row"><span>Tax</span><span>${money(o.tax)}</span></div>` +
      fmtRow +
    `</div>` +
    `<button id="closeReceipt">Done</button>`;
  $('#closeReceipt').addEventListener('click', closeOverlay);
  $('#overlay').classList.remove('hidden');
}

function showError(status, data) {
  const msg = data && data.message ? (Array.isArray(data.message) ? data.message.join(', ') : data.message) : 'Something went wrong';
  $('#receipt').innerHTML =
    `<div class="err-badge">✕ Order failed${status ? ' (HTTP ' + status + ')' : ''}</div>` +
    `<h3>We couldn't place your order</h3>` +
    `<p style="color:var(--muted);font-size:14px">${esc(msg)}</p>` +
    `<button id="closeReceipt">Close</button>`;
  $('#closeReceipt').addEventListener('click', closeOverlay);
  $('#overlay').classList.remove('hidden');
}

function closeOverlay() { $('#overlay').classList.add('hidden'); }

init();
