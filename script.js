// ── DONNÉES ──────────────────────────────────────────────────────────────────
let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
let editId = null, deleteId = null;

// ── DÉMARRAGE ─────────────────────────────────────────────────────────────────
document.getElementById('date').min = new Date().toISOString().split('T')[0];
document.getElementById('menuGrid').addEventListener('change', majMenu);
render();

// ── MENU ──────────────────────────────────────────────────────────────────────
function getMenu() {
  return [...document.querySelectorAll('#menuGrid input:checked')].map(c => c.value);
}
function setMenu(list = []) {
  document.querySelectorAll('#menuGrid input').forEach(c => c.checked = list.includes(c.value));
  majMenu();
}
function majMenu() {
  const sel = getMenu();
  document.getElementById('menuSummary').textContent =
    sel.length ? sel.join(' · ') : 'Aucun produit sélectionné';
}

// ── AJOUTER / MODIFIER ────────────────────────────────────────────────────────
function saveReservation() {
  const champs = ['nom', 'email', 'date', 'heure', 'personnes'];
  const data = {};

  for (const c of champs) {
    const val = document.getElementById(c).value.trim();
    if (!val) return notify('Remplissez tous les champs !', 'warning');
    data[c] = val;
  }
  data.special = getMenu();

  if (editId) {
    const i = reservations.findIndex(r => r.id === editId);
    reservations[i] = { ...reservations[i], ...data };
    notify('Mise à jour ✏️', 'info');
  } else {
    reservations.push({ id: Date.now().toString(36), ...data });
    notify('Réservation ajoutée ✅', 'success');
  }

  save(); render(); resetForm();
}

// ── MODIFIER (charger dans le formulaire) ─────────────────────────────────────
function editReservation(id) {
  const r = reservations.find(r => r.id === id);
  editId = id;
  ['nom','email','date','heure','personnes'].forEach(c => document.getElementById(c).value = r[c]);
  setMenu(r.special || []);
  document.getElementById('formTitle').textContent  = 'Modifier';
  document.getElementById('submitLabel').textContent = 'Mettre à jour';
  document.getElementById('cancelBtn').classList.remove('d-none');
}

// ── SUPPRIMER ─────────────────────────────────────────────────────────────────
function askDelete(id) {
  deleteId = id;
  new bootstrap.Modal(document.getElementById('delModal')).show();
}
function confirmDelete() {
  reservations = reservations.filter(r => r.id !== deleteId);
  save(); render();
  notify('Supprimé 🗑️', 'danger');
  bootstrap.Modal.getInstance(document.getElementById('delModal')).hide();
}

// ── RESET FORMULAIRE ──────────────────────────────────────────────────────────
function cancelEdit() { resetForm(); }
function resetForm() {
  ['nom','email','date','heure','personnes'].forEach(c => document.getElementById(c).value = '');
  setMenu([]);
  document.getElementById('formTitle').textContent  = 'Nouvelle Réservation';
  document.getElementById('submitLabel').textContent = 'Réserver';
  document.getElementById('cancelBtn').classList.add('d-none');
  editId = null;
}

// ── AFFICHAGE LISTE ───────────────────────────────────────────────────────────
function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const list = reservations.filter(r =>
    r.nom.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.date.includes(q)
  );

  document.getElementById('countBadge').textContent = list.length;
  document.getElementById('tbody').innerHTML = list.length === 0
    ? `<tr><td colspan="4" class="text-center text-muted py-4">
        <i class="bi bi-calendar-x fs-3 d-block mb-2"></i>Aucune réservation</td></tr>`
    : list.map(r => `
      <tr>
        <td><strong>${esc(r.nom)}</strong><div class="text-muted small">${esc(r.email)}</div></td>
        <td>
          <span class="badge bg-primary">${fmtDate(r.date)}</span>
          <span class="badge bg-success ms-1">${r.heure}</span>
        </td>
        <td><span class="badge bg-info">${r.personnes}</span></td>
        <td>
          <button class="btn btn-edit btn-sm me-1"   onclick="editReservation('${r.id}')"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn btn-delete btn-sm"       onclick="askDelete('${r.id}')"><i class="bi bi-trash-fill"></i></button>
        </td>
      </tr>`).join('');
}

// ── UTILITAIRES ───────────────────────────────────────────────────────────────
function save()        { localStorage.setItem('reservations', JSON.stringify(reservations)); }
function fmtDate(d)    { return new Date(d + 'T00:00').toLocaleDateString('fr-FR'); }
function esc(t)        { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function notify(msg, type) {
  const t = document.getElementById('toast');
  t.className = `toast align-items-center text-bg-${type} border-0`;
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(t, { delay: 2500 }).show();
}