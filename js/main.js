/* =========================================================
   Level-Up Gamer - main.js
   - Carrito + Catálogo + Registro/Login + Sesión DUOC (20%)
   - UI dinámica con JS
   ========================================================= */

/* ===== Utilidades monetarias y constantes ===== */
const CLP = (n) =>
  Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const DUOC_DISCOUNT = 0.20;
const USERS_KEY = 'lug_users_v1';
const SESSION_KEY = 'lug_session_v1';

/* ===== Carrito ===== */
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

/* ===== Productos (tomados desde el HTML) ===== */
const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

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

  // Filtro inicial por parámetro ?cat=...
  const paramCat = new URLSearchParams(location.search).get('cat');
  if (paramCat && cats.includes(paramCat)) {
    activeCat = paramCat;
  }

  apply();
}

/* ===== Carrito (DUOC aplica 20%) ===== */
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

  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = 'index.html';
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    if (notice) {
      notice.classList.remove('d-none');
      setTimeout(() => notice.classList.add('d-none'), 4500);
    } else {
      alert('¡Gracias! Hemos recibido tu solicitud. Te contactaremos a la brevedad.');
    }

    form.reset();
    form.classList.remove('was-validated');
  });
}