// Tir Coach — V1
// Séances de tir + photos de cibles renommées dans Documents/TirCoach

const DOSSIER = 'TirCoach';
const FICHIER_DONNEES = DOSSIER + '/tircoach-donnees.json';
const CLE = 'tircoach-seances';

const Cap = window.Capacitor;
const natif = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const P = natif ? Cap.Plugins : {};

let seances = charger();
let seanceActive = null;
let ecran = 'liste';

const $ = (id) => document.getElementById(id);

// ---------- Données ----------

function charger() {
  try { return JSON.parse(localStorage.getItem(CLE)) || []; }
  catch (e) { return []; }
}

async function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(seances)); } catch (e) {}
  // Copie de secours dans le dossier du téléphone
  if (natif) {
    try {
      await P.Filesystem.writeFile({
        path: FICHIER_DONNEES,
        data: JSON.stringify(seances, null, 2),
        directory: 'DOCUMENTS',
        encoding: 'utf8',
        recursive: true
      });
    } catch (e) { console.log('Sauvegarde JSON impossible', e); }
  }
}

// ---------- Outils ----------

function aujourdhui() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function nettoyer(txt) {
  return (txt || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]/g, '');
}

function nomPhoto(s, numero) {
  const n = String(numero).padStart(2, '0');
  return `${s.date}_${nettoyer(s.arme) || 'Arme'}_${s.distance}m_${nettoyer(s.cible)}_${n}.jpg`;
}

function dateFr(iso) {
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

function message(txt) {
  const m = $('message');
  m.textContent = txt;
  m.classList.remove('cache');
  clearTimeout(message.t);
  message.t = setTimeout(() => m.classList.add('cache'), 3500);
}

async function srcPhoto(nom) {
  const r = await P.Filesystem.getUri({ path: DOSSIER + '/' + nom, directory: 'DOCUMENTS' });
  return Cap.convertFileSrc(r.uri);
}

async function lirePhoto(nom) {
  const r = await P.Filesystem.readFile({ path: DOSSIER + '/' + nom, directory: 'DOCUMENTS' });
  return 'data:image/jpeg;base64,' + r.data;
}

async function afficherImage(img, nom) {
  if (!natif) return;
  img.onerror = async () => {
    img.onerror = null;
    try { img.src = await lirePhoto(nom); } catch (e) {}
  };
  try { img.src = await srcPhoto(nom); } catch (e) { img.onerror(); }
}

// ---------- Écrans ----------

function montrer(nom) {
  ecran = nom;
  ['Liste', 'Nouvelle', 'Seance'].forEach((e) =>
    $('ecran' + e).classList.toggle('cache', 'ecran' + e !== 'ecran' + nom.charAt(0).toUpperCase() + nom.slice(1)));
  $('btnRetour').classList.toggle('cache', nom === 'liste');
  $('titre').textContent =
    nom === 'liste' ? 'Tir Coach' : nom === 'nouvelle' ? 'Nouvelle séance' : 'Séance';
  window.scrollTo(0, 0);
}

function retour() {
  if (!$('visionneuse').classList.contains('cache')) {
    $('visionneuse').classList.add('cache');
    return true;
  }
  if (ecran !== 'liste') {
    afficherListe();
    return true;
  }
  return false;
}

function afficherListe() {
  const zone = $('listeSeances');
  zone.innerHTML = '';
  if (!seances.length) {
    zone.innerHTML = '<div class="vide">Aucune séance pour le moment.</div>';
  }
  [...seances].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach((s) => {
    const div = document.createElement('div');
    div.className = 'carte seance';
    div.innerHTML = `
      <div>
        <div class="haut">${dateFr(s.date)} — ${s.arme}</div>
        <div class="bas">${s.distance} m · ${s.cible}</div>
      </div>
      <div class="nb">${s.photos.length} &#128247;</div>`;
    div.onclick = () => ouvrirSeance(s.id);
    zone.appendChild(div);
  });
  montrer('liste');
}

function afficherNouvelle() {
  $('champDate').value = aujourdhui();
  const armes = [...new Set(seances.map((s) => s.arme))];
  $('listeArmes').innerHTML = armes.map((a) => `<option value="${a}">`).join('');
  if (seances.length) {
    const der = seances[seances.length - 1];
    $('champArme').value = der.arme;
    $('champDistance').value = der.distance;
    $('champCible').value = der.cible;
  }
  montrer('nouvelle');
}

async function creerSeance() {
  const s = {
    id: Date.now(),
    date: $('champDate').value || aujourdhui(),
    arme: $('champArme').value.trim(),
    distance: parseInt($('champDistance').value, 10) || 0,
    cible: $('champCible').value,
    photos: []
  };
  if (!s.arme) { message("Indique l'arme."); return; }
  seances.push(s);
  await sauver();
  ouvrirSeance(s.id);
}

function ouvrirSeance(id) {
  seanceActive = seances.find((s) => s.id === id);
  if (!seanceActive) return afficherListe();
  const s = seanceActive;
  $('resumeSeance').innerHTML =
    `<b>${dateFr(s.date)}</b><br>${s.arme} · ${s.distance} m · ${s.cible}`;
  const grille = $('grillePhotos');
  grille.innerHTML = '';
  s.photos.forEach((nom) => {
    const v = document.createElement('div');
    v.className = 'vignette';
    const img = document.createElement('img');
    const p = document.createElement('p');
    p.textContent = nom;
    v.append(img, p);
    v.onclick = () => voirPhoto(nom);
    grille.appendChild(v);
    afficherImage(img, nom);
  });
  montrer('seance');
}

function voirPhoto(nom) {
  $('nomGrand').textContent = nom;
  $('imageGrande').removeAttribute('src');
  afficherImage($('imageGrande'), nom);
  $('visionneuse').classList.remove('cache');
}

async function prendrePhoto() {
  if (!natif) { message("La photo marche seulement dans l'appli Android."); return; }
  const s = seanceActive;
  try {
    const photo = await P.Camera.takePhoto({ quality: 85, correctOrientation: true });
    if (!photo || !photo.uri) return;

    // Numéro suivant pour cette séance
    let numero = s.photos.length + 1;
    let nom = nomPhoto(s, numero);
    while (s.photos.includes(nom)) { numero++; nom = nomPhoto(s, numero); }

    try {
      await P.Filesystem.mkdir({ path: DOSSIER, directory: 'DOCUMENTS', recursive: true });
    } catch (e) { /* le dossier existe déjà */ }

    await P.Filesystem.copy({ from: photo.uri, to: DOSSIER + '/' + nom, toDirectory: 'DOCUMENTS' });

    s.photos.push(nom);
    await sauver();
    ouvrirSeance(s.id);
    message('Photo enregistrée : ' + nom);
  } catch (e) {
    const txt = String((e && e.message) || e);
    if (!/cancel/i.test(txt)) message('Erreur photo : ' + txt);
  }
}

async function supprimerSeance() {
  if (!seanceActive) return;
  const ok = confirm('Retirer cette séance de la liste ?\nLes photos restent dans Documents/TirCoach.');
  if (!ok) return;
  seances = seances.filter((s) => s.id !== seanceActive.id);
  await sauver();
  afficherListe();
}

// ---------- Démarrage ----------

$('btnNouvelle').onclick = afficherNouvelle;
$('btnCreer').onclick = creerSeance;
$('btnPhoto').onclick = prendrePhoto;
$('btnSupprimer').onclick = supprimerSeance;
$('btnRetour').onclick = retour;
$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');

if (natif && P.App) {
  P.App.addListener('backButton', () => {
    if (!retour()) P.App.exitApp();
  });
}

afficherListe();
