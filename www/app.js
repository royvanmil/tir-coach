// Tir Coach — V3
// Carnet de tir, râtelier (photos, modifs, entretien), stock de munitions, démarches EDEN / SIA

const DOSSIER = 'TirCoach';
const DOSSIER_RATELIER = 'Ratelier';
const FICHIER_DONNEES = DOSSIER + '/tircoach-donnees.json';
const CLES = { seances: 'tircoach-seances', armes: 'tircoach-armes', munitions: 'tircoach-munitions' };

const Cap = window.Capacitor;
const natif = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const P = natif ? Cap.Plugins : {};

const $ = (id) => document.getElementById(id);

let seances = migrerSeances(charger(CLES.seances));
let armes = charger(CLES.armes);
let munitions = charger(CLES.munitions);

let seanceActive = null;
let armeActive = null;
let enModification = false;      // formulaire séance en mode "modifier"
let armeEnModification = false;  // formulaire arme en mode "modifier"
let ecran = 'accueil';

// =====================================================================
// Données
// =====================================================================

function charger(cle) {
  try { return JSON.parse(localStorage.getItem(cle)) || []; }
  catch (e) { return []; }
}

// Met les anciennes séances (V1) au nouveau format
function migrerSeances(liste) {
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
  try {
    localStorage.setItem(CLES.seances, JSON.stringify(seances));
    localStorage.setItem(CLES.armes, JSON.stringify(armes));
    localStorage.setItem(CLES.munitions, JSON.stringify(munitions));
  } catch (e) {}
  if (natif) {
    try {
      await P.Filesystem.writeFile({
        path: FICHIER_DONNEES,
        data: JSON.stringify({ version: 3, seances, armes, munitions }, null, 2),
        directory: 'DOCUMENTS',
        encoding: 'utf8',
        recursive: true
      });
    } catch (e) { console.log('Sauvegarde JSON impossible', e); }
  }
}

// =====================================================================
// Outils
// =====================================================================

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

function dateFr(iso) {
  if (!iso) return '';
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

function memeTexte(a, b) {
  return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
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

// Affiche une photo enregistrée (chemin relatif au dossier TirCoach)
async function afficherImage(img, nom) {
  if (!natif || !nom) return;
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

// Prend une photo et l'enregistre sous "sousDossier/nom" dans Documents/TirCoach
async function prendreEtEnregistrer(cheminRelatif) {
  const photo = await P.Camera.takePhoto({
    quality: 80,
    targetWidth: 2000,
    targetHeight: 2000,
    correctOrientation: true
  });
  if (!photo || !photo.uri) return false;
  const dossier = (DOSSIER + '/' + cheminRelatif).split('/').slice(0, -1).join('/');
  try {
    await P.Filesystem.mkdir({ path: dossier, directory: 'DOCUMENTS', recursive: true });
  } catch (e) { /* le dossier existe déjà */ }
  await P.Filesystem.copy({ from: photo.uri, to: DOSSIER + '/' + cheminRelatif, toDirectory: 'DOCUMENTS' });
  return true;
}

function erreurPhoto(e) {
  const txt = String((e && e.message) || e);
  if (!/cancel/i.test(txt)) message('Erreur photo : ' + txt);
}

function voirPhoto(nom) {
  $('nomGrand').textContent = nom.split('/').pop();
  $('imageGrande').removeAttribute('src');
  afficherImage($('imageGrande'), nom);
  $('visionneuse').classList.remove('cache');
}

// =====================================================================
// Navigation
// =====================================================================

const ECRANS = ['Menu', 'Carnet', 'Form', 'Seance', 'Ratelier', 'ArmeForm', 'Arme', 'Munitions', 'Demarches'];
const TITRES = {
  menu: 'Tir Coach',
  carnet: 'Carnet de tir',
  seance: 'Séance',
  ratelier: 'Mon râtelier',
  arme: 'Arme',
  munitions: 'Munitions',
  demarches: 'Démarches'
};

function montrer(nom) {
  ecran = nom;
  $('ecranAccueil').classList.toggle('cache', nom !== 'accueil');
  $('entete').classList.toggle('cache', nom === 'accueil');
  ECRANS.forEach((e) => $('ecran' + e).classList.toggle('cache', e.toLowerCase() !== nom));
  if (nom === 'form') $('titre').textContent = enModification ? 'Modifier la séance' : 'Nouvelle séance';
  else if (nom === 'armeform') $('titre').textContent = armeEnModification ? "Modifier l'arme" : 'Nouvelle arme';
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
    case 'carnet':
    case 'ratelier':
    case 'munitions':
    case 'demarches': montrer('menu'); return true;
    case 'form':
      if (enModification && seanceActive) ouvrirSeance(seanceActive.id);
      else afficherCarnet();
      return true;
    case 'seance': afficherCarnet(); return true;
    case 'armeform':
      if (armeEnModification && armeActive) ouvrirArme(armeActive.id);
      else afficherRatelier();
      return true;
    case 'arme': afficherRatelier(); return true;
    default: return false;
  }
}

// =====================================================================
// Carnet de tir
// =====================================================================

function scoreTotal(s) {
  const notes = s.photos.map((p) => parseFloat(p.score)).filter((n) => !isNaN(n));
  return { total: notes.reduce((a, b) => a + b, 0), nb: notes.length };
}

function afficherCarnet() {
  const zone = $('listeSeances');
  zone.innerHTML = '';
  if (!seances.length) zone.innerHTML = '<div class="vide">Aucune séance pour le moment.</div>';
  [...seances].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach((s) => {
    const sc = scoreTotal(s);
    const infos = [s.lieu, s.distance ? s.distance + ' m' : '', s.cible, s.coups ? s.coups + ' coups' : '']
      .filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <div class="milieu">
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
  remplirListe('listeArmes', [...armes.map((a) => a.nom), ...seances.map((s) => s.arme)]);
  remplirListe('listeMunitions', [...munitions.map((m) => m.nom), ...seances.map((s) => s.munition)]);

  let s;
  if (modifier && seanceActive) {
    s = seanceActive;
  } else {
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

async function enregistrerSeance() {
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

  const nouvelle = !(enModification && seanceActive);
  if (nouvelle) {
    seanceActive = Object.assign({ id: Date.now(), photos: [] }, valeurs);
    seances.push(seanceActive);
  } else {
    Object.assign(seanceActive, valeurs);
  }

  // Nouvelle séance : proposer de retirer les cartouches du stock
  const coups = parseInt(valeurs.coups, 10);
  const stock = munitions.find((m) => memeTexte(m.nom, valeurs.munition));
  if (nouvelle && coups > 0 && stock) {
    if (confirm(`Retirer ${coups} cartouches de « ${stock.nom} » du stock ?\nStock actuel : ${stock.quantite}`)) {
      stock.quantite = Math.max(0, (parseInt(stock.quantite, 10) || 0) - coups);
    }
  }

  await sauver();
  ouvrirSeance(seanceActive.id);
}

function ouvrirSeance(id) {
  seanceActive = seances.find((s) => s.id === id);
  if (!seanceActive) return afficherCarnet();
  enModification = false;
  afficherResumeSeance();

  const grille = $('grillePhotos');
  grille.innerHTML = '';
  seanceActive.photos.forEach((photo) => {
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
      afficherResumeSeance();
    };
    grille.appendChild(v);
    afficherImage(img, photo.nom);
  });
  montrer('seance');
}

function afficherResumeSeance() {
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

function nomPhotoSeance(s, numero) {
  const n = String(numero).padStart(2, '0');
  return `${s.date}_${nettoyer(s.arme) || 'Arme'}_${s.distance || 0}m_${nettoyer(s.cible)}_${n}.jpg`;
}

async function photoSeance() {
  if (!natif) { message("La photo marche seulement dans l'appli Android."); return; }
  const s = seanceActive;
  try {
    const noms = s.photos.map((p) => p.nom);
    let numero = s.photos.length + 1;
    let nom = nomPhotoSeance(s, numero);
    while (noms.includes(nom)) { numero++; nom = nomPhotoSeance(s, numero); }
    if (!(await prendreEtEnregistrer(nom))) return;
    s.photos.push({ nom, score: '' });
    await sauver();
    ouvrirSeance(s.id);
    message('Photo enregistrée : ' + nom);
  } catch (e) { erreurPhoto(e); }
}

async function supprimerSeance() {
  if (!seanceActive) return;
  if (!confirm('Supprimer cette séance du carnet ?\nLes photos restent dans Documents/TirCoach.')) return;
  seances = seances.filter((s) => s.id !== seanceActive.id);
  seanceActive = null;
  await sauver();
  afficherCarnet();
}

// =====================================================================
// Râtelier
// =====================================================================

function afficherRatelier() {
  const zone = $('listeArmesRatelier');
  zone.innerHTML = '';
  if (!armes.length) zone.innerHTML = '<div class="vide">Ton râtelier est vide.</div>';
  [...armes].sort((a, b) => a.nom.localeCompare(b.nom)).forEach((a) => {
    const infos = [a.categorie ? 'Cat. ' + a.categorie : '', a.calibre,
      a.chargeurs ? a.chargeurs + ' chargeur' + (a.chargeurs > 1 ? 's' : '') : ''].filter(Boolean).join(' · ');
    const nbSeances = seances.filter((s) => memeTexte(s.arme, a.nom)).length;
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <img class="miniature" alt="">
      <div class="milieu">
        <div class="haut">${html(a.nom)}</div>
        <div class="bas">${html(infos)}</div>
      </div>
      <div class="droite"><div class="nb">${nbSeances} séance${nbSeances > 1 ? 's' : ''}</div></div>`;
    const img = div.querySelector('img');
    if (a.photos.length) afficherImage(img, a.photos[0]); else img.style.visibility = 'hidden';
    div.onclick = () => ouvrirArme(a.id);
    zone.appendChild(div);
  });
  montrer('ratelier');
}

function ouvrirFormulaireArme(modifier) {
  armeEnModification = modifier;
  const a = modifier && armeActive ? armeActive : { nom: '', categorie: '', calibre: '', chargeurs: '', notes: '' };
  $('armeNom').value = a.nom;
  $('armeCategorie').value = a.categorie;
  $('armeCalibre').value = a.calibre;
  $('armeChargeurs').value = a.chargeurs;
  $('armeNotes').value = a.notes;
  montrer('armeform');
}

async function enregistrerArme() {
  const valeurs = {
    nom: $('armeNom').value.trim(),
    categorie: $('armeCategorie').value,
    calibre: $('armeCalibre').value.trim(),
    chargeurs: $('armeChargeurs').value,
    notes: $('armeNotes').value.trim()
  };
  if (!valeurs.nom) { message("Indique le nom de l'arme."); return; }

  if (armeEnModification && armeActive) {
    // Si le nom change, on met à jour les séances du carnet
    const ancien = armeActive.nom;
    if (ancien !== valeurs.nom) seances.forEach((s) => { if (memeTexte(s.arme, ancien)) s.arme = valeurs.nom; });
    Object.assign(armeActive, valeurs);
  } else {
    armeActive = Object.assign({ id: Date.now(), photos: [], modifs: [], entretiens: [] }, valeurs);
    armes.push(armeActive);
  }
  await sauver();
  ouvrirArme(armeActive.id);
}

function ouvrirArme(id) {
  armeActive = armes.find((a) => a.id === id);
  if (!armeActive) return afficherRatelier();
  armeEnModification = false;
  const a = armeActive;

  const seancesArme = seances.filter((s) => memeTexte(s.arme, a.nom));
  const coupsTotal = seancesArme.reduce((t, s) => t + (parseInt(s.coups, 10) || 0), 0);
  const lignes = [
    a.categorie ? 'Catégorie ' + a.categorie : '',
    a.calibre ? 'Calibre ' + a.calibre : '',
    a.chargeurs ? a.chargeurs + ' chargeur' + (a.chargeurs > 1 ? 's' : '') : '',
    `${seancesArme.length} séance${seancesArme.length > 1 ? 's' : ''}` + (coupsTotal ? ` · ${coupsTotal} coups tirés` : '')
  ].filter(Boolean);
  $('resumeArme').innerHTML = `
    <div class="haut">${html(a.nom)}</div>
    ${lignes.map((l) => `<div class="bas">${html(l)}</div>`).join('')}
    ${a.notes ? `<div class="notes">${html(a.notes)}</div>` : ''}`;

  const grille = $('grillePhotosArme');
  grille.innerHTML = '';
  a.photos.forEach((nom) => {
    const v = document.createElement('div');
    v.className = 'vignette';
    v.innerHTML = '<img alt="">';
    const img = v.querySelector('img');
    img.onclick = () => voirPhoto(nom);
    grille.appendChild(v);
    afficherImage(img, nom);
  });

  afficherJournal('listeModifs', a.modifs, 'Aucune modification notée.');
  afficherJournal('listeEntretiens', a.entretiens, 'Aucun entretien noté.');
  $('modifDate').value = aujourdhui();
  $('entretienDate').value = aujourdhui();
  $('modifTexte').value = '';
  $('entretienTexte').value = '';
  montrer('arme');
}

function afficherJournal(idZone, liste, texteVide) {
  const zone = $(idZone);
  zone.innerHTML = '';
  if (!liste.length) { zone.innerHTML = `<p class="aide">${texteVide}</p>`; return; }
  [...liste].sort((x, y) => y.date.localeCompare(x.date)).forEach((e) => {
    const div = document.createElement('div');
    div.className = 'entree';
    div.innerHTML = `<span class="date">${dateFr(e.date)}</span><span class="texte">${html(e.texte)}</span>
      <button class="suppr" aria-label="Supprimer">&#10005;</button>`;
    div.querySelector('.suppr').onclick = async () => {
      if (!confirm('Supprimer cette ligne ?')) return;
      const i = liste.indexOf(e);
      if (i >= 0) liste.splice(i, 1);
      await sauver();
      ouvrirArme(armeActive.id);
    };
    zone.appendChild(div);
  });
}

async function ajouterJournal(type) {
  const champTexte = type === 'modifs' ? 'modifTexte' : 'entretienTexte';
  const champDate = type === 'modifs' ? 'modifDate' : 'entretienDate';
  const texte = $(champTexte).value.trim();
  if (!texte) { message('Écris quelque chose avant d\'ajouter.'); return; }
  armeActive[type].push({ date: $(champDate).value || aujourdhui(), texte });
  await sauver();
  ouvrirArme(armeActive.id);
}

async function photoArme() {
  if (!natif) { message("La photo marche seulement dans l'appli Android."); return; }
  const a = armeActive;
  try {
    let numero = a.photos.length + 1;
    let nom = `${DOSSIER_RATELIER}/${nettoyer(a.nom) || 'Arme'}_${String(numero).padStart(2, '0')}.jpg`;
    while (a.photos.includes(nom)) {
      numero++;
      nom = `${DOSSIER_RATELIER}/${nettoyer(a.nom) || 'Arme'}_${String(numero).padStart(2, '0')}.jpg`;
    }
    if (!(await prendreEtEnregistrer(nom))) return;
    a.photos.push(nom);
    await sauver();
    ouvrirArme(a.id);
    message('Photo enregistrée');
  } catch (e) { erreurPhoto(e); }
}

async function supprimerArme() {
  if (!armeActive) return;
  if (!confirm(`Retirer « ${armeActive.nom} » du râtelier ?\nLes photos restent dans Documents/TirCoach/Ratelier.`)) return;
  armes = armes.filter((a) => a.id !== armeActive.id);
  armeActive = null;
  await sauver();
  afficherRatelier();
}

// =====================================================================
// Munitions
// =====================================================================

function afficherMunitions() {
  const zone = $('listeStock');
  zone.innerHTML = '';
  if (!munitions.length) zone.innerHTML = '<div class="vide">Aucune munition enregistrée.</div>';
  [...munitions].sort((a, b) => a.nom.localeCompare(b.nom)).forEach((m) => {
    const div = document.createElement('div');
    div.className = 'carte stock';
    div.innerHTML = `
      <div class="ligneListe">
        <div class="milieu nomStock">${html(m.nom)}</div>
        <button class="qte">${parseInt(m.quantite, 10) || 0}</button>
      </div>
      <div class="boutons">
        <button class="moins" data-d="-50">−50</button>
        <button class="moins" data-d="-10">−10</button>
        <button class="plus" data-d="10">+10</button>
        <button class="plus" data-d="50">+50</button>
      </div>
      <button class="supprStock">Supprimer cette munition</button>`;
    div.querySelectorAll('.boutons button').forEach((b) => {
      b.onclick = async () => {
        m.quantite = Math.max(0, (parseInt(m.quantite, 10) || 0) + parseInt(b.dataset.d, 10));
        await sauver();
        afficherMunitions();
      };
    });
    div.querySelector('.qte').onclick = async () => {
      const rep = prompt(`Nouvelle quantité pour « ${m.nom} » :`, parseInt(m.quantite, 10) || 0);
      if (rep === null || rep.trim() === '' || isNaN(parseInt(rep, 10))) return;
      m.quantite = Math.max(0, parseInt(rep, 10));
      await sauver();
      afficherMunitions();
    };
    div.querySelector('.supprStock').onclick = async () => {
      if (!confirm(`Supprimer « ${m.nom} » du stock ?`)) return;
      munitions = munitions.filter((x) => x.id !== m.id);
      await sauver();
      afficherMunitions();
    };
    zone.appendChild(div);
  });
  montrer('munitions');
}

async function ajouterMunition() {
  const nom = $('stockNom').value.trim();
  const qte = parseInt($('stockQte').value, 10) || 0;
  if (!nom) { message('Indique le nom de la munition.'); return; }
  const existe = munitions.find((m) => memeTexte(m.nom, nom));
  if (existe) existe.quantite = (parseInt(existe.quantite, 10) || 0) + qte;
  else munitions.push({ id: Date.now(), nom, quantite: qte });
  $('stockNom').value = '';
  $('stockQte').value = '';
  await sauver();
  afficherMunitions();
}

// =====================================================================
// Démarrage
// =====================================================================

$('btnEntrer').onclick = () => montrer('menu');
$('btnRetour').onclick = retour;
document.querySelectorAll('.tuile').forEach((t) => {
  t.onclick = () => {
    switch (t.dataset.va) {
      case 'carnet': afficherCarnet(); break;
      case 'ratelier': afficherRatelier(); break;
      case 'munitions': afficherMunitions(); break;
      case 'demarches': montrer('demarches'); break;
      default: message('Cette partie arrive bientôt.');
    }
  };
});

// Carnet
$('btnNouvelle').onclick = () => ouvrirFormulaire(false);
$('btnEnregistrer').onclick = enregistrerSeance;
$('btnModifier').onclick = () => ouvrirFormulaire(true);
$('btnPhoto').onclick = photoSeance;
$('btnSupprimer').onclick = supprimerSeance;

// Râtelier
$('btnNouvelleArme').onclick = () => ouvrirFormulaireArme(false);
$('btnEnregistrerArme').onclick = enregistrerArme;
$('btnModifierArme').onclick = () => ouvrirFormulaireArme(true);
$('btnPhotoArme').onclick = photoArme;
$('btnAjoutModif').onclick = () => ajouterJournal('modifs');
$('btnAjoutEntretien').onclick = () => ajouterJournal('entretiens');
$('btnSupprimerArme').onclick = supprimerArme;

// Munitions
$('btnAjoutStock').onclick = ajouterMunition;

$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');

if (natif && P.App) {
  P.App.addListener('backButton', () => {
    if (!retour()) P.App.exitApp();
  });
}

montrer('accueil');
