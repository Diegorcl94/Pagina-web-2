// =========================
// Utilidades
// =========================
const CLP = (n) =>
  Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const setCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

const addToCart = (code) => {
  const prod = PRODUCTS.find(p => p.code === code);
  if (!prod) return;
  const cart = getCart();
  const idx = cart.findIndex(i => i.code === code);
  if (idx >= 0) cart[idx].qty++;
  else cart.push({ code: prod.code, name: prod.name, price: prod.price, qty: 1 });
  setCart(cart);

  // feedback
  const btn = document.querySelector(`[data-add="${code}"]`);
  if (btn) {
    const old = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2-circle"></i> Agregado';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = old; btn.disabled = false; }, 900);
  }
};

// =========================
// Datos de productos
// =========================
const PRODUCTS = [
  { code: 'JM001', category: 'Juegos de Mesa', name: 'Catan', price: 29990,
    desc: 'Clásico de estrategia para 3-4 jugadores.', img: 'img/catan.jpg' },
  { code: 'JM002', category: 'Juegos de Mesa', name: 'Carcassonne', price: 24990,
    desc: 'Juego de losetas medieval, 2-5 jugadores.', img: 'img/catalogo/carcassonne.jpg' },
  { code: 'AC001', category: 'Accesorios', name: 'Controlador Xbox Series X', price: 59990,
    desc: 'Botones mapeables y respuesta táctil mejorada.', img: 'img/catalogo/xbox-controller.jpg' },
  { code: 'AC002', category: 'Accesorios', name: 'HyperX Cloud II', price: 79990,
    desc: 'Sonido envolvente y gran comodidad.', img: 'img/catalogo/hyperx-cloud-ii.jpg' },
  { code: 'CO001', category: 'Consolas', name: 'PlayStation 5', price: 549990,
    desc: 'Consola de última generación de Sony.', img: 'img/catalogo/ps5.jpg' },
  { code: 'CG001', category: 'Computadores Gamers', name: 'PC Gamer ASUS ROG Strix', price: 1299990,
    desc: 'Máximo rendimiento para gamers exigentes.', img: 'img/catalogo/asus-rog-strix.jpg' },
  { code: 'SG001', category: 'Sillas Gamers', name: 'Secretlab Titan', price: 349990,
    desc: 'Silla ergonómica para largas sesiones.', img: 'img/catalogo/secretlab-titan.jpg' },
  { code: 'MS001', category: 'Mouse', name: 'Logitech G502 HERO', price: 49990,
    desc: 'Mouse de precisión con botones programables.', img: 'img/catalogo/logitech-g502.jpg' },
  { code: 'MP001', category: 'Mousepad', name: 'Razer Goliathus Chroma', price: 29990,
    desc: 'Mousepad con RGB personalizable.', img: 'img/catalogo/razer-goliathus-chroma.jpg' },
  { code: 'PP001', category: 'Poleras Personalizadas', name: "Polera Gamer 'Level-Up'", price: 14990,
    desc: 'Polera personalizable con tu gamer tag.', img: 'img/catalogo/polera-levelup.jpg' },
];

// =========================
// Render catálogo
// =========================
const renderCatalog = (items) => {
  const wrap = document.getElementById('catalogo');
  if (!wrap) return;
  wrap.innerHTML = items.map(p => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card bg-black text-white h-100 rounded-4 border-neon">
        <img src="${p.img}" class="card-img-top" alt="${p.name}" onerror="this.src='img/catalogo/placeholder.jpg'">
        <div class="card-body d-flex flex-column">
          <div class="small text-secondary">${p.category}</div>
          <h5 class="card-title">${p.name}</h5>
          <div class="small text-secondary">Código: ${p.code}</div>
          <p class="card-text flex-grow-1">${p.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong class="text-neon">${CLP(p.price)}</strong>
            <button class="btn btn-neon" data-add="${p.code}">
              <i class="bi bi-bag-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>`).join('');

  wrap.querySelectorAll('[data-add]').forEach(btn =>
    btn.addEventListener('click', () => addToCart(btn.getAttribute('data-add')))
  );
};

// =========================
// Carrito
// =========================
const DUOC = 0.20;
const renderCartPage = () => {
  const list = document.getElementById('cartList');
  const sSubtotal = document.getElementById('cSubtotal');
  const sDuoc = document.getElementById('cDuoc');
  const sTotal = document.getElementById('cTotal');
  if (!list || !sSubtotal) return;

  let cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = `<div class="alert alert-dark border-neon">Tu carrito está vacío.</div>`;
    sSubtotal.textContent = CLP(0);
    sDuoc.textContent = `- ${CLP(0)}`;
    sTotal.textContent = CLP(0);
    return;
  }

  list.innerHTML = cart.map(it => `
    <div class="p-3 border border-neon rounded-4 d-flex justify-content-between align-items-center">
      <div>
        <div class="fw-bold">${it.name}</div>
        <div class="small text-secondary">Código ${it.code}</div>
        <div class="small">Unitario: ${CLP(it.price)}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-neon btn-sm" data-dec="${it.code}"><i class="bi bi-dash"></i></button>
        <span>${it.qty}</span>
        <button class="btn btn-neon btn-sm" data-inc="${it.code}"><i class="bi bi-plus"></i></button>
        <button class="btn btn-outline-danger btn-sm" data-del="${it.code}"><i class="bi bi-trash"></i></button>
      </div>
      <div class="fw-bold">${CLP(it.price * it.qty)}</div>
    </div>`).join('');

  const subtotal = cart.reduce((acc, x) => acc + x.price * x.qty, 0);
  const descuento = Math.round(subtotal * DUOC);
  const total = subtotal - descuento;
  sSubtotal.textContent = CLP(subtotal);
  sDuoc.textContent = `- ${CLP(descuento)}`;
  sTotal.textContent = CLP(total);

  list.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => {
    const c = getCart(); const i = c.findIndex(x => x.code === b.dataset.inc);
    if (i >= 0) c[i].qty++; setCart(c); renderCartPage();
  });
  list.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => {
    const c = getCart(); const i = c.findIndex(x => x.code === b.dataset.dec);
    if (i >= 0) c[i].qty = Math.max(1, c[i].qty - 1); setCart(c); renderCartPage();
  });
  list.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const c = getCart().filter(x => x.code !== b.dataset.del); setCart(c); renderCartPage();
  });

  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) btnCheckout.onclick = () => {
    alert(`Pago de ${CLP(total)} procesado (demo).`);
    setCart([]); renderCartPage();
  };
};

// =========================
// Init
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'productos') renderCatalog(PRODUCTS);
  if (page === 'carrito') renderCartPage();
});
