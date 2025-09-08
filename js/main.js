/* =========================================================
   Level-Up Gamer - main.js
   - Carrito + Catálogo + Registro/Login + Sesión DUOC (20%)
   - Sin cambios de HTML (UI dinámica con JS)
   ========================================================= */

/* ===== Utilidades monetarias y constantes ===== */
const CLP = (n) =>
  Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const DUOC_DISCOUNT = 0.20;
const USERS_KEY = 'lug_users_v1';
const SESSION_KEY = 'lug_session_v1';

/* ===== Carrito (se respeta tu clave 'cart') ===== */
const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const setCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

/* ===== Usuarios / Sesión ===== */
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (arr) => localStorage.setItem(USERS_KEY, JSON.stringify(arr));

const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
const setSession = (sess) => localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

// DUOC válido: @duocuc.cl o @profesor.duoc.cl
const isDuocEmail = (email='') => /@(duocuc\.cl|profesor\.duoc\.cl)$/i.test(email);
const isDuocSession = () => {
  const s = getSession();
  return !!(s && s.email && isDuocEmail(s.email));
};

/* ===== Badge contador del carrito ===== */
const getCartCount = () => getCart().reduce((acc, it) => acc + (it.qty || 0), 0);

function updateCartBadge() {
  const cartBtn = document.querySelector('a[href*="carrito.html"], button[data-cart], a[data-cart]');
  if (!cartBtn) return;
  cartBtn.classList.add('position-relative');
  let badge = cartBtn.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info text-dark';
    badge.style.fontSize = '0.75rem';
    badge.style.minWidth = '1.25rem';
    badge.style.height = '1.25rem';
    badge.style.display = 'grid';
    badge.style.placeItems = 'center';
    cartBtn.appendChild(badge);
  }
  const count = getCartCount();
  badge.textContent = count;
  badge.style.visibility = count > 0 ? 'visible' : 'hidden';
}

/* ===== Productos (tu arreglo) ===== */
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
    // juegos
  { code: 'jP001', category: 'Juegos', name: 'pes liga chilena', price: 2500,
    desc: 'juego para playstation 2 del clasico pes.', img: 'img/pesliga.png' },
  { code: 'jP002', category: 'Juegos', name: 'Super Mario 64', price: 11500,
    desc: 'revive la aventura en 3D.', img: 'img/mario64.jpg' },
  { code: 'jP002b', category: 'Juegos', name: 'Mortal kombat', price: 55500,
    desc: 'disfruta la continuacion del aclamado juego de pelea.', img: 'img/mortalkombat.jpg' },
  { code: 'jP003', category: 'Juegos', name: 'The Legend of Zelda: Tears of the Kingdom', price: 45000,
    desc: 'Explora el reino de Hyrule.', img: 'img/zeldataers.jpg' },
  { code: 'jP004', category: 'Juegos', name: 'guitar hero cumbia', price: 3500,
    desc: 'toca las mejores cumbias en este juego creado por fans.', img: 'img/guitarcumbia.jpg' },
  { code: 'jP005', category: 'Juegos', name: 'Donkey kong country', price: 9990,
    desc: 'El juego de plataformas más icónico.', img: 'img/donkeykongcountry.png' },
  { code: 'jP006', category: 'Juegos', name: 'Donkey kong 2', price: 9990,
    desc: 'La secuela del clásico juego de plataformas pero ahora el dos .', img: 'img/donkeykong2.jpg' },

    // poleras personalizadas
  { code: 'PP001b', category: 'Poleras Personalizadas', name: "Polera Pibes chorros'", price: 14990,
    desc: 'Polera personalizada banda Pibes Chorros.', img: 'img/pibeschorros.png' },
  { code: 'PP001a', category: 'Poleras Personalizadas', name: "Polera Assasins Creed", price: 14990,
    desc: 'Polera personalizable de assasins creed.', img: 'img/POLERAAssassins_Creed.png' },
  { code: 'PP001b', category: 'Poleras Personalizadas', name: "Polera Los Mox'", price: 14990,
    desc: 'Polera personalizada banda Los MOX.', img: 'img/LOSMOX.png' },
  { code: 'PP001c', category: 'Poleras Personalizadas', name: "Polera Doom'", price: 14990,
    desc: 'Polera personalizada Juego Doom.', img: 'img/poleradoom.png' },
  { code: 'PP001d', category: 'Poleras Personalizadas', name: "Polera Sonic", price: 14990,
    desc: 'Polera personalizada de Sonic.', img: 'img/Polerasonic.png' },
  { code: 'PP001e', category: 'Poleras Personalizadas', name: "Polera FORNITE", price: 14990,
    desc: 'Polera personalizada de FORNITE.', img: 'img/polerafornite.jpg' },
  { code: 'PP001c', category: 'Poleras Personalizadas', name: "Polera Gamer 'Level-Up'", price: 14990,
    desc: 'Polera personalizable con tu gamer tag.', img: 'img/poleramujer.png' },
];

/* ===== Navbar reactiva (perfil / cerrar sesión) ===== */
function renderAuthUI() {
  const navRight = document.querySelector('.navbar .container .d-flex, .navbar .collapse .d-flex');
  if (!navRight) return;
  if (navRight.querySelector('[data-logout]')) return;

  const sess = getSession();

  if (sess && sess.email) {
    navRight.querySelectorAll('a[href*="login.html"], a[href*="registro.html"]').forEach(a => a.remove());

    const aPerfil = document.createElement('a');
    aPerfil.className = 'btn btn-outline-neon';
    aPerfil.href = 'perfil.html';
    aPerfil.innerHTML = '<i class="bi bi-person"></i> Mi perfil';

    const btnOut = document.createElement('button');
    btnOut.className = 'btn btn-outline-neon';
    btnOut.setAttribute('data-logout', '1');
    btnOut.innerHTML = '<i class="bi bi-box-arrow-right"></i> Cerrar sesión';
    btnOut.addEventListener('click', () => {
      clearSession();
      // localStorage.removeItem('cart'); // si quisieras que el carrito sea por usuario
      location.reload();
    });

    navRight.prepend(btnOut);
    navRight.prepend(aPerfil);
  }
}

/* ===== Catálogo ===== */
const addToCart = (code) => {
  const prod = PRODUCTS.find(p => p.code === code);
  if (!prod) return;
  const cart = getCart();
  const idx = cart.findIndex(i => i.code === code);
  if (idx >= 0) cart[idx].qty++;
  else cart.push({ code: prod.code, name: prod.name, price: prod.price, qty: 1 });
  setCart(cart);

  const btn = document.querySelector(`[data-add="${code}"]`);
  if (btn) {
    const old = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2-circle"></i> Agregado';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = old; btn.disabled = false; }, 900);
  }
  updateCartBadge();
};

const renderCatalog = (items) => {
  const wrap = document.getElementById('catalogo');
  if (!wrap) return;

  const duoc = isDuocSession();

  wrap.innerHTML = items.map(p => {
    const priceDuoc = Math.round(p.price * (1 - DUOC_DISCOUNT));
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
            ${duoc ? `
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-white-50 small">Duoc (20%):</span>
              <strong class="text-neon">${CLP(priceDuoc)}</strong>
            </div>` : `
            <div class="small text-secondary">Inicia sesión DUOC para 20% OFF</div>`}
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

function initCatalogFilters() {
  const q = document.getElementById('qProducts');
  const grid = document.getElementById('catalogo');
  if (!q || !grid) return;

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
    // activar visualmente la píldora seleccionada
    pills.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    (pills.querySelector(`[data-cat="${activeCat}"]`) || pills.querySelector('[data-cat="ALL"]'))?.classList.add('active');
    renderCatalog(filtered);
  };

  pills.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    activeCat = b.dataset.cat;
    apply();
  });

  q.addEventListener('input', apply);

  // --- NUEVO: filtro inicial por parámetro ?cat=... (ej: ?cat=Juegos) ---
  const paramCat = new URLSearchParams(location.search).get('cat');
  if (paramCat && cats.includes(paramCat)) {
    activeCat = paramCat;
  }

  apply(); // primera carga con filtro (o ALL)
}

/* ===== Carrito (descuento sólo si sesión DUOC) ===== */
const renderCartPage = () => {
  const list = document.getElementById('cartList');
  const sSubtotal = document.getElementById('cSubtotal');
  const sDuoc = document.getElementById('cDuoc');
  const sTotal = document.getElementById('cTotal');
  if (!list || !sSubtotal) return;

  let cart = getCart();
  const duoc = isDuocSession();

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
        <div class="small">Unitario: ${CLP(it.price)}${duoc ? ` · <span class="text-neon">DUOC: ${CLP(Math.round(it.price*(1-DUOC_DISCOUNT)))}</span>`:''}</div>
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
  const descuento = duoc ? Math.round(subtotal * DUOC_DISCOUNT) : 0;
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

  updateCartBadge();
};

/* ===== Login ===== */
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value.trim();
    const pass  = document.getElementById('password')?.value;

    if (!email || !pass || pass.length < 4) {
      form.classList.add('was-validated');
      return;
    }

    const users = getUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.pass !== pass) {
      alert('Correo o contraseña incorrectos.');
      return;
    }

    setSession({ email: u.email, name: u.name || '', ref: u.ref || '' });
    location.href = 'index.html';
  });
}

/* ===== Registro ===== */
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
function showAlert($where, type, html) {
  if (!$where) return;
  const old = $where.querySelector(`.alert.alert-${type}`);
  if (old) old.remove();
  const box = document.createElement('div');
  box.className = `alert alert-${type} mt-3`;
  box.innerHTML = html;
  $where.appendChild(box);
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
    const email = (document.getElementById('rEmail')?.value || '').trim();
    const pass  = document.getElementById('rPass')?.value || '';
    const pass2 = document.getElementById('rPass2')?.value || '';
    const prefs = document.getElementById('rPrefs')?.value || '';
    const ref   = document.getElementById('rRefCode')?.value || '';

    const alertsWrap = document.getElementById('formAlerts') || form;
    alertsWrap.querySelectorAll('.alert').forEach(a => a.remove());

    const errors = [];
    if (!name || !email || !pass) errors.push('Completa los campos obligatorios.');
    if (pass && (pass.length < 4 || pass.length > 10)) errors.push('La contraseña debe tener entre 4 y 10 caracteres.');
    if (pass2 && pass !== pass2) errors.push('Las contraseñas no coinciden.');

    if (errors.length) {
      showAlert(alertsWrap, 'danger', `<strong>Corrige lo siguiente:</strong><ul class="mb-0">${errors.map(x=>`<li>${x}</li>`).join('')}</ul>`);
      form.classList.add('was-validated');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      showAlert(alertsWrap, 'danger', 'Ese correo ya tiene cuenta.');
      return;
    }
    users.push({ name, email, pass, prefs, ref });
    saveUsers(users);

    showAlert(alertsWrap, 'success', '✅ Cuenta creada correctamente. Ahora puedes iniciar sesión.');
    form.reset();
    form.classList.remove('was-validated');
    if (strengthBox) strengthBox.style.display = 'none';
  });
}

/* ===== Perfil ===== */
function initProfilePage(){
  if (document.body.getAttribute('data-page') !== 'perfil') return;
  const s = getSession();
  const pfEmail = document.getElementById('pfEmail');
  const pfDuoc  = document.getElementById('pfDuoc');
  const pfPoints = document.getElementById('pfPoints');
  const pfLevel = document.getElementById('pfLevel');
  const pfRefCode = document.getElementById('pfRefCode');

  if (pfEmail) pfEmail.textContent = s?.email || '(sin sesión)';
  if (pfDuoc) pfDuoc.textContent = isDuocSession() ? 'Activo (20%)' : 'No aplica';
  if (pfPoints) pfPoints.textContent = '0';
  if (pfLevel) pfLevel.textContent = 'Bronce';
  if (pfRefCode) pfRefCode.textContent = s?.ref || '—';
}

/* ===== Router por página ===== */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'productos') {          // producto.html
    initCatalogFilters();              // buscador + filtros + render (soporta ?cat=Juegos)
  }
  if (page === 'carrito') {            // carrito.html
    renderCartPage();
  }
  if (page === 'login') {              // login.html
    initLoginPage();
  }
  if (page === 'registro') {           // registro.html
    initRegisterPage();
  }
  if (page === 'perfil') {             // perfil.html
    initProfilePage();
  }
  if (page === 'soporte')   { initSupportPage(); }   // soporte.html

  renderAuthUI();      // Ajusta navbar según sesión
  updateCartBadge();   // Pinta contador persistente
});

/* ===== Soporte ===== */
function initSupportPage() {
  if (document.body.getAttribute('data-page') !== 'soporte') return;

  const form = document.getElementById('supportForm');
  const notice = document.getElementById('supportNotice');
  const btnVolver = document.getElementById('btnVolver');

  // Botón Volver: vuelve al historial o al inicio si no hay historial
  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = 'index.html';
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Bootstrap validation simple
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // "Evento" de envío: mostramos un texto de confirmación estilo tienda (WePlay-like)
    if (notice) {
      notice.classList.remove('d-none');
      // opcional: auto-ocultar después de unos segundos
      setTimeout(() => notice.classList.add('d-none'), 4500);
    } else {
      alert('¡Gracias! Hemos recibido tu solicitud. Te contactaremos a la brevedad.');
    }

    // Aquí podrías enviar a tu backend (fetch) si luego conectas un servicio real.
    // Por ahora, solo reiniciamos el formulario para el demo:
    form.reset();
    form.classList.remove('was-validated');
  });
}