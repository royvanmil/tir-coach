// Tir Coach — V4
// Carnet de tir (séances multi-armes, note 1-10), râtelier, munitions,
// stands & ouvertures, tirs de contrôle, licence, démarches EDEN / SIA

const DOSSIER = 'TirCoach';
const FICHIER_DONNEES = DOSSIER + '/tircoach-donnees.json';
const EMAIL_PROPOSITIONS = 'royvanmilperso@gmail.com';
const CLES = {
  seances: 'tircoach-seances',
  armes: 'tircoach-armes',
  munitions: 'tircoach-munitions',
  stands: 'tircoach-stands',
  controles: 'tircoach-controles',
  licence: 'tircoach-licence'
};

// ---------- Base de données intégrée (mise à jour avec l'appli) ----------

const STANDS_BASE = [
  {
    id: 'taa-eauze',
    nom: 'TAA Eauze',
    adresse: 'Hippodrome de la Bergeyre, route de Bascous, 32800 Eauze\nStand 10 m et école de tir : anciennes arènes, place René Cassin, 32800 Eauze',
    horaires: 'Mercredi, samedi et dimanche\nÉté : 9h00 – 18h00\nHiver (1er octobre au 10 février) : 15h00 – 18h00\nStand 10 m : le mercredi uniquement, hors vacances scolaires, licenciés à jour de cotisation',
    distances: '10 m, 25 m, 50 m, 100 m, 200 m',
    contact: 'Secrétariat : Catherine Carroll — 06 63 82 97 37\nPrésident : François Fourel',
    notes: 'Exceptions possibles : chasse en palombière, courses hippiques'
  }
];

// Dates de tirs de contrôle connues (standId, date AAAA-MM-JJ, notes)
const CONTROLES_BASE = [];

// ---------- Capacitor ----------

const Cap = window.Capacitor;
const natif = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const P = natif ? Cap.Plugins : {};

const $ = (id) => document.getElementById(id);

let seances = migrerSeances(charger(CLES.seances, []));
let armes = charger(CLES.armes, []);
let munitions = charger(CLES.munitions, []);
let standsPerso = charger(CLES.stands, []);
let controles = charger(CLES.controles, []);
let licence = charger(CLES.licence, { numero: '', fin: '', image: '' });

let seanceActive = null;
let tirActif = null;
let armeActive = null;
let standActif = null;
let enModification = false;
let tirEnModification = false;
let armeEnModification = false;
let standEnModification = false;
let noteChoisie = 0;
let ecran = 'accueil';

// =====================================================================
// Données
// =====================================================================

function charger(cle, defaut) {
  try {
    const v = JSON.parse(localStorage.getItem(cle));
    return v == null ? defaut : v;
  } catch (e) { return defaut; }
}

// Anciennes séances (1 arme par séance) -> nouvelles séances avec une liste de "tirs"
function migrerSeances(liste) {
  return liste.map((s) => {
    if (Array.isArray(s.tirs)) return s;
    const photos = (s.photos || []).map((p) => (typeof p === 'string' ? { nom: p, score: '' } : p));
    const tirs = (s.arme || photos.length) ? [{
      id: s.id,
      arme: s.arme || '',
      munition: s.munition || '',
      coups: s.coups || '',
      distance: s.distance || '',
      cible: s.cible || 'C50',
      photos
    }] : [];
    return { id: s.id, date: s.date, lieu: s.lieu || '', note: 0, notes: s.notes || '', tirs };
  });
}

async function sauver() {
  try {
    localStorage.setItem(CLES.seances, JSON.stringify(seances));
    localStorage.setItem(CLES.armes, JSON.stringify(armes));
    localStorage.setItem(CLES.munitions, JSON.stringify(munitions));
    localStorage.setItem(CLES.stands, JSON.stringify(standsPerso));
    localStorage.setItem(CLES.controles, JSON.stringify(controles));
    localStorage.setItem(CLES.licence, JSON.stringify(licence));
  } catch (e) {}
  if (natif) {
    try {
      await P.Filesystem.writeFile({
        path: FICHIER_DONNEES,
        data: JSON.stringify({ version: 4, seances, armes, munitions, standsPerso, controles, licence }, null, 2),
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
  return (txt || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');
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

function pluriel(n, mot) { return `${n} ${mot}${n > 1 ? 's' : ''}`; }

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

function envoyerMail(sujet, corps) {
  window.location.href = `mailto:${EMAIL_PROPOSITIONS}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}

// ---------- Photos ----------

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
    img.src = Cap.convertFileSrc(r.uri) + '?t=' + Date.now();
  } catch (e) { img.onerror(); }
}

// Copie une image (résultat de l'appareil photo ou de la galerie) dans Documents/TirCoach/<cheminRelatif>
async function copierImage(media, cheminRelatif) {
  const dest = DOSSIER + '/' + cheminRelatif;
  const dossier = dest.split('/').slice(0, -1).join('/');
  try { await P.Filesystem.mkdir({ path: dossier, directory: 'DOCUMENTS', recursive: true }); } catch (e) {}
  try { await P.Filesystem.deleteFile({ path: dest, directory: 'DOCUMENTS' }); } catch (e) {}
  try {
    await P.Filesystem.copy({ from: media.uri, to: dest, toDirectory: 'DOCUMENTS' });
  } catch (e) {
    // Plan B : lire l'image et l'écrire
    const rep = await fetch(media.webPath || Cap.convertFileSrc(media.uri));
    const blob = await rep.blob();
    const data = await new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onload = () => ok(String(lecteur.result).split(',')[1]);
      lecteur.onerror = ko;
      lecteur.readAsDataURL(blob);
    });
    await P.Filesystem.writeFile({ path: dest, data, directory: 'DOCUMENTS' });
  }
}

async function prendrePhoto(cheminRelatif) {
  const photo = await P.Camera.takePhoto({ quality: 80, targetWidth: 2000, targetHeight: 2000, correctOrientation: true });
  if (!photo || !photo.uri) return false;
  await copierImage(photo, cheminRelatif);
  return true;
}

async function choisirImage(cheminRelatif) {
  const res = await P.Camera.chooseFromGallery({ mediaType: 0, allowMultipleSelection: false, quality: 90 });
  const media = res && res.results && res.results[0];
  if (!media) return false;
  await copierImage(media, cheminRelatif);
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

const ECRANS = ['Menu', 'Carnet', 'Form', 'Seance', 'TirForm', 'Ratelier', 'ArmeForm', 'Arme',
  'Munitions', 'Stands', 'Stand', 'StandForm', 'Controles', 'Licence', 'Demarches'];
const TITRES = {
  menu: 'Tir Coach', carnet: 'Carnet de tir', seance: 'Séance', ratelier: 'Mon râtelier', arme: 'Arme',
  munitions: 'Munitions', stands: 'Stands & ouvertures', stand: 'Stand', controles: 'Tirs de contrôle',
  licence: 'Ma licence', demarches: 'Démarches'
};

function montrer(nom) {
  ecran = nom;
  $('ecranAccueil').classList.toggle('cache', nom !== 'accueil');
  $('entete').classList.toggle('cache', nom === 'accueil');
  ECRANS.forEach((e) => $('ecran' + e).classList.toggle('cache', e.toLowerCase() !== nom));
  const titres = {
    form: enModification ? 'Modifier la séance' : 'Nouvelle séance',
    tirform: tirEnModification ? "Modifier l'arme tirée" : 'Arme tirée',
    armeform: armeEnModification ? "Modifier l'arme" : 'Nouvelle arme',
    standform: standEnModification ? 'Modifier le stand' : 'Nouveau stand'
  };
  $('titre').textContent = titres[nom] || TITRES[nom] || 'Tir Coach';
  window.scrollTo(0, 0);
}

function retour() {
  for (const id of ['visionneuse', 'grandNumero']) {
    if (!$(id).classList.contains('cache')) { $(id).classList.add('cache'); return true; }
  }
  switch (ecran) {
    case 'menu': montrer('accueil'); return true;
    case 'carnet': case 'ratelier': case 'munitions': case 'stands':
    case 'controles': case 'licence': case 'demarches': montrer('menu'); return true;
    case 'form':
      if (enModification && seanceActive) ouvrirSeance(seanceActive.id); else afficherCarnet();
      return true;
    case 'seance': afficherCarnet(); return true;
    case 'tirform': ouvrirSeance(seanceActive.id); return true;
    case 'armeform':
      if (armeEnModification && armeActive) ouvrirArme(armeActive.id); else afficherRatelier();
      return true;
    case 'arme': afficherRatelier(); return true;
    case 'stand': afficherStands(); return true;
    case 'standform':
      if (standEnModification && standActif) ouvrirStand(standActif.id); else afficherStands();
      return true;
    default: return false;
  }
}

// =====================================================================
// Carnet de tir
// =====================================================================

function coupsSeance(s) { return s.tirs.reduce((t, x) => t + (parseInt(x.coups, 10) || 0), 0); }

function afficherCarnet() {
  const zone = $('listeSeances');
  zone.innerHTML = '';
  if (!seances.length) zone.innerHTML = '<div class="vide">Aucune séance pour le moment.</div>';
  [...seances].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach((s) => {
    const nomsArmes = [...new Set(s.tirs.map((t) => t.arme).filter(Boolean))].join(', ');
    const coups = coupsSeance(s);
    const nbPhotos = s.tirs.reduce((t, x) => t + x.photos.length, 0);
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <div class="milieu">
        <div class="haut">${dateFr(s.date)}${s.lieu ? ' — ' + html(s.lieu) : ''}</div>
        <div class="bas">${html(nomsArmes || 'Aucune arme notée')}</div>
        <div class="bas">${coups ? pluriel(coups, 'coup') + ' · ' : ''}${nbPhotos} &#128247;</div>
      </div>
      <div class="droite">${s.note ? `<span class="badgeNote">${s.note}/10</span>` : ''}</div>`;
    div.onclick = () => ouvrirSeance(s.id);
    zone.appendChild(div);
  });
  montrer('carnet');
}

function dessinerNotes() {
  const zone = $('choixNote');
  zone.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    if (i === noteChoisie) b.classList.add('choisi');
    b.onclick = () => { noteChoisie = noteChoisie === i ? 0 : i; dessinerNotes(); };
    zone.appendChild(b);
  }
}

function lieuxConnus() {
  return [...tousLesStands().map((s) => s.nom), ...seances.map((s) => s.lieu)];
}

function ouvrirFormulaire(modifier) {
  enModification = modifier;
  remplirListe('listeLieux', lieuxConnus());
  const der = seances[seances.length - 1] || {};
  const s = modifier && seanceActive ? seanceActive
    : { date: aujourdhui(), lieu: der.lieu || 'TAA Eauze', note: 0, notes: '' };
  $('champDate').value = s.date;
  $('champLieu').value = s.lieu;
  $('champNotes').value = s.notes;
  noteChoisie = s.note || 0;
  dessinerNotes();
  montrer('form');
}

async function enregistrerSeance() {
  const valeurs = {
    date: $('champDate').value || aujourdhui(),
    lieu: $('champLieu').value.trim(),
    note: noteChoisie,
    notes: $('champNotes').value.trim()
  };
  const nouvelle = !(enModification && seanceActive);
  if (nouvelle) {
    seanceActive = Object.assign({ id: Date.now(), tirs: [] }, valeurs);
    seances.push(seanceActive);
  } else {
    Object.assign(seanceActive, valeurs);
  }
  await sauver();
  if (nouvelle) ouvrirFormulaireTir(false); // on enchaîne directement sur la 1re arme
  else ouvrirSeance(seanceActive.id);
}

function ouvrirSeance(id) {
  seanceActive = seances.find((s) => s.id === id);
  if (!seanceActive) return afficherCarnet();
  enModification = false;
  const s = seanceActive;
  const coups = coupsSeance(s);
  $('resumeSeance').innerHTML = `
    <div class="ligneListe">
      <div class="milieu">
        <div class="haut">${dateFr(s.date)}</div>
        ${s.lieu ? `<div class="bas">${html(s.lieu)}</div>` : ''}
        <div class="bas">${pluriel(s.tirs.length, 'arme')}${coups ? ' · ' + pluriel(coups, 'coup') + ' tirés' : ''}</div>
      </div>
      <div class="droite">${s.note ? `<span class="badgeNote">${s.note}/10</span>` : ''}</div>
    </div>
    ${s.notes ? `<div class="notes">${html(s.notes)}</div>` : ''}`;

  const zone = $('listeTirs');
  zone.innerHTML = '';
  s.tirs.forEach((t) => zone.appendChild(carteTir(t)));
  montrer('seance');
}

function scoreTir(t) {
  const notes = t.photos.map((p) => parseFloat(p.score)).filter((n) => !isNaN(n));
  return { total: notes.reduce((a, b) => a + b, 0), nb: notes.length };
}

function carteTir(t) {
  const sc = scoreTir(t);
  const infos = [t.munition, [t.distance ? t.distance + ' m' : '', t.cible].filter(Boolean).join(' · ')].filter(Boolean);
  const div = document.createElement('div');
  div.className = 'carte tir';
  div.innerHTML = `
    <div class="entete">
      <div>
        <div class="haut">${html(t.arme || 'Arme')}</div>
        ${infos.map((l) => `<div class="bas">${html(l)}</div>`).join('')}
      </div>
      <div class="droite">
        ${t.coups ? `<div class="score">${t.coups}</div><div class="nb">tirés</div>` : ''}
      </div>
    </div>
    ${sc.nb ? `<div class="total">Score : ${sc.total} (${pluriel(sc.nb, 'cible')})</div>` : ''}
    <div class="grille"></div>
    <div class="actions">
      <button class="petit btnPhoto">&#128247; Photo</button>
      <button class="discret btnModif">Modifier</button>
    </div>`;
  const grille = div.querySelector('.grille');
  t.photos.forEach((photo) => {
    const v = document.createElement('div');
    v.className = 'vignette';
    v.innerHTML = `
      <img alt="">
      <div class="zoneScore"><span>Score</span>
        <input type="number" inputmode="decimal" value="${html(photo.score)}" placeholder="—">
      </div>`;
    const img = v.querySelector('img');
    img.onclick = () => voirPhoto(photo.nom);
    const champ = v.querySelector('input');
    champ.onchange = async () => {
      photo.score = champ.value;
      await sauver();
      ouvrirSeance(seanceActive.id);
    };
    grille.appendChild(v);
    afficherImage(img, photo.nom);
  });
  div.querySelector('.btnPhoto').onclick = () => photoTir(t);
  div.querySelector('.btnModif').onclick = () => { tirActif = t; ouvrirFormulaireTir(true); };
  return div;
}

function ouvrirFormulaireTir(modifier) {
  tirEnModification = modifier;
  remplirListe('listeArmes', [...armes.map((a) => a.nom), ...seances.flatMap((s) => s.tirs.map((t) => t.arme))]);
  remplirListe('listeMunitions', [...munitions.map((m) => m.nom), ...seances.flatMap((s) => s.tirs.map((t) => t.munition))]);
  let t;
  if (modifier && tirActif) {
    t = tirActif;
  } else {
    tirActif = null;
    const tousTirs = seances.flatMap((s) => s.tirs);
    const der = tousTirs[tousTirs.length - 1] || {};
    t = { arme: '', munition: '', coups: '', distance: der.distance || 25, cible: der.cible || 'C50' };
  }
  $('tirArme').value = t.arme;
  $('tirMunition').value = t.munition;
  $('tirCoups').value = t.coups;
  $('tirDistance').value = t.distance;
  $('tirCible').value = t.cible;
  $('btnSupprimerTir').classList.toggle('cache', !modifier);
  montrer('tirform');
}

// Quand on choisit une arme du râtelier, on propose la dernière munition utilisée avec elle
$('tirArme').addEventListener('change', () => {
  if ($('tirMunition').value) return;
  const tousTirs = seances.flatMap((s) => s.tirs).filter((t) => memeTexte(t.arme, $('tirArme').value));
  const der = tousTirs[tousTirs.length - 1];
  if (der) $('tirMunition').value = der.munition;
});

async function enregistrerTir() {
  const valeurs = {
    arme: $('tirArme').value.trim(),
    munition: $('tirMunition').value.trim(),
    coups: $('tirCoups').value,
    distance: $('tirDistance').value,
    cible: $('tirCible').value
  };
  if (!valeurs.arme) { message("Indique l'arme."); return; }
  const nouveau = !(tirEnModification && tirActif);
  if (nouveau) {
    tirActif = Object.assign({ id: Date.now(), photos: [] }, valeurs);
    seanceActive.tirs.push(tirActif);
  } else {
    Object.assign(tirActif, valeurs);
  }
  const coups = parseInt(valeurs.coups, 10);
  const stock = munitions.find((m) => memeTexte(m.nom, valeurs.munition));
  if (nouveau && coups > 0 && stock) {
    if (confirm(`Retirer ${coups} cartouches de « ${stock.nom} » du stock ?\nStock actuel : ${stock.quantite}`)) {
      stock.quantite = Math.max(0, (parseInt(stock.quantite, 10) || 0) - coups);
    }
  }
  await sauver();
  ouvrirSeance(seanceActive.id);
}

async function supprimerTir() {
  if (!tirActif) return;
  if (!confirm(`Retirer « ${tirActif.arme} » de cette séance ?\nLes photos restent dans Documents/TirCoach.`)) return;
  seanceActive.tirs = seanceActive.tirs.filter((t) => t !== tirActif);
  tirActif = null;
  await sauver();
  ouvrirSeance(seanceActive.id);
}

function nomPhotoTir(s, t, numero) {
  return `${s.date}_${nettoyer(t.arme) || 'Arme'}_${t.distance || 0}m_${nettoyer(t.cible)}_${String(numero).padStart(2, '0')}.jpg`;
}

async function photoTir(t) {
  if (!natif) { message("La photo marche seulement dans l'appli Android."); return; }
  const s = seanceActive;
  try {
    const noms = seances.flatMap((x) => x.tirs.flatMap((y) => y.photos.map((p) => p.nom)));
    let numero = t.photos.length + 1;
    let nom = nomPhotoTir(s, t, numero);
    while (noms.includes(nom)) { numero++; nom = nomPhotoTir(s, t, numero); }
    if (!(await prendrePhoto(nom))) return;
    t.photos.push({ nom, score: '' });
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

function tirsDeLArme(nom) { return seances.flatMap((s) => s.tirs).filter((t) => memeTexte(t.arme, nom)); }

function afficherRatelier() {
  const zone = $('listeArmesRatelier');
  zone.innerHTML = '';
  if (!armes.length) zone.innerHTML = '<div class="vide">Ton râtelier est vide.</div>';
  [...armes].sort((a, b) => a.nom.localeCompare(b.nom)).forEach((a) => {
    const infos = [a.categorie ? 'Cat. ' + a.categorie : '', a.calibre,
      a.chargeurs ? pluriel(parseInt(a.chargeurs, 10), 'chargeur') : ''].filter(Boolean).join(' · ');
    const nb = tirsDeLArme(a.nom).length;
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <img class="miniature" alt="">
      <div class="milieu">
        <div class="haut">${html(a.nom)}</div>
        <div class="bas">${html(infos)}</div>
      </div>
      <div class="droite"><div class="nb">${pluriel(nb, 'séance')}</div></div>`;
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
    const ancien = armeActive.nom;
    if (ancien !== valeurs.nom) {
      seances.forEach((s) => s.tirs.forEach((t) => { if (memeTexte(t.arme, ancien)) t.arme = valeurs.nom; }));
    }
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
  const tirs = tirsDeLArme(a.nom);
  const coupsTotal = tirs.reduce((t, x) => t + (parseInt(x.coups, 10) || 0), 0);
  const lignes = [
    a.categorie ? 'Catégorie ' + a.categorie : '',
    a.calibre ? 'Calibre ' + a.calibre : '',
    a.chargeurs ? pluriel(parseInt(a.chargeurs, 10), 'chargeur') : '',
    pluriel(tirs.length, 'séance') + (coupsTotal ? ` · ${coupsTotal} coups tirés` : '')
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
  if (!texte) { message("Écris quelque chose avant d'ajouter."); return; }
  armeActive[type].push({ date: $(champDate).value || aujourdhui(), texte });
  await sauver();
  ouvrirArme(armeActive.id);
}

async function photoArme() {
  if (!natif) { message("La photo marche seulement dans l'appli Android."); return; }
  const a = armeActive;
  try {
    const base = `Ratelier/${nettoyer(a.nom) || 'Arme'}_`;
    let numero = a.photos.length + 1;
    while (a.photos.includes(base + String(numero).padStart(2, '0') + '.jpg')) numero++;
    const nom = base + String(numero).padStart(2, '0') + '.jpg';
    if (!(await prendrePhoto(nom))) return;
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
// Stands & ouvertures
// =====================================================================

// Stands de la base + stands perso (un stand perso avec le même id remplace celui de la base)
function tousLesStands() {
  const liste = STANDS_BASE.map((b) => {
    const perso = standsPerso.find((p) => p.id === b.id);
    return Object.assign({ base: true }, b, perso || {}, { base: true, modifie: !!perso });
  });
  standsPerso.filter((p) => !STANDS_BASE.some((b) => b.id === p.id)).forEach((p) => liste.push(Object.assign({ base: false }, p)));
  return liste;
}

function afficherStands() {
  const zone = $('listeStands');
  zone.innerHTML = '';
  tousLesStands().forEach((s) => {
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <div class="milieu">
        <div class="haut">${html(s.nom)}${s.base ? '<span class="badge">intégré</span>' : ''}</div>
        <div class="bas">${html((s.horaires || '').split('\n')[0])}</div>
      </div>`;
    div.onclick = () => ouvrirStand(s.id);
    zone.appendChild(div);
  });
  montrer('stands');
}

function ouvrirStand(id) {
  standActif = tousLesStands().find((s) => s.id === id);
  if (!standActif) return afficherStands();
  standEnModification = false;
  const s = standActif;
  const champs = [['Horaires', s.horaires], ['Adresse', s.adresse], ['Distances', s.distances], ['Contact', s.contact], ['Notes', s.notes]];
  $('ficheStand').className = 'carte fiche';
  $('ficheStand').innerHTML = `<div class="haut">${html(s.nom)}</div>` +
    champs.filter((c) => c[1]).map((c) => `<div class="ligne"><b>${c[0]}</b><span>${html(c[1])}</span></div>`).join('') +
    (s.modifie ? '<p class="aide" style="margin-top:10px">Tu as modifié ce stand intégré.</p>' : '');
  $('btnProposerStand').classList.toggle('cache', s.base && !s.modifie);
  $('btnSupprimerStand').classList.toggle('cache', s.base && !s.modifie);
  $('btnSupprimerStand').textContent = s.base ? 'Revenir aux infos d\'origine' : 'Supprimer ce stand';
  montrer('stand');
}

function ouvrirFormulaireStand(modifier) {
  standEnModification = modifier;
  const s = modifier && standActif ? standActif : { nom: '', adresse: '', horaires: '', distances: '', contact: '', notes: '' };
  $('standNom').value = s.nom;
  $('standAdresse').value = s.adresse || '';
  $('standHoraires').value = s.horaires || '';
  $('standDistances').value = s.distances || '';
  $('standContact').value = s.contact || '';
  $('standNotes').value = s.notes || '';
  montrer('standform');
}

async function enregistrerStand() {
  const valeurs = {
    nom: $('standNom').value.trim(),
    adresse: $('standAdresse').value.trim(),
    horaires: $('standHoraires').value.trim(),
    distances: $('standDistances').value.trim(),
    contact: $('standContact').value.trim(),
    notes: $('standNotes').value.trim()
  };
  if (!valeurs.nom) { message('Indique le nom du stand.'); return; }
  let id;
  if (standEnModification && standActif) {
    id = standActif.id;
    const perso = standsPerso.find((p) => p.id === id);
    if (perso) Object.assign(perso, valeurs); else standsPerso.push(Object.assign({ id }, valeurs));
  } else {
    id = 'perso-' + Date.now();
    standsPerso.push(Object.assign({ id }, valeurs));
  }
  await sauver();
  ouvrirStand(id);
}

async function supprimerStand() {
  if (!standActif) return;
  const q = standActif.base ? 'Revenir aux infos d\'origine de ce stand ?' : `Supprimer « ${standActif.nom} » ?`;
  if (!confirm(q)) return;
  standsPerso = standsPerso.filter((p) => p.id !== standActif.id);
  await sauver();
  afficherStands();
}

function proposerStand() {
  const s = standActif;
  envoyerMail(`Tir Coach — proposition de stand : ${s.nom}`,
    `Bonjour,\n\nJe propose d'ajouter (ou de corriger) ce stand dans Tir Coach :\n\n` +
    `Nom : ${s.nom}\nAdresse : ${s.adresse || '-'}\nHoraires : ${s.horaires || '-'}\n` +
    `Distances : ${s.distances || '-'}\nContact : ${s.contact || '-'}\nNotes : ${s.notes || '-'}\n\nMerci !`);
}

// =====================================================================
// Tirs de contrôle
// =====================================================================

function controlesDuStand(standId) {
  const base = CONTROLES_BASE.filter((c) => c.standId === standId).map((c) => {
    const id = 'base-' + c.standId + '-' + c.date;
    const perso = controles.find((p) => p.id === id);
    return Object.assign({ id, base: true, fait: false }, c, perso ? { fait: perso.fait } : {});
  });
  return [...base, ...controles.filter((c) => c.standId === standId && !c.id.startsWith('base-'))]
    .sort((a, b) => a.date.localeCompare(b.date));
}

function afficherControles() {
  const select = $('controleStand');
  const stands = tousLesStands();
  const choix = select.value || (stands[0] && stands[0].id);
  select.innerHTML = stands.map((s) => `<option value="${html(s.id)}">${html(s.nom)}</option>`).join('');
  select.value = choix;

  const annee = new Date().getFullYear();
  const faits = [...controles.filter((c) => c.fait && c.date.startsWith(String(annee)))].length;
  $('compteurControles').innerHTML = `<div class="aide">Tirs de contrôle faits en ${annee}</div><div class="compteur">${faits}</div>`;

  const zone = $('listeControles');
  zone.innerHTML = '';
  const liste = controlesDuStand(select.value);
  if (!liste.length) zone.innerHTML = '<div class="vide">Aucune date pour ce stand. Ajoute-la ci-dessous.</div>';
  liste.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'carte ligneListe controle' + (c.fait ? ' fait' : '');
    div.innerHTML = `
      <div class="milieu">
        <div class="haut">${dateFr(c.date)}${c.base ? '<span class="badge">intégré</span>' : ''}</div>
        ${c.notes ? `<div class="bas">${html(c.notes)}</div>` : ''}
        ${c.base ? '' : '<button class="supprStock">Supprimer</button>'}
      </div>
      <button class="coche">${c.fait ? '&#10003; Fait' : 'À faire'}</button>`;
    div.querySelector('.coche').onclick = async () => {
      let perso = controles.find((p) => p.id === c.id);
      if (!perso) { perso = { id: c.id, standId: c.standId, date: c.date, notes: c.notes || '', fait: false }; controles.push(perso); }
      perso.fait = !perso.fait;
      await sauver();
      afficherControles();
    };
    const suppr = div.querySelector('.supprStock');
    if (suppr) suppr.onclick = async () => {
      if (!confirm('Supprimer cette date ?')) return;
      controles = controles.filter((p) => p.id !== c.id);
      await sauver();
      afficherControles();
    };
    zone.appendChild(div);
  });
  $('controleDate').value = '';
  $('controleNotes').value = '';
  montrer('controles');
}

async function ajouterControle() {
  const date = $('controleDate').value;
  if (!date) { message('Choisis une date.'); return; }
  controles.push({ id: 'perso-' + Date.now(), standId: $('controleStand').value, date, notes: $('controleNotes').value.trim(), fait: false });
  await sauver();
  afficherControles();
}

function proposerControles() {
  const stand = tousLesStands().find((s) => s.id === $('controleStand').value);
  const dates = controlesDuStand($('controleStand').value).filter((c) => !c.base);
  if (!dates.length) { message('Ajoute d\'abord des dates pour ce stand.'); return; }
  envoyerMail(`Tir Coach — dates de tirs de contrôle : ${stand ? stand.nom : ''}`,
    `Bonjour,\n\nJe propose d'ajouter ces dates de tirs de contrôle pour ${stand ? stand.nom : 'ce stand'} :\n\n` +
    dates.map((c) => `- ${dateFr(c.date)}${c.notes ? ' (' + c.notes + ')' : ''}`).join('\n') + '\n\nMerci !');
}

// =====================================================================
// Licence
// =====================================================================

function afficherLicence() {
  $('licenceNumero').value = licence.numero || '';
  $('licenceFin').value = licence.fin || '';
  $('btnNumeroGrand').textContent = licence.numero || '—';
  const img = $('imageLicence');
  if (licence.image) { img.classList.remove('cache'); afficherImage(img, licence.image); img.onclick = () => voirPhoto(licence.image); }
  else img.classList.add('cache');
  $('btnChoisirLicence').innerHTML = licence.image ? '&#128444;&#65039; Changer l\'image' : '&#128444;&#65039; Choisir l\'image de ma licence';
  montrer('licence');
}

async function enregistrerLicence() {
  licence.numero = $('licenceNumero').value.trim();
  licence.fin = $('licenceFin').value;
  await sauver();
  afficherLicence();
  message('Licence enregistrée');
}

async function choisirImageLicence() {
  if (!natif) { message("Ça marche seulement dans l'appli Android."); return; }
  try {
    if (!(await choisirImage('Papiers/licence.jpg'))) return;
    licence.image = 'Papiers/licence.jpg';
    await sauver();
    afficherLicence();
    message('Image de la licence enregistrée');
  } catch (e) { erreurPhoto(e); }
}

function numeroEnGrand() {
  if (!licence.numero) { message('Enregistre d\'abord ton numéro de licence.'); return; }
  $('grandNumeroTexte').textContent = licence.numero;
  $('grandNumeroTexte').style.fontSize = Math.min(24, 130 / licence.numero.length) + 'vw';
  $('grandNumero').classList.remove('cache');
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
      case 'stands': afficherStands(); break;
      case 'controles': afficherControles(); break;
      case 'licence': afficherLicence(); break;
      case 'demarches': montrer('demarches'); break;
      default: message('Cette partie arrive bientôt.');
    }
  };
});

// Carnet
$('btnNouvelle').onclick = () => ouvrirFormulaire(false);
$('btnEnregistrer').onclick = enregistrerSeance;
$('btnModifier').onclick = () => ouvrirFormulaire(true);
$('btnAjoutTir').onclick = () => ouvrirFormulaireTir(false);
$('btnEnregistrerTir').onclick = enregistrerTir;
$('btnSupprimerTir').onclick = supprimerTir;
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

// Stands
$('btnNouveauStand').onclick = () => ouvrirFormulaireStand(false);
$('btnModifierStand').onclick = () => ouvrirFormulaireStand(true);
$('btnEnregistrerStand').onclick = enregistrerStand;
$('btnSupprimerStand').onclick = supprimerStand;
$('btnProposerStand').onclick = proposerStand;

// Tirs de contrôle
$('controleStand').onchange = afficherControles;
$('btnAjoutControle').onclick = ajouterControle;
$('btnProposerControles').onclick = proposerControles;

// Licence
$('btnEnregistrerLicence').onclick = enregistrerLicence;
$('btnChoisirLicence').onclick = choisirImageLicence;
$('btnNumeroGrand').onclick = numeroEnGrand;
$('grandNumero').onclick = () => $('grandNumero').classList.add('cache');

$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');

if (natif && P.App) {
  P.App.addListener('backButton', () => { if (!retour()) P.App.exitApp(); });
}

montrer('accueil');
