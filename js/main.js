// ========================= 
// Utilidades
// =========================
const CLP = (n) =>
  Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const DUOC = 0.20;

// LocalStorage (se mantiene tu clave existente)
const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const setCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

// ===== Contador de carrito (badge) =====
const getCartCount = () => getCart().reduce((acc, it) => acc + (it.qty || 0), 0);

function updateCartBadge() {
  // Busca el botón/enlace al carrito (navbar)
  const cartBtn = document.querySelector('a[href*="carrito.html"], button[data-cart], a[data-cart]');
  if (!cartBtn) return;

  cartBtn.classList.add('position-relative'); // para posicionar badge

  // Crea el badge si no existe
  let badge = cartBtn.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info text-dark';
    // tamaño/estilo compacto
    badge.style.fontSize = '0.75rem';
    badge.style.minWidth = '1.25rem';
    badge.style.height = '1.25rem';
    badge.style.display = 'grid';
    badge.style.placeItems = 'center';
    cartBtn.appendChild(badge);
  }

  const count = getCartCount();
  badge.textContent = count;
  badge.style.visibility = count > 0 ? 'visible' : 'hidden'; // oculta si 0
}

// =========================
// Datos de productos (se mantiene tu arreglo y rutas)
// =========================
const PRODUCTS = [
  { code: 'JM001', category: 'Juegos de Mesa', name: 'Catan', price: 29990,
    desc: 'Clásico de estrategia para 3-4 jugadores.', img: 'img/catan.jpg' },
  { code: 'JM002', category: 'Juegos de Mesa', name: 'Carcassonne', price: 24990,
    desc: 'Juego de losetas medieval, 2-5 jugadores.', img: 'img/carcassoneazul.jpg' },
  { code: 'AC001', category: 'Accesorios', name: 'Controlador Xbox Series X', price: 59990,
    desc: 'Botones mapeables y respuesta táctil mejorada.', img: 'img/controlxbox.jpg' },
  { code: 'AC002', category: 'Accesorios', name: 'HyperX Cloud II', price: 79990,
    desc: 'Sonido envolvente y gran comodidad.', img: 'img/audifonos.jpg' },
  { code: 'CO001', category: 'Consolas', name: 'PlayStation 5', price: 549990,
    desc: 'Consola de última generación de Sony.', img: 'img/play5.jpg' },
  { code: 'CG001', category: 'Computadores Gamers', name: 'PC Gamer ASUS ROG Strix', price: 1299990,
    desc: 'Máximo rendimiento para gamers exigentes.', img: 'img/pclenovo.jpg' },
  { code: 'SG001', category: 'Sillas Gamers', name: 'Secretlab Titan', price: 349990,
    desc: 'Silla ergonómica para largas sesiones.', img: 'img/sillagamer2.jpg' },
  { code: 'MS001', category: 'Mouse', name: 'Logitech G502 HERO', price: 49990,
    desc: 'Mouse de precisión con botones programables.', img: 'img/mousegamer.jpg' },
  { code: 'MP001', category: 'Mousepad', name: 'Razer Goliathus Chroma', price: 29990,
    desc: 'Mousepad con RGB personalizable.', img: 'img/padgamer.jpg' },
  { code: 'PP001', category: 'Poleras Personalizadas', name: "Polera Gamer 'Level-Up'", price: 14990,
    desc: 'Polera personalizable con tu gamer tag.', img: 'img/poleramujer.png' },
  // Si agregas "Polerones Gamers Personalizados", sólo añade objetos acá y aparecerán en los filtros.
];

// =========================
// Carrito: añadir (se mantiene tu lógica + feedback)
// =========================
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

  // actualizar badge
  updateCartBadge();
};

// =========================
// Render catálogo (cards) + descuento Duoc
// =========================
const renderCatalog = (items) => {
  const wrap = document.getElementById('catalogo');
  if (!wrap) return;

  wrap.innerHTML = items.map(p => {
    const priceDuoc = Math.round(p.price * (1 - DUOC));
    return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card bg-black text-white h-100 rounded-4 border-neon">
        <img src="${p.img}" class="card-img-top" alt="${p.name}" onerror="this.src='img/catalogo/placeholder.jpg'">
        <div class="card-body d-flex flex-column">
          <div class="small text-secondary">${p.category}</div>
          <h5 class="card-title">${p.name}</h5>
          <div class="small text-secondary">Código: ${p.code}</div>
          <p class="card-text flex-grow-1">${p.desc}</p>

          <div class="d-flex flex-column gap-1">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-white-50 small">Precio:</span>
              <strong>${CLP(p.price)}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-white-50 small">Duoc (20%):</span>
              <strong class="text-neon">${CLP(priceDuoc)}</strong>
            </div>
          </div>

          <button class="btn btn-neon mt-3" data-add="${p.code}">
            <i class="bi bi-bag-plus"></i> Agregar
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('[data-add]').forEach(btn =>
    btn.addEventListener('click', () => addToCart(btn.getAttribute('data-add')))
  );
};

// =========================
// Filtros/buscador de catálogo (no rompe tu HTML)
// - Usa #qProducts (ya en tu producto.html)
// - Crea dinámicamente las píldoras de categoría debajo del buscador
// =========================
function initCatalogFilters() {
  const q = document.getElementById('qProducts');
  const grid = document.getElementById('catalogo');
  if (!q || !grid) return;

  // Crear contenedor de píldoras
  const cats = [...new Set(PRODUCTS.map(p => p.category))].sort();
  const pills = document.createElement('div');
  pills.id = 'filtersWrap';
  pills.className = 'mb-4 d-flex flex-wrap gap-2';
  pills.innerHTML = [
    `<button type="button" class="btn btn-sm btn-outline-neon rounded-pill active" data-cat="ALL">Todas</button>`,
    ...cats.map(c => `<button type="button" class="btn btn-sm btn-outline-neon rounded-pill" data-cat="${c}">${c}</button>`)
  ].join('');
  q.parentElement.insertAdjacentElement('afterend', pills);

  let activeCat = 'ALL';

  const apply = () => {
    const term = (q.value || '').toLowerCase().trim();
    const filtered = PRODUCTS.filter(p => {
      const matchCat = activeCat === 'ALL' || p.category === activeCat;
      const haystack = `${p.code} ${p.category} ${p.name} ${p.desc}`.toLowerCase();
      const matchTerm = !term || haystack.includes(term);
      return matchCat && matchTerm;
    });
    renderCatalog(filtered);
  };

  pills.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    pills.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeCat = b.dataset.cat;
    apply();
  });

  q.addEventListener('input', apply);

  // Primera carga
  renderCatalog(PRODUCTS);
}

// =========================
// Carrito (se mantiene tu estructura + resumen con descuento)
// =========================
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
    updateCartBadge();
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

  // sincroniza contador al final del render
  updateCartBadge();
};

// =========================
// Init (router por página)
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'productos') {
    initCatalogFilters(); // crea píldoras, activa buscador y renderiza
  }
  if (page === 'carrito') {
    renderCartPage();
  }
  // pinta el badge al entrar a cualquier página
  updateCartBadge();
});

// =========================
// ALERTAS REUTILIZABLES (se mantiene)
// =========================
function showAlert($where, type, html) {
  if (!$where) return;
  const old = $where.querySelector(`.alert.alert-${type}`);
  if (old) old.remove();
  const box = document.createElement('div');
  box.className = `alert alert-${type} mt-3`;
  box.innerHTML = html;
  $where.appendChild(box);
}

// =========================
// LOGIN: validación (se mantiene)
// =========================
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email');
    const pass  = document.getElementById('password');
    const where = form;
    where.querySelectorAll('.alert').forEach(a => a.remove());

    if (!email.value.trim() || !pass.value.trim()) {
      showAlert(where, 'danger', '⚠️ Debes completar todos los campos para continuar.');
      form.classList.add('was-validated');
      return;
    }
    if (pass.value.length < 6) {
      showAlert(where, 'danger', 'La contraseña debe tener al menos 6 caracteres.');
      form.classList.add('was-validated');
      return;
    }

    showAlert(where, 'success', '✅ Bienvenido a Level-Up Gamer!');
    form.reset();
    form.classList.remove('was-validated');
  });
}

// =========================
// REGISTRO: validaciones (se mantiene)
// =========================
function ageFrom(dateStr){
  const d = new Date(dateStr);
  if (isNaN(d)) return 0;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}
function passwordStrength(p){
  let score = 0;
  if (p.length >= 6) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 2) return {label:"Débil", cls:"bg-danger text-white"};
  if (score === 3) return {label:"Media", cls:"bg-warning text-dark"};
  return {label:"Fuerte", cls:"bg-success text-white"};
}

function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const rPass = document.getElementById('rPass');
  const strengthBox = document.getElementById('passStrength');
  const strengthText = document.getElementById('passStrengthText');

  if (rPass && strengthBox && strengthText) {
    rPass.addEventListener('input', () => {
      const val = rPass.value;
      if (!val) { strengthBox.style.display = 'none'; return; }
      const s = passwordStrength(val);
      strengthBox.style.display = 'block';
      strengthBox.className = `small mt-2 p-2 rounded ${s.cls}`;
      strengthText.textContent = s.label;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = document.getElementById('rName')?.value.trim();
    const birth = document.getElementById('rBirth')?.value;
    const email = document.getElementById('rEmail')?.value.trim();
    const pass  = document.getElementById('rPass')?.value;
    const pass2 = document.getElementById('rPass2')?.value;

    const alertsWrap = document.getElementById('formAlerts') || form;
    alertsWrap.querySelectorAll('.alert').forEach(a => a.remove());

    const errors = [];
    if (!name || !birth || !email || !pass || !pass2) {
      errors.push('Debes completar todos los campos obligatorios.');
    }
    if (birth && ageFrom(birth) < 18) errors.push('Debes ser mayor de 18 años.');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (email && !emailOk) errors.push('El correo no tiene un formato válido.');
    if (pass && pass.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.');
    if (pass && pass2 && pass !== pass2) errors.push('Las contraseñas no coinciden.');

    if (errors.length) {
      showAlert(
        alertsWrap,
        'danger',
        `<strong>Corrige lo siguiente:</strong><ul class="mb-0">${errors.map(x=>`<li>${x}</li>`).join('')}</ul>`
      );
      form.classList.add('was-validated');
      return;
    }

    showAlert(alertsWrap, 'success', '✅ Cuenta creada correctamente (demo). Ahora puedes iniciar sesión.');
    form.reset();
    form.classList.remove('was-validated');
    if (strengthBox) strengthBox.style.display = 'none';
  });
}

// Mantén estos init si tu login/registro están en otras páginas
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();
});