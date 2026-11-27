// Tir Coach — V2
// Accueil + menu + carnet de tir (lieu, munitions, coups, scores par cible)

const DOSSIER = 'TirCoach';
const FICHIER_DONNEES = DOSSIER + '/tircoach-donnees.json';
const CLE = 'tircoach-seances';

const Cap = window.Capacitor;
const natif = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const P = natif ? Cap.Plugins : {};

const $ = (id) => document.getElementById(id);

let seances = migrer(charger());
let seanceActive = null;   // séance ouverte
let enModification = false; // formulaire en mode "modifier"
let ecran = 'accueil';

// ---------- Données ----------

function charger() {
  try { return JSON.parse(localStorage.getItem(CLE)) || []; }
  catch (e) { return []; }
}

// Met les anciennes séances (V1) au nouveau format
function migrer(liste) {
  return liste.map((s) => ({
    id: s.id,
    date: s.date,
    lieu: s.lieu || '',
    arme: s.arme || '',
    munition: s.munition || '',
    coups: s.coups || '',
    distance: s.distance || '',
    cible: s.cible || 'C50',
    notes: s.notes || '',
    photos: (s.photos || []).map((p) => (typeof p === 'string' ? { nom: p, score: '' } : p))
  }));
}

async function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(seances)); } catch (e) {}
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

function html(txt) {
  return String(txt == null ? '' : txt)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function nomPhoto(s, numero) {
  const n = String(numero).padStart(2, '0');
  return `${s.date}_${nettoyer(s.arme) || 'Arme'}_${s.distance || 0}m_${nettoyer(s.cible)}_${n}.jpg`;
}

function dateFr(iso) {
  const [a, m, j] = (iso || '').split('-');
  return `${j}/${m}/${a}`;
}

function scoreTotal(s) {
  const notes = s.photos.map((p) => parseFloat(p.score)).filter((n) => !isNaN(n));
  return { total: notes.reduce((a, b) => a + b, 0), nb: notes.length };
}

function message(txt) {
  const m = $('message');
  m.textContent = txt;
  m.classList.remove('cache');
  clearTimeout(message.t);
  message.t = setTimeout(() => m.classList.add('cache'), 3500);
}

function remplirListe(idListe, valeurs) {
  const uniques = [...new Set(valeurs.filter(Boolean))];
  $(idListe).innerHTML = uniques.map((v) => `<option value="${html(v)}">`).join('');
}

async function afficherImage(img, nom) {
  if (!natif) return;
  const chemin = DOSSIER + '/' + nom;
  img.onerror = async () => {
    img.onerror = null;
    try {
      const r = await P.Filesystem.readFile({ path: chemin, directory: 'DOCUMENTS' });
      img.src = 'data:image/jpeg;base64,' + r.data;
    } catch (e) {}
  };
  try {
    const r = await P.Filesystem.getUri({ path: chemin, directory: 'DOCUMENTS' });
    img.src = Cap.convertFileSrc(r.uri);
  } catch (e) { img.onerror(); }
}

// ---------- Navigation ----------

const TITRES = {
  menu: 'Tir Coach',
  carnet: 'Carnet de tir',
  form: 'Séance',
  seance: 'Séance'
};

function montrer(nom) {
  ecran = nom;
  $('ecranAccueil').classList.toggle('cache', nom !== 'accueil');
  $('entete').classList.toggle('cache', nom === 'accueil');
  ['Menu', 'Carnet', 'Form', 'Seance'].forEach((e) =>
    $('ecran' + e).classList.toggle('cache', e.toLowerCase() !== nom));
  if (nom === 'form') $('titre').textContent = enModification ? 'Modifier la séance' : 'Nouvelle séance';
  else $('titre').textContent = TITRES[nom] || 'Tir Coach';
  window.scrollTo(0, 0);
}

function retour() {
  if (!$('visionneuse').classList.contains('cache')) {
    $('visionneuse').classList.add('cache');
    return true;
  }
  switch (ecran) {
    case 'menu': montrer('accueil'); return true;
    case 'carnet': montrer('menu'); return true;
    case 'form':
      if (enModification && seanceActive) ouvrirSeance(seanceActive.id);
      else afficherCarnet();
      return true;
    case 'seance': afficherCarnet(); return true;
    default: return false;
  }
}

// ---------- Carnet ----------

function afficherCarnet() {
  const zone = $('listeSeances');
  zone.innerHTML = '';
  if (!seances.length) {
    zone.innerHTML = '<div class="vide">Aucune séance pour le moment.</div>';
  }
  [...seances].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach((s) => {
    const sc = scoreTotal(s);
    const infos = [s.lieu, s.distance ? s.distance + ' m' : '', s.cible, s.coups ? s.coups + ' coups' : '']
      .filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'carte seance';
    div.innerHTML = `
      <div>
        <div class="haut">${dateFr(s.date)} — ${html(s.arme)}</div>
        <div class="bas">${html(infos)}</div>
      </div>
      <div class="droite">
        ${sc.nb ? `<div class="score">${sc.total}</div>` : ''}
        <div class="nb">${s.photos.length} &#128247;</div>
      </div>`;
    div.onclick = () => ouvrirSeance(s.id);
    zone.appendChild(div);
  });
  montrer('carnet');
}

function ouvrirFormulaire(modifier) {
  enModification = modifier;
  remplirListe('listeLieux', ['TAA Eauze', ...seances.map((s) => s.lieu)]);
  remplirListe('listeArmes', seances.map((s) => s.arme));
  remplirListe('listeMunitions', seances.map((s) => s.munition));

  let s;
  if (modifier && seanceActive) {
    s = seanceActive;
  } else {
    // Nouvelle séance : on reprend la dernière comme modèle
    const der = seances[seances.length - 1] || {};
    s = {
      date: aujourdhui(),
      lieu: der.lieu || 'TAA Eauze',
      arme: der.arme || '',
      munition: der.munition || '',
      coups: '',
      distance: der.distance || 25,
      cible: der.cible || 'C50',
      notes: ''
    };
  }
  $('champDate').value = s.date;
  $('champLieu').value = s.lieu;
  $('champArme').value = s.arme;
  $('champMunition').value = s.munition;
  $('champCoups').value = s.coups;
  $('champDistance').value = s.distance;
  $('champCible').value = s.cible;
  $('champNotes').value = s.notes;
  montrer('form');
}

async function enregistrer() {
  const valeurs = {
    date: $('champDate').value || aujourdhui(),
    lieu: $('champLieu').value.trim(),
    arme: $('champArme').value.trim(),
    munition: $('champMunition').value.trim(),
    coups: $('champCoups').value,
    distance: $('champDistance').value,
    cible: $('champCible').value,
    notes: $('champNotes').value.trim()
  };
  if (!valeurs.arme) { message("Indique l'arme."); return; }

  if (enModification && seanceActive) {
    Object.assign(seanceActive, valeurs);
  } else {
    seanceActive = Object.assign({ id: Date.now(), photos: [] }, valeurs);
    seances.push(seanceActive);
  }
  await sauver();
  ouvrirSeance(seanceActive.id);
}

function ouvrirSeance(id) {
  seanceActive = seances.find((s) => s.id === id);
  if (!seanceActive) return afficherCarnet();
  enModification = false;
  afficherResume();

  const s = seanceActive;
  const grille = $('grillePhotos');
  grille.innerHTML = '';
  s.photos.forEach((photo) => {
    const v = document.createElement('div');
    v.className = 'vignette';
    v.innerHTML = `
      <img alt="">
      <p class="nom">${html(photo.nom)}</p>
      <div class="zoneScore"><span>Score</span>
        <input type="number" inputmode="decimal" value="${html(photo.score)}" placeholder="—">
      </div>`;
    const img = v.querySelector('img');
    img.onclick = () => voirPhoto(photo.nom);
    const champ = v.querySelector('input');
    champ.onchange = async () => {
      photo.score = champ.value;
      await sauver();
      afficherResume();
    };
    grille.appendChild(v);
    afficherImage(img, photo.nom);
  });
  montrer('seance');
}

function afficherResume() {
  const s = seanceActive;
  const sc = scoreTotal(s);
  const lignes = [
    s.lieu,
    [s.distance ? s.distance + ' m' : '', s.cible].filter(Boolean).join(' · '),
    s.munition,
    s.coups ? s.coups + ' coups' : ''
  ].filter(Boolean);
  $('resumeSeance').innerHTML = `
    <div class="haut">${dateFr(s.date)} — ${html(s.arme)}</div>
    ${lignes.map((l) => `<div class="bas">${html(l)}</div>`).join('')}
    ${s.notes ? `<div class="notes">${html(s.notes)}</div>` : ''}
    ${sc.nb ? `<div class="total">Score total : ${sc.total} (${sc.nb} cible${sc.nb > 1 ? 's' : ''})</div>` : ''}`;
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
    const photo = await P.Camera.takePhoto({
      quality: 80,
      targetWidth: 2000,
      targetHeight: 2000,
      correctOrientation: true
    });
    if (!photo || !photo.uri) return;

    const noms = s.photos.map((p) => p.nom);
    let numero = s.photos.length + 1;
    let nom = nomPhoto(s, numero);
    while (noms.includes(nom)) { numero++; nom = nomPhoto(s, numero); }

    try {
      await P.Filesystem.mkdir({ path: DOSSIER, directory: 'DOCUMENTS', recursive: true });
    } catch (e) { /* le dossier existe déjà */ }

    await P.Filesystem.copy({ from: photo.uri, to: DOSSIER + '/' + nom, toDirectory: 'DOCUMENTS' });

    s.photos.push({ nom, score: '' });
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
  const ok = confirm('Supprimer cette séance du carnet ?\nLes photos restent dans Documents/TirCoach.');
  if (!ok) return;
  seances = seances.filter((s) => s.id !== seanceActive.id);
  seanceActive = null;
  await sauver();
  afficherCarnet();
}

// ---------- Démarrage ----------

$('btnEntrer').onclick = () => montrer('menu');
$('btnRetour').onclick = retour;
document.querySelectorAll('.tuile').forEach((t) => {
  t.onclick = () => {
    if (t.dataset.va === 'carnet') afficherCarnet();
    else message('Cette partie arrive bientôt.');
  };
});
$('btnNouvelle').onclick = () => ouvrirFormulaire(false);
$('btnEnregistrer').onclick = enregistrer;
$('btnModifier').onclick = () => ouvrirFormulaire(true);
$('btnPhoto').onclick = prendrePhoto;
$('btnSupprimer').onclick = supprimerSeance;
$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');

if (natif && P.App) {
  P.App.addListener('backButton', () => {
    if (!retour()) P.App.exitApp();
  });
}

montrer('accueil');
