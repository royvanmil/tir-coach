// Tir Coach — V5
// Carnet de tir (séances multi-armes, note, tirs contrôlés), râtelier, munitions (calibres),
// stands & ouvertures, tirs de contrôle, licence & certificat (rappels), démarches, apprendre

const DOSSIER = 'TirCoach';
const FICHIER_DONNEES = DOSSIER + '/tircoach-donnees.json';
const EMAIL_PROPOSITIONS = 'royvanmilperso@gmail.com';
const CLES = {
  seances: 'tircoach-seances',
  armes: 'tircoach-armes',
  munitions: 'tircoach-munitions',
  stands: 'tircoach-stands',
  controles: 'tircoach-controles',
  licence: 'tircoach-licence',
  standFavori: 'tircoach-stand-favori',
  papiers: 'tircoach-papiers',
  accord: 'tircoach-accord',
  avis: 'tircoach-avis',
  scores: 'tircoach-scores'
};

// =====================================================================
// Base de données intégrée (mise à jour avec l'appli)
// =====================================================================

const STANDS_BASE = [
  {
    id: 'taa-eauze',
    nom: 'TAA Eauze',
    adresse: 'Hippodrome de la Bergeyre, route de Bascous, 32800 Eauze\nStand 10 m et école de tir : anciennes arènes, place René Cassin, 32800 Eauze',
    horaires: 'Mercredi, samedi et dimanche\nÉté : 9h00 – 18h00\nHiver (1er octobre au 10 février) : 15h00 – 18h00\nStand 10 m : le mercredi uniquement, hors vacances scolaires, licenciés à jour de cotisation',
    distances: '10 m, 25 m, 50 m, 100 m, 200 m',
    site: 'https://eauze32.wixsite.com/clubdetir-taa',
    notes: 'Exceptions possibles : chasse en palombière, courses hippiques'
  }
];

// Tirs de contrôle / journées club connus
const CONTROLES_BASE = ['2026-10-04', '2026-11-07', '2026-12-06', '2027-01-02', '2027-02-07', '2027-03-06',
  '2027-04-04', '2027-05-01', '2027-06-06', '2027-07-03', '2027-08-01']
  .map((date) => ({ standId: 'taa-eauze', date, notes: 'Repas du midi possible, sur réservation' }));
const CONTROLES_INFO = {
  'taa-eauze': 'Saison 2026/2027. Sauf changement en raison de manifestations hippiques.'
};

const CALIBRES = [
  { id: 'plomb45', nom: '4,5 mm (.177)' },
  { id: '22lr', nom: '22 LR' },
  { id: '9mm', nom: '9 mm (9×19)' },
  { id: '38sp', nom: '.38 Special / .357 Magnum' },
  { id: '45acp', nom: '.45 ACP' },
  { id: '223', nom: '.223 Rem / 5,56×45' },
  { id: '308', nom: '.308 Win / 7,62×51' },
  { id: 'cal12', nom: 'Calibre 12' },
  { id: 'autre', nom: 'Autre calibre' }
];
const CATEGORIES_PAPIERS = [
  { id: 'armes', nom: 'Papiers des armes', mois: [2, 1] },
  { id: 'autorisation', nom: 'Autorisation de détention (préfecture)', mois: [7, 6, 5, 4, 3, 2, 1] },
  { id: 'assurance', nom: 'Assurance', mois: [2, 1] },
  { id: 'autre', nom: 'Autre', mois: [2, 1] }
];

// Pour rire : fausses armes de catégorie A
const ARMES_POUR_RIRE = [
  'Lance-roquettes', "Char d'assaut", 'Bazooka', 'Canon de 75', 'Catapulte médiévale', 'Trébuchet',
  'Sous-marin de poche', "Porte-avions (garé dans le jardin)", 'Missile sol-air', 'Mitrailleuse à confettis',
  'Pistolet à eau turbo', 'Sabre laser', 'Lance-pierre atomique', 'Bombe à paillettes', 'Fusil à bouchon',
  'Arc de Cupidon', 'Rouleau à pâtisserie de belle-maman', 'Tong de compétition', 'Tapette à mouches tactique',
  'Doigt dans le cul'
];

const PLAY_STORE = 'https://play.google.com/store/apps/details?id=fr.royvanmil.tircoach';

const imageCalibre = (id) => (id && id !== 'autre' ? `images/calibres/${id}.svg` : '');

// Contenu de l'espace Apprendre (repris du site du T.A.A.)
const APPRENDRE = [
  { titre: '🔢 Les calibres', termes: [
    ['4,5 mm (.177)', "Les plombs de l'air comprimé, pour le tir à 10 m.", 'plomb45'],
    ['22 LR', "Petite cartouche peu chère et sans recul, idéale pour débuter ; elle peut quand même porter jusqu'à 1 500 m.", '22lr'],
    ['9 mm (9×19)', "Le pistolet le plus courant : 9 = diamètre de la balle et 19 = longueur de l'étui, en mm.", '9mm'],
    ['.38 Special / .357 Magnum', 'Calibres de revolver ; un revolver en .357 peut aussi tirer du .38 Special.', '38sp'],
    ['.45 ACP', 'Grosse balle de pistolet, plus lente, avec un recul plus marqué.', '45acp'],
    ['.223 Rem / 5,56×45', 'Petite balle rapide pour carabine ; deux calibres très proches, pas tout à fait identiques.', '223'],
    ['.308 Win / 7,62×51', "Le classique du tir à 100 et 200 m : .308 = 0,308 pouce (7,82 mm) de diamètre de balle, et 7,62×51 = la même en mm (calibre × longueur de l'étui).", '308'],
    ['Calibre 12', "Le calibre du fusil de ball-trap et de chasse ; ici le chiffre n'est pas un diamètre en mm.", 'cal12']
  ] },
  { titre: '🧨 Les munitions', image: 'cartouche-coupe', termes: [
    ['Cartouche', "L'ensemble complet : balle + étui + poudre + amorce."],
    ['Balle', 'Le projectile, la seule partie qui part dans la cible.'],
    ['Étui', 'Le tube en laiton qui tient tout ensemble ; il reste après le tir et peut être rechargé.'],
    ['Poudre', "Elle brûle très vite dans l'étui et ses gaz poussent la balle."],
    ['Amorce', "La petite capsule au fond de l'étui : le percuteur la frappe et elle allume la poudre."],
    ['Grain (gr)', "L'unité du poids de la balle (ex. 9 mm en 124 gr) : 1 grain = 0,065 g."],
    ['Gramme (g)', 'Souvent utilisé en Europe pour la charge de poudre (les manuels américains la donnent en grains).']
  ] },
  { titre: "💥 L'amorçage", termes: [
    ['Percussion annulaire', "Le produit d'amorçage est dans le rebord de l'étui et le percuteur frappe le bord (22 LR) ; l'étui ne se recharge pas.", 'annulaire'],
    ['Percussion centrale', "Une amorce est placée au centre du culot et le percuteur la frappe au milieu : c'est le cas de presque toutes les autres cartouches, et l'étui se recharge.", 'centrale']
  ] },
  { titre: '🔭 Les lunettes', image: 'lunette', termes: [
    ['Grossissement', 'Ex. 3-12×50 : zoom de 3 à 12 fois, objectif de 50 mm de diamètre.'],
    ['Réticule', "La croix ou les repères que l'on voit dans la lunette.", 'reticule'],
    ['MOA', "Minute d'angle : 1 MOA ≈ 2,9 cm à 100 m.", 'moa-mrad'],
    ['MRAD (mil)', 'Milliradian : 1 MRAD = 10 cm à 100 m.'],
    ['Clic', 'Un cran de tourelle : souvent ¼ MOA (≈ 0,7 cm) ou 0,1 MRAD (1 cm) à 100 m.'],
    ['Zéro', 'Régler la lunette pour que le point visé soit le point touché à une distance choisie.']
  ] },
  { titre: '🔴 Les red dot', termes: [
    ['Red dot', 'Viseur sans grossissement qui montre un point lumineux, on vise les deux yeux ouverts.', 'reddot'],
    ['Taille du point', 'Donnée en MOA : un point de 2 MOA couvre environ 6 cm à 100 m.'],
    ['Intensité', "Réglable : plus fort en plein soleil, plus faible à l'intérieur."]
  ] },
  { titre: '🎯 La visée', image: 'visee', termes: [
    ['Guidon', "Le repère à l'avant du canon."],
    ['Hausse', "Le cran à l'arrière, souvent réglable en hauteur et sur le côté."],
    ['Alignement', "Le guidon est centré dans le cran, et le haut du guidon arrive au niveau du haut de la hausse. L'œil fait le point sur le guidon, pas sur la cible.", 'alignement'],
    ['Ligne de mire', 'La ligne œil → hausse → guidon → cible.']
  ] },
  { titre: '☝️ La détente', image: 'detente', termes: [
    ['Détente', 'La pièce sur laquelle le doigt appuie pour faire partir le coup.'],
    ['Pontet', "L'arceau qui protège la détente."],
    ['Pré-course', 'La partie libre au début, avant le point dur.'],
    ['Poids de détente', "La force qu'il faut pour faire partir le coup, en grammes."],
    ['Départ', 'Le moment où le coup part. Il doit un peu surprendre le tireur.']
  ] },
  { titre: "⚖️ Les catégories d'armes", termes: [
    ['A', 'Interdites aux particuliers (matériels de guerre, armes automatiques).', null, 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2242'],
    ['B', 'Soumises à autorisation de la préfecture, pour 5 ans. Pistolets, revolvers… le domaine du tir sportif.', null, 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2250'],
    ['C', 'Soumises à déclaration. Armes longues à répétition manuelle, certaines semi-automatiques.', null, 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2246'],
    ['D', "Acquisition libre pour les majeurs (ex. armes anciennes d'avant 1900).", null, 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2248']
  ] },
  { titre: '🟩 La feuille verte', termes: [
    ["Ce que c'est", "L'avis préalable de la FFTir. Il faut le joindre à la demande d'autorisation pour une arme de catégorie B."],
    ['1re demande', "3 tirs contrôlés, espacés d'au moins 2 mois, dans les 12 mois avant la demande."],
    ['Comment', 'La demande se fait sur EDEN, puis le président du club signe.']
  ] },
  { titre: '🔐 Coffre-fort & munitions à la maison', termes: [
    ['Toutes les armes', "Rangées de façon à éviter l'usage par une autre personne."],
    ['Catégorie B', 'Dans un coffre-fort ou une armoire forte, ou dans une pièce forte (porte blindée, fenêtres avec barreaux).'],
    ['Catégorie C', "Coffre-fort ou armoire forte, ou une pièce essentielle démontée et rangée à part (culasse, verrou), ou un système qui empêche d'enlever l'arme (râtelier avec chaîne et cadenas…)."],
    ['Munitions', 'Rangées à part, séparées des armes. Un petit coffre fermé à clé dans le grand coffre convient.'],
    ['Achat cat. B', '3 000 cartouches maximum par arme sur 12 mois.'],
    ['À la maison', '1 000 cartouches maximum par arme en même temps (catégories B et C).'],
    ['En armurerie', "Pour la catégorie B, l'autorisation de la préfecture vaut aussi pour les munitions de l'arme. À présenter : pièce d'identité, autorisation et licence."],
    ['Source', 'Code de la sécurité intérieure (art. R314-2 à R314-4, R312-47 et R312-49).']
  ] }
];

// =====================================================================
// Capacitor et état
// =====================================================================

const Cap = window.Capacitor;
const natif = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const P = natif ? Cap.Plugins : {};

const $ = (id) => document.getElementById(id);

let seances = migrerSeances(charger(CLES.seances, []));
let armes = charger(CLES.armes, []);
let munitions = charger(CLES.munitions, []);
let standsPerso = charger(CLES.stands, []);
let controles = charger(CLES.controles, []).filter((c) => !String(c.id).startsWith('base-'));
let papiers = charger(CLES.papiers, []);
let licence = Object.assign({ numero: '', fin: '', image: '', certificatFin: '', certificatImage: '' }, charger(CLES.licence, {}));

let seanceActive = null;
let tirActif = null;
let armeActive = null;
let standActif = null;
let papierActif = null;
let papierEnModification = false;
let enModification = false;
let tirEnModification = false;
let armeEnModification = false;
let standEnModification = false;
let noteChoisie = 0;
let ecran = 'accueil';
let depuisMenu = false;

// =====================================================================
// Données
// =====================================================================

function charger(cle, defaut) {
  try {
    const v = JSON.parse(localStorage.getItem(cle));
    return v == null ? defaut : v;
  } catch (e) { return defaut; }
}

function migrerSeances(liste) {
  return liste.map((s) => {
    if (Array.isArray(s.tirs)) return s;
    const photos = (s.photos || []).map((p) => (typeof p === 'string' ? { nom: p, score: '' } : p));
    const tirs = (s.arme || photos.length) ? [{
      id: s.id, arme: s.arme || '', munition: s.munition || '', coups: s.coups || '',
      distance: s.distance || '', cible: s.cible || 'C50', photos
    }] : [];
    return { id: s.id, date: s.date, lieu: s.lieu || '', note: 0, controle: false, notes: s.notes || '', tirs };
  });
}

function donneesCompletes() {
  return { appli: 'Tir Coach', version: 6, date: new Date().toISOString(), seances, armes, munitions, standsPerso, controles, licence, papiers };
}

async function sauver() {
  try {
    localStorage.setItem(CLES.seances, JSON.stringify(seances));
    localStorage.setItem(CLES.armes, JSON.stringify(armes));
    localStorage.setItem(CLES.munitions, JSON.stringify(munitions));
    localStorage.setItem(CLES.stands, JSON.stringify(standsPerso));
    localStorage.setItem(CLES.controles, JSON.stringify(controles));
    localStorage.setItem(CLES.licence, JSON.stringify(licence));
    localStorage.setItem(CLES.papiers, JSON.stringify(papiers));
  } catch (e) {}
  if (natif) {
    try {
      await P.Filesystem.writeFile({
        path: FICHIER_DONNEES,
        data: JSON.stringify(donneesCompletes(), null, 2),
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

function decalerMois(iso, mois) {
  const d = new Date(iso + 'T12:00:00');
  d.setMonth(d.getMonth() + mois);
  return d.toISOString().slice(0, 10);
}

function joursAvant(iso) {
  return Math.round((new Date(iso + 'T12:00:00') - new Date(aujourdhui() + 'T12:00:00')) / 86400000);
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

async function copierImage(media, cheminRelatif) {
  const dest = DOSSIER + '/' + cheminRelatif;
  const dossier = dest.split('/').slice(0, -1).join('/');
  try { await P.Filesystem.mkdir({ path: dossier, directory: 'DOCUMENTS', recursive: true }); } catch (e) {}
  try { await P.Filesystem.deleteFile({ path: dest, directory: 'DOCUMENTS' }); } catch (e) {}
  try {
    await P.Filesystem.copy({ from: media.uri, to: dest, toDirectory: 'DOCUMENTS' });
  } catch (e) {
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

// source : 'photo' (appareil) ou 'galerie'
async function obtenirImage(source, cheminRelatif) {
  if (source === 'galerie') {
    const res = await P.Camera.chooseFromGallery({ mediaType: 0, allowMultipleSelection: false, quality: 85, targetWidth: 2000, targetHeight: 2000, correctOrientation: true });
    const media = res && res.results && res.results[0];
    if (!media) return false;
    await copierImage(media, cheminRelatif);
    return true;
  }
  const photo = await P.Camera.takePhoto({ quality: 80, targetWidth: 2000, targetHeight: 2000, correctOrientation: true });
  if (!photo || !photo.uri) return false;
  await copierImage(photo, cheminRelatif);
  return true;
}

function erreurPhoto(e) {
  const txt = String((e && e.message) || e);
  if (!/cancel/i.test(txt)) message('Erreur photo : ' + txt);
}

function sansNatif() {
  if (natif) return false;
  message("Ça marche seulement dans l'appli Android.");
  return true;
}

function voirPhoto(nom) {
  $('nomGrand').textContent = nom.split('/').pop();
  $('imageGrande').removeAttribute('src');
  afficherImage($('imageGrande'), nom);
  $('visionneuse').classList.remove('cache');
}

// Vignette avec bouton de retrait (la photo reste dans le dossier du téléphone)
function vignette(nom, surSuppression, extraHtml) {
  const v = document.createElement('div');
  v.className = 'vignette';
  v.innerHTML = `<div class="cadre"><img alt=""><button class="supprPhoto" aria-label="Retirer la photo">&#10005;</button></div>${extraHtml || ''}`;
  const img = v.querySelector('img');
  img.onclick = () => voirPhoto(nom);
  v.querySelector('.supprPhoto').onclick = async (ev) => {
    ev.stopPropagation();
    if (!confirm("Retirer cette photo de l'appli ?\nElle reste dans Documents/TirCoach.")) return;
    await surSuppression();
  };
  afficherImage(img, nom);
  return v;
}

// =====================================================================
// Rappels licence / certificat
// =====================================================================

// Toutes les dates de fin à surveiller : licence, certificat et papiers
function echeances() {
  const liste = [];
  if (licence.fin) liste.push({ texte: 'Ta licence', fin: licence.fin, mois: [2, 1], ouvrir: afficherLicence });
  if (licence.certificatFin) liste.push({ texte: 'Ton certificat médical', fin: licence.certificatFin, mois: [2, 1], ouvrir: afficherLicence });
  papiers.filter((p) => p.fin).forEach((p) => {
    const cat = CATEGORIES_PAPIERS.find((c) => c.id === p.categorie) || CATEGORIES_PAPIERS[3];
    liste.push({ texte: `« ${p.titre || cat.nom} »`, fin: p.fin, mois: cat.mois, ouvrir: () => ouvrirPapier(p.id) });
  });
  return liste;
}

function alertesExpiration() {
  const liste = [];
  echeances().forEach((e) => {
    const j = joursAvant(e.fin);
    const debutAlerte = decalerMois(e.fin, -Math.max(...e.mois));
    if (j < 0) liste.push({ niveau: 'rouge', texte: `${e.texte} a expiré le ${dateFr(e.fin)}.`, ouvrir: e.ouvrir });
    else if (j <= 31) liste.push({ niveau: 'rouge', texte: `${e.texte} expire le ${dateFr(e.fin)} (dans ${pluriel(j, 'jour')}).`, ouvrir: e.ouvrir });
    else if (aujourdhui() >= debutAlerte) liste.push({ niveau: 'orange', texte: `${e.texte} expire le ${dateFr(e.fin)}.`, ouvrir: e.ouvrir });
  });
  return liste;
}

function afficherAlertes() {
  const alertes = alertesExpiration();
  $('alertes').innerHTML = alertes.map((a) => `<div class="alerte ${a.niveau}">&#9888;&#65039; ${html(a.texte)}</div>`).join('');
  $('alertes').querySelectorAll('.alerte').forEach((el, i) => { el.onclick = alertes[i].ouvrir; });
  // Demande d'avis après 3 séances
  const avis = charger(CLES.avis, {});
  if (seances.length >= 3 && !avis.fait && (!avis.plusTard || aujourdhui() >= avis.plusTard)) {
    const div = document.createElement('div');
    div.className = 'alerte rouge avis';
    div.innerHTML = `<div>&#11088; Tu es content ? Laisse un avis !</div>
      <div class="boutonsAvis"><a class="petit" href="${PLAY_STORE}" target="_blank" rel="noopener">Laisser un avis</a>
      <button class="discret">Plus tard</button></div>`;
    div.querySelector('a').onclick = () => { try { localStorage.setItem(CLES.avis, JSON.stringify({ fait: true })); } catch (e) {} div.remove(); };
    div.querySelector('button').onclick = () => {
      try { localStorage.setItem(CLES.avis, JSON.stringify({ plusTard: decalerMois(aujourdhui(), 1) })); } catch (e) {}
      div.remove();
    };
    $('alertes').appendChild(div);
  }
}

async function programmerRappels() {
  if (!natif || !P.LocalNotifications) return;
  try {
    const LN = P.LocalNotifications;
    const liste = echeances();
    const enAttente = await LN.getPending();
    if (enAttente.notifications.length) await LN.cancel({ notifications: enAttente.notifications.map((n) => ({ id: n.id })) });
    if (!liste.length) return;
    let perm = await LN.checkPermissions();
    if (perm.display !== 'granted') perm = await LN.requestPermissions();
    if (perm.display !== 'granted') return;
    const aProgrammer = [];
    let id = 1;
    liste.forEach((e) => {
      e.mois.forEach((mois) => {
        const jour = new Date(decalerMois(e.fin, -mois) + 'T10:00:00');
        if (jour > new Date()) {
          aProgrammer.push({
            id: id++,
            title: 'Tir Coach',
            body: `${e.texte} expire dans ${mois} mois (le ${dateFr(e.fin)}).`,
            schedule: { at: jour, allowWhileIdle: true }
          });
        }
      });
    });
    if (aProgrammer.length) await LN.schedule({ notifications: aProgrammer });
  } catch (e) { console.log('Rappels impossibles', e); }
}

// =====================================================================
// Navigation
// =====================================================================

const ECRANS = ['Menu', 'Carnet', 'Form', 'Seance', 'TirForm', 'Ratelier', 'ArmeForm', 'Arme',
  'Munitions', 'Stands', 'Stand', 'StandForm', 'Controles', 'Licence', 'Demarches', 'Apprendre', 'Infos', 'Papiers', 'PapierForm', 'Papier', 'Jeu'];
const TITRES = {
  menu: 'Tir Coach', carnet: 'Carnet de tir', seance: 'Séance', ratelier: 'Mon râtelier', arme: 'Arme',
  munitions: 'Munitions', stands: 'Stands & ouvertures', stand: 'Stand', controles: 'Tirs de contrôle',
  licence: 'Licence & certificat', demarches: 'Démarches', apprendre: 'Apprendre', infos: 'À propos', papiers: 'Mes papiers', papier: 'Papier', jeu: 'Jeu de précision'
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
    standform: standEnModification ? 'Modifier le stand' : 'Nouveau stand',
    papierform: papierEnModification ? 'Modifier le papier' : 'Nouveau papier'
  };
  $('titre').textContent = titres[nom] || TITRES[nom] || 'Tir Coach';
  if (nom === 'menu') afficherAlertes();
  window.scrollTo(0, 0);
}

function retour() {
  for (const id of ['visionneuse', 'grandNumero']) {
    if (!$(id).classList.contains('cache')) { $(id).classList.add('cache'); return true; }
  }
  switch (ecran) {
    case 'menu': montrer('accueil'); return true;
    case 'infos': montrer(depuisMenu ? 'menu' : 'accueil'); return true;
    case 'carnet': case 'ratelier': case 'munitions': case 'stands':
    case 'controles': case 'licence': case 'demarches': case 'apprendre': case 'papiers': case 'jeu': montrer('menu'); return true;
    case 'papier': afficherPapiers(); return true;
    case 'papierform':
      if (papierEnModification && papierActif) ouvrirPapier(papierActif.id); else afficherPapiers();
      return true;
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

// Tirs contrôlés valables sur les 12 derniers mois, espacés d'au moins 2 mois
function bilanControles() {
  const limite = decalerMois(aujourdhui(), -12);
  const dates = seances.filter((s) => s.controle && s.date > limite && s.date <= aujourdhui()).map((s) => s.date).sort();
  const valables = [];
  dates.forEach((d) => { if (!valables.length || d >= decalerMois(valables[valables.length - 1], 2)) valables.push(d); });
  return valables;
}

function afficherCompteur() {
  const valables = bilanControles();
  const n = Math.min(valables.length, 3);
  const prochain = valables.length ? decalerMois(valables[valables.length - 1], 2) : '';
  $('compteurControles').innerHTML = `
    <div class="ligneListe">
      <div class="milieu">
        <div class="haut">Tirs contrôlés (12 derniers mois)</div>
        ${prochain && n < 3 ? `<div class="bas">Le prochain compte à partir du ${dateFr(prochain)}</div>` : ''}
        ${n >= 3 ? '<div class="bas">3 tirs contrôlés valables ✓</div>' : ''}
      </div>
      <div class="compteur">${n}/3</div>
    </div>
    <p class="regle">Règle : 1re demande d'arme de catégorie B → 3 tirs contrôlés sur les 12 mois avant la demande, espacés d'au moins 2 mois. Renouvellement → au moins 1 tir par an.</p>`;
}

function afficherCarnet() {
  afficherCompteur();
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
        <div class="haut">${dateFr(s.date)}${s.lieu ? ' — ' + html(s.lieu) : ''}${s.controle ? '<span class="badge">contrôlé</span>' : ''}</div>
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

function ouvrirFormulaire(modifier) {
  enModification = modifier;
  remplirListe('listeLieux', [...tousLesStands().map((s) => s.nom), ...seances.map((s) => s.lieu)]);
  const der = seances[seances.length - 1] || {};
  const s = modifier && seanceActive ? seanceActive
    : { date: aujourdhui(), lieu: der.lieu || 'TAA Eauze', note: 0, notes: '', controle: false };
  $('champDate').value = s.date;
  $('champLieu').value = s.lieu;
  $('champNotes').value = s.notes;
  $('champControle').checked = !!s.controle;
  noteChoisie = s.note || 0;
  dessinerNotes();
  montrer('form');
}

async function enregistrerSeance() {
  const valeurs = {
    date: $('champDate').value || aujourdhui(),
    lieu: $('champLieu').value.trim(),
    note: noteChoisie,
    controle: $('champControle').checked,
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
  if (nouvelle) ouvrirFormulaireTir(false);
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
        <div class="haut">${dateFr(s.date)}${s.controle ? '<span class="badge">tir contrôlé</span>' : ''}</div>
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

function carteTir(t) {
  const notes = t.photos.map((p) => parseFloat(p.score)).filter((n) => !isNaN(n));
  const total = notes.reduce((a, b) => a + b, 0);
  const infos = [t.munition, [t.distance ? t.distance + ' m' : '', t.cible].filter(Boolean).join(' · ')].filter(Boolean);
  const div = document.createElement('div');
  div.className = 'carte tir';
  div.innerHTML = `
    <div class="entete">
      <div>
        <div class="haut">${html(t.arme || 'Arme')}</div>
        ${infos.map((l) => `<div class="bas">${html(l)}</div>`).join('')}
      </div>
      <div class="droite">${t.coups ? `<div class="score">${t.coups}</div><div class="nb">tirés</div>` : ''}</div>
    </div>
    ${notes.length ? `<div class="total">Score : ${total} (${pluriel(notes.length, 'cible')})</div>` : ''}
    <div class="grille"></div>
    <div class="actions">
      <button class="petit btnPhoto">&#128247; Photo</button>
      <button class="discret btnModif">Modifier</button>
    </div>`;
  const grille = div.querySelector('.grille');
  t.photos.forEach((photo) => {
    const v = vignette(photo.nom, async () => {
      t.photos = t.photos.filter((p) => p !== photo);
      await sauver();
      ouvrirSeance(seanceActive.id);
    }, `<div class="zoneScore"><span>Score</span><input type="number" inputmode="decimal" value="${html(photo.score)}" placeholder="—"></div>`);
    const champ = v.querySelector('input');
    champ.onchange = async () => { photo.score = champ.value; await sauver(); ouvrirSeance(seanceActive.id); };
    grille.appendChild(v);
  });
  div.querySelector('.btnPhoto').onclick = () => photoTir(t);
  div.querySelector('.btnModif').onclick = () => { tirActif = t; ouvrirFormulaireTir(true); };
  return div;
}

function ouvrirFormulaireTir(modifier) {
  tirEnModification = modifier;
  const tousTirs = seances.flatMap((s) => s.tirs);
  remplirListe('listeArmes', [...armes.map((a) => a.nom), ...tousTirs.map((t) => t.arme)]);
  remplirListe('listeMunitions', [...munitions.map((m) => m.nom), ...tousTirs.map((t) => t.munition)]);
  let t;
  if (modifier && tirActif) {
    t = tirActif;
  } else {
    tirActif = null;
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

$('tirArme').addEventListener('change', () => {
  if ($('tirMunition').value) return;
  const tirs = seances.flatMap((s) => s.tirs).filter((t) => memeTexte(t.arme, $('tirArme').value));
  const der = tirs[tirs.length - 1];
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

async function photoTir(t) {
  if (sansNatif()) return;
  const s = seanceActive;
  try {
    const noms = seances.flatMap((x) => x.tirs.flatMap((y) => y.photos.map((p) => p.nom)));
    const base = `${s.date}_${nettoyer(t.arme) || 'Arme'}_${t.distance || 0}m_${nettoyer(t.cible)}_`;
    let numero = t.photos.length + 1;
    while (noms.includes(base + String(numero).padStart(2, '0') + '.jpg')) numero++;
    const nom = base + String(numero).padStart(2, '0') + '.jpg';
    if (!(await obtenirImage('photo', nom))) return;
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
  $('armeRire').innerHTML = '<option value="">— choisir —</option>' +
    ARMES_POUR_RIRE.map((n) => `<option>${html(n)}</option>`).join('');
  $('zoneRire').classList.toggle('cache', a.categorie !== 'A');
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
  valeurs.pourRire = ARMES_POUR_RIRE.includes(valeurs.nom);
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
    grille.appendChild(vignette(nom, async () => {
      a.photos = a.photos.filter((p) => p !== nom);
      await sauver();
      ouvrirArme(a.id);
    }));
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

async function imageArme(source) {
  if (sansNatif()) return;
  const a = armeActive;
  try {
    const base = `Ratelier/${nettoyer(a.nom) || 'Arme'}_`;
    let numero = a.photos.length + 1;
    while (a.photos.includes(base + String(numero).padStart(2, '0') + '.jpg')) numero++;
    const nom = base + String(numero).padStart(2, '0') + '.jpg';
    if (!(await obtenirImage(source, nom))) return;
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

$('armeCategorie').addEventListener('change', () => {
  $('zoneRire').classList.toggle('cache', $('armeCategorie').value !== 'A');
});
$('armeRire').addEventListener('change', () => {
  if (!$('armeRire').value) return;
  $('armeNom').value = $('armeRire').value;
});

// =====================================================================
// Munitions
// =====================================================================

function nomCalibre(id) { const c = CALIBRES.find((x) => x.id === id); return c ? c.nom : ''; }

function afficherMunitions() {
  $('stockCalibre').innerHTML = '<option value="">Calibre…</option>' +
    CALIBRES.map((c) => `<option value="${c.id}">${html(c.nom)}</option>`).join('');
  const zone = $('listeStock');
  zone.innerHTML = '';
  if (!munitions.length) zone.innerHTML = '<div class="vide">Aucune munition enregistrée.</div>';
  [...munitions].sort((a, b) => (nomCalibre(a.calibre) + a.nom).localeCompare(nomCalibre(b.calibre) + b.nom)).forEach((m) => {
    const imgCal = imageCalibre(m.calibre);
    const div = document.createElement('div');
    div.className = 'carte stock';
    div.innerHTML = `
      <div class="ligneListe">
        <div class="milieu">
          <div class="nomStock">${html(m.nom)}</div>
          ${m.calibre ? `<div class="bas">${html(nomCalibre(m.calibre))}</div>` : ''}
        </div>
        <button class="qte">${parseInt(m.quantite, 10) || 0}</button>
      </div>
      ${imgCal ? `<img class="calibreImg" src="${imgCal}" alt="">` : ''}
      ${m.photo ? '<img class="photoStock" alt="">' : ''}
      <div class="boutons">
        <button class="moins" data-d="-50">−50</button>
        <button class="moins" data-d="-10">−10</button>
        <button class="plus" data-d="10">+10</button>
        <button class="plus" data-d="50">+50</button>
      </div>
      <div class="liensStock">
        <button class="lienPetit btnPhotoStock">&#128247; Photo</button>
        <button class="lienPetit btnGalerieStock">&#128444;&#65039; Galerie</button>
        <button class="lienPetit btnCalibreStock">Calibre</button>
        <button class="lienPetit btnSupprStock">Supprimer</button>
      </div>`;
    if (m.photo) {
      const img = div.querySelector('.photoStock');
      afficherImage(img, m.photo);
      img.onclick = () => voirPhoto(m.photo);
    }
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
    div.querySelector('.btnPhotoStock').onclick = () => imageMunition(m, 'photo');
    div.querySelector('.btnGalerieStock').onclick = () => imageMunition(m, 'galerie');
    div.querySelector('.btnCalibreStock').onclick = async () => {
      const liste = CALIBRES.map((c, i) => `${i + 1}. ${c.nom}`).join('\n');
      const rep = prompt(`Numéro du calibre :\n${liste}`, String(Math.max(1, CALIBRES.findIndex((c) => c.id === m.calibre) + 1)));
      const i = parseInt(rep, 10) - 1;
      if (isNaN(i) || !CALIBRES[i]) return;
      m.calibre = CALIBRES[i].id;
      await sauver();
      afficherMunitions();
    };
    div.querySelector('.btnSupprStock').onclick = async () => {
      if (!confirm(`Supprimer « ${m.nom} » du stock ?`)) return;
      munitions = munitions.filter((x) => x.id !== m.id);
      await sauver();
      afficherMunitions();
    };
    zone.appendChild(div);
  });
  montrer('munitions');
}

async function imageMunition(m, source) {
  if (sansNatif()) return;
  try {
    const nom = `Munitions/${nettoyer(m.nom) || 'Munition'}_${Date.now()}.jpg`;
    if (!(await obtenirImage(source, nom))) return;
    m.photo = nom;
    await sauver();
    afficherMunitions();
  } catch (e) { erreurPhoto(e); }
}

async function ajouterMunition() {
  const calibre = $('stockCalibre').value;
  let nom = $('stockNom').value.trim();
  const qte = parseInt($('stockQte').value, 10) || 0;
  if (!nom && !calibre) { message('Indique le calibre ou le nom de la munition.'); return; }
  if (!nom) nom = nomCalibre(calibre);
  const existe = munitions.find((m) => memeTexte(m.nom, nom));
  if (existe) {
    existe.quantite = (parseInt(existe.quantite, 10) || 0) + qte;
    if (calibre) existe.calibre = calibre;
  } else {
    munitions.push({ id: Date.now(), nom, calibre, quantite: qte, photo: '' });
  }
  $('stockNom').value = '';
  $('stockQte').value = '';
  $('stockCalibre').value = '';
  await sauver();
  afficherMunitions();
}

// =====================================================================
// Stands & ouvertures
// =====================================================================

function tousLesStands() {
  const liste = STANDS_BASE.map((b) => {
    const perso = standsPerso.find((p) => p.id === b.id);
    return Object.assign({}, b, perso || {}, { base: true, modifie: !!perso });
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
  const champs = [['Horaires', s.horaires], ['Adresse', s.adresse], ['Distances', s.distances], ['Notes', s.notes]];
  $('ficheStand').className = 'carte fiche';
  $('ficheStand').innerHTML = `<div class="haut">${html(s.nom)}</div>` +
    champs.filter((c) => c[1]).map((c) => `<div class="ligne"><b>${c[0]}</b><span>${html(c[1])}</span></div>`).join('') +
    (s.modifie ? '<p class="aide" style="margin-top:10px">Tu as modifié ce stand intégré.</p>' : '');
  $('lienSiteStand').classList.toggle('cache', !s.site);
  if (s.site) $('lienSiteStand').href = s.site;
  $('btnProposerStand').classList.toggle('cache', s.base && !s.modifie);
  $('btnSupprimerStand').classList.toggle('cache', s.base && !s.modifie);
  $('btnSupprimerStand').textContent = s.base ? "Revenir aux infos d'origine" : 'Supprimer ce stand';
  montrer('stand');
}

function ouvrirFormulaireStand(modifier) {
  standEnModification = modifier;
  const s = modifier && standActif ? standActif : {};
  $('standNom').value = s.nom || '';
  $('standAdresse').value = s.adresse || '';
  $('standHoraires').value = s.horaires || '';
  $('standDistances').value = s.distances || '';
  $('standSite').value = s.site || '';
  $('standNotes').value = s.notes || '';
  montrer('standform');
}

async function enregistrerStand() {
  const valeurs = {
    nom: $('standNom').value.trim(),
    adresse: $('standAdresse').value.trim(),
    horaires: $('standHoraires').value.trim(),
    distances: $('standDistances').value.trim(),
    site: $('standSite').value.trim(),
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
  const q = standActif.base ? "Revenir aux infos d'origine de ce stand ?" : `Supprimer « ${standActif.nom} » ?`;
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
    `Distances : ${s.distances || '-'}\nSite web : ${s.site || '-'}\nNotes : ${s.notes || '-'}\n\nMerci !`);
}

// =====================================================================
// Tirs de contrôle (dates du stand, pour info)
// =====================================================================

function controlesDuStand(standId) {
  const base = CONTROLES_BASE.filter((c) => c.standId === standId).map((c) => Object.assign({ base: true }, c));
  return [...base, ...controles.filter((c) => c.standId === standId)].sort((a, b) => a.date.localeCompare(b.date));
}

function afficherControles() {
  const select = $('controleStand');
  const stands = tousLesStands();
  let choix = select.value || charger(CLES.standFavori, '') || (stands[0] && stands[0].id);
  if (!stands.some((s) => s.id === choix)) choix = stands[0] && stands[0].id;
  select.innerHTML = stands.map((s) => `<option value="${html(s.id)}">${html(s.nom)}</option>`).join('');
  select.value = choix;
  try { localStorage.setItem(CLES.standFavori, JSON.stringify(choix)); } catch (e) {}

  const zone = $('listeControles');
  zone.innerHTML = CONTROLES_INFO[choix] ? `<p class="aide">${html(CONTROLES_INFO[choix])}</p>` : '';
  const liste = controlesDuStand(choix);
  if (!liste.length) zone.innerHTML += '<div class="vide">Aucune date pour ce stand. Ajoute-la ci-dessous.</div>';
  const auj = aujourdhui();
  let prochaineMarquee = false;
  liste.forEach((c) => {
    const passe = c.date < auj;
    const prochaine = !passe && !prochaineMarquee;
    if (prochaine) prochaineMarquee = true;
    const jour = new Date(c.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long' });
    const div = document.createElement('div');
    div.className = 'carte ligneListe controle' + (passe ? ' passe' : '') + (prochaine ? ' prochaine' : '');
    div.innerHTML = `
      <div class="milieu">
        <div class="haut">${jour.charAt(0).toUpperCase() + jour.slice(1)} ${dateFr(c.date)}${prochaine ? '<span class="badge">prochaine</span>' : ''}</div>
        ${c.notes ? `<div class="bas">${html(c.notes)}</div>` : ''}
        ${c.base ? '' : '<button class="supprStock">Supprimer</button>'}
      </div>`;
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
  if (ecran !== 'controles') {
    montrer('controles');
    const prochaine = zone.querySelector('.prochaine');
    if (prochaine) prochaine.scrollIntoView({ block: 'center' });
  }
}

async function ajouterControle() {
  const date = $('controleDate').value;
  if (!date) { message('Choisis une date.'); return; }
  controles.push({ id: 'perso-' + Date.now(), standId: $('controleStand').value, date, notes: $('controleNotes').value.trim() });
  await sauver();
  afficherControles();
}

function proposerControles() {
  const stand = tousLesStands().find((s) => s.id === $('controleStand').value);
  const dates = controles.filter((c) => c.standId === $('controleStand').value);
  if (!dates.length) { message("Ajoute d'abord des dates pour ce stand."); return; }
  envoyerMail(`Tir Coach — dates de tirs de contrôle : ${stand ? stand.nom : ''}`,
    `Bonjour,\n\nJe propose d'ajouter ces dates de tirs de contrôle pour ${stand ? stand.nom : 'ce stand'} :\n\n` +
    dates.map((c) => `- ${dateFr(c.date)}${c.notes ? ' (' + c.notes + ')' : ''}`).join('\n') + '\n\nMerci !');
}

// =====================================================================
// Licence & certificat médical
// =====================================================================

function afficherLicence() {
  $('licenceNumero').value = licence.numero || '';
  $('licenceFin').value = licence.fin || '';
  $('certificatFin').value = licence.certificatFin || '';
  $('btnNumeroGrand').textContent = licence.numero || '—';
  [['imageLicence', 'image', 'btnChoisirLicence', "l'image de ma licence"],
   ['imageCertificat', 'certificatImage', 'btnChoisirCertificat', "l'image du certificat"]].forEach(([idImg, cle, idBtn, texte]) => {
    const img = $(idImg);
    if (licence[cle]) { img.classList.remove('cache'); afficherImage(img, licence[cle]); img.onclick = () => voirPhoto(licence[cle]); }
    else img.classList.add('cache');
    $(idBtn).innerHTML = licence[cle] ? "&#128444;&#65039; Changer l'image" : `&#128444;&#65039; Choisir ${texte}`;
  });
  montrer('licence');
}

async function enregistrerLicence() {
  licence.numero = $('licenceNumero').value.trim();
  licence.fin = $('licenceFin').value;
  licence.certificatFin = $('certificatFin').value;
  await sauver();
  await programmerRappels();
  afficherLicence();
  message('Enregistré');
}

async function choisirImageDocument(cle, chemin) {
  if (sansNatif()) return;
  try {
    if (!(await obtenirImage('galerie', chemin))) return;
    licence[cle] = chemin;
    await sauver();
    afficherLicence();
    message('Image enregistrée');
  } catch (e) { erreurPhoto(e); }
}

function numeroEnGrand() {
  if (!licence.numero) { message("Enregistre d'abord ton numéro de licence."); return; }
  $('grandNumeroTexte').textContent = licence.numero;
  $('grandNumeroTexte').style.fontSize = Math.min(24, 130 / licence.numero.length) + 'vw';
  $('grandNumero').classList.remove('cache');
}

// =====================================================================
// Mes papiers
// =====================================================================

function nomCategoriePapier(id) { const c = CATEGORIES_PAPIERS.find((x) => x.id === id); return c ? c.nom : 'Autre'; }

function afficherPapiers() {
  const zone = $('listePapiers');
  zone.innerHTML = '';
  if (!papiers.length) zone.innerHTML = '<div class="vide">Aucun papier pour le moment.</div>';
  CATEGORIES_PAPIERS.forEach((cat) => {
    const liste = papiers.filter((p) => p.categorie === cat.id);
    if (!liste.length) return;
    const titre = document.createElement('h2');
    titre.textContent = cat.nom;
    zone.appendChild(titre);
    liste.forEach((p) => {
      const j = p.fin ? joursAvant(p.fin) : null;
      const etat = p.fin ? (j < 0 ? ' — expiré' : '') : '';
      const div = document.createElement('div');
      div.className = 'carte ligneListe';
      div.innerHTML = `
        <img class="miniature" alt="">
        <div class="milieu">
          <div class="haut">${html(p.titre || cat.nom)}</div>
          <div class="bas">${p.fin ? 'Jusqu\'au ' + dateFr(p.fin) + etat : 'Sans date de fin'} · ${pluriel(p.docs.length, 'document')}</div>
        </div>`;
      const img = div.querySelector('img');
      if (p.docs.length) afficherImage(img, p.docs[0]); else img.style.visibility = 'hidden';
      div.onclick = () => ouvrirPapier(p.id);
      zone.appendChild(div);
    });
  });
  montrer('papiers');
}

function texteRappel() {
  const cat = CATEGORIES_PAPIERS.find((c) => c.id === $('papierCategorie').value);
  $('aideRappel').textContent = cat && cat.id === 'autorisation'
    ? 'Rappel chaque mois, à partir de 7 mois avant la fin.'
    : 'Rappel 2 mois puis 1 mois avant la fin.';
}

function ouvrirFormulairePapier(modifier) {
  papierEnModification = modifier;
  const p = modifier && papierActif ? papierActif : { categorie: 'armes', titre: '', fin: '', notes: '' };
  $('papierCategorie').innerHTML = CATEGORIES_PAPIERS.map((c) => `<option value="${c.id}">${html(c.nom)}</option>`).join('');
  $('papierCategorie').value = p.categorie;
  $('papierTitre').value = p.titre;
  $('papierFin').value = p.fin;
  $('papierNotes').value = p.notes;
  texteRappel();
  montrer('papierform');
}

async function enregistrerPapier() {
  const valeurs = {
    categorie: $('papierCategorie').value,
    titre: $('papierTitre').value.trim(),
    fin: $('papierFin').value,
    notes: $('papierNotes').value.trim()
  };
  if (papierEnModification && papierActif) Object.assign(papierActif, valeurs);
  else { papierActif = Object.assign({ id: Date.now(), docs: [] }, valeurs); papiers.push(papierActif); }
  await sauver();
  await programmerRappels();
  ouvrirPapier(papierActif.id);
}

function ouvrirPapier(id) {
  papierActif = papiers.find((p) => p.id === id);
  if (!papierActif) return afficherPapiers();
  papierEnModification = false;
  const p = papierActif;
  $('resumePapier').innerHTML = `
    <div class="haut">${html(p.titre || nomCategoriePapier(p.categorie))}</div>
    <div class="bas">${html(nomCategoriePapier(p.categorie))}</div>
    ${p.fin ? `<div class="bas">Valable jusqu'au ${dateFr(p.fin)}</div>` : ''}
    ${p.notes ? `<div class="notes">${html(p.notes)}</div>` : ''}`;
  const grille = $('grillePapier');
  grille.innerHTML = '';
  p.docs.forEach((nom) => {
    grille.appendChild(vignette(nom, async () => {
      p.docs = p.docs.filter((d) => d !== nom);
      await sauver();
      ouvrirPapier(p.id);
    }));
  });
  montrer('papier');
}

async function documentPapier(source) {
  if (sansNatif()) return;
  const p = papierActif;
  try {
    const nom = `Papiers/${nettoyer(p.titre || p.categorie) || 'Papier'}_${Date.now()}.jpg`;
    if (!(await obtenirImage(source, nom))) return;
    p.docs.push(nom);
    await sauver();
    ouvrirPapier(p.id);
    message('Document ajouté');
  } catch (e) { erreurPhoto(e); }
}

async function supprimerPapier() {
  if (!papierActif) return;
  if (!confirm('Supprimer ce papier ?\nLes images restent dans Documents/TirCoach/Papiers.')) return;
  papiers = papiers.filter((p) => p.id !== papierActif.id);
  papierActif = null;
  await sauver();
  await programmerRappels();
  afficherPapiers();
}

// =====================================================================
// Partage, sauvegarde, premier lancement
// =====================================================================

async function partagerAppli() {
  const texte = "Tir Coach : le carnet de tir gratuit et 100 % local (séances, cibles, râtelier, munitions, licence…). À télécharger ici :";
  try {
    if (natif && P.Share) { await P.Share.share({ title: 'Tir Coach', text: texte, url: PLAY_STORE, dialogTitle: "Partager Tir Coach" }); return; }
    if (navigator.share) { await navigator.share({ title: 'Tir Coach', text: texte, url: PLAY_STORE }); return; }
  } catch (e) { return; }
  message(PLAY_STORE);
}

async function exporterSauvegarde() {
  await sauver();
  if (!natif) { message('Ça marche seulement dans l\'appli Android.'); return; }
  try {
    const nom = `TirCoach-sauvegarde-${aujourdhui()}.json`;
    const r = await P.Filesystem.writeFile({ path: nom, data: JSON.stringify(donneesCompletes(), null, 2), directory: 'CACHE', encoding: 'utf8' });
    await P.Share.share({ title: 'Sauvegarde Tir Coach', text: 'Ma sauvegarde Tir Coach', files: [r.uri], dialogTitle: 'Envoyer la sauvegarde' });
  } catch (e) {
    if (!/cancel/i.test(String(e && e.message))) message('Export impossible : ' + ((e && e.message) || e));
  }
}

function restaurerSauvegarde(fichier) {
  const lecteur = new FileReader();
  lecteur.onload = async () => {
    try {
      const d = JSON.parse(lecteur.result);
      if (!d || !Array.isArray(d.seances)) throw new Error('fichier non reconnu');
      if (!confirm(`Remplacer toutes les données de l'appli par cette sauvegarde ?\n(${pluriel(d.seances.length, 'séance')}, ${pluriel((d.armes || []).length, 'arme')})`)) return;
      seances = migrerSeances(d.seances);
      armes = d.armes || [];
      munitions = d.munitions || [];
      standsPerso = d.standsPerso || [];
      controles = (d.controles || []).filter((c) => !String(c.id).startsWith('base-'));
      licence = Object.assign({ numero: '', fin: '', image: '', certificatFin: '', certificatImage: '' }, d.licence || {});
      papiers = d.papiers || [];
      await sauver();
      await programmerRappels();
      message('Sauvegarde restaurée');
      montrer('menu');
    } catch (e) { message('Restauration impossible : ' + e.message); }
  };
  lecteur.readAsText(fichier);
}

function verifierAccord() {
  const ok = () => { $('btnAccord').disabled = !($('accord1').checked && $('accord2').checked); };
  $('accord1').onchange = ok;
  $('accord2').onchange = ok;
  $('btnAccord').onclick = () => {
    try { localStorage.setItem(CLES.accord, JSON.stringify({ date: new Date().toISOString() })); } catch (e) {}
    $('ecranBienvenue').classList.add('cache');
    programmerRappels();
  };
  if (!charger(CLES.accord, null)) $('ecranBienvenue').classList.remove('cache');
}

// =====================================================================
// Jeu de précision (repris du site du T.A.A., scores en local)
// =====================================================================

const jeu = { coups: [], score: 0, fini: true, ph: [], lance: false };

function viseurJeu(t) {
  const c = $('jCible'), R = c.width / 2 - 12, CX = c.width / 2, s = t / 1000 * 1.35, a = R * 0.42, ph = jeu.ph;
  return [CX + a * (0.55 * Math.sin(s * 1.3 + ph[0]) + 0.3 * Math.sin(s * 3.7 + ph[1]) + 0.15 * Math.sin(s * 8.1)),
          CX + a * (0.55 * Math.cos(s * 1.1 + ph[2]) + 0.3 * Math.sin(s * 4.3 + ph[3]) + 0.15 * Math.cos(s * 7.3))];
}

function pointsJeu(px, py) {
  const c = $('jCible'), R = c.width / 2 - 12, CX = c.width / 2;
  const p = 10 - Math.floor(Math.hypot(px - CX, py - CX) / (R / 10));
  return p < 0 ? 0 : p;
}

function dessinJeu(t) {
  const c = $('jCible'), x = c.getContext('2d'), W = c.width, R = W / 2 - 12, CX = W / 2;
  x.clearRect(0, 0, W, W);
  for (let k = 10; k >= 1; k--) {
    const r = R * k / 10;
    x.beginPath(); x.arc(CX, CX, r, 0, 7);
    x.fillStyle = k <= 4 ? '#111' : '#f4f1e8'; x.fill();
    x.lineWidth = 1.2; x.strokeStyle = k <= 4 ? '#eee' : '#333'; x.stroke();
    if (k > 1) {
      x.fillStyle = k <= 4 ? '#eee' : '#333'; x.font = (R / 16) + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(11 - k, CX + r - R / 20, CX);
    }
  }
  jeu.coups.forEach((p) => { x.beginPath(); x.arc(p[0], p[1], 7, 0, 7); x.fillStyle = '#d62828'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#fff'; x.stroke(); });
  if (!jeu.fini) {
    const v = viseurJeu(t);
    x.strokeStyle = '#d62828'; x.lineWidth = 2.5;
    x.beginPath(); x.arc(v[0], v[1], 26, 0, 7); x.stroke();
    x.beginPath();
    x.moveTo(v[0] - 40, v[1]); x.lineTo(v[0] - 10, v[1]); x.moveTo(v[0] + 10, v[1]); x.lineTo(v[0] + 40, v[1]);
    x.moveTo(v[0], v[1] - 40); x.lineTo(v[0], v[1] - 10); x.moveTo(v[0], v[1] + 10); x.lineTo(v[0], v[1] + 40);
    x.stroke();
  }
  if (ecran === 'jeu') requestAnimationFrame(dessinJeu); else jeu.lance = false;
}

function nouvellePartie() {
  jeu.coups = []; jeu.score = 0; jeu.fini = false;
  jeu.ph = [0, 0, 0, 0].map(() => Math.random() * 9);
  $('jScore').textContent = '0';
  $('jCoup').textContent = '1';
  $('jTir').classList.remove('cache');
  $('jFin').classList.add('cache');
}

function ouvrirJeu() {
  nouvellePartie();
  afficherScores();
  montrer('jeu');
  if (!jeu.lance) { jeu.lance = true; requestAnimationFrame(dessinJeu); }
}

function tirerJeu() {
  if (jeu.fini) return;
  const v = viseurJeu(performance.now());
  jeu.coups.push(v);
  jeu.score += pointsJeu(v[0], v[1]);
  $('jScore').textContent = jeu.score;
  if (jeu.coups.length >= 5) {
    jeu.fini = true;
    $('jTotal').textContent = jeu.score + ' / 50';
    $('jMot').textContent = jeu.score >= 45 ? '🏅 Tireur d\'élite !' : jeu.score >= 38 ? '👏 Très beau groupement !'
      : jeu.score >= 28 ? '👍 Pas mal, continue !' : '😅 Le stand t\'attend pour progresser !';
    $('jNom').value = charger('tircoach-pseudo', '');
    $('jEnregistrer').classList.remove('cache');
    $('jTir').classList.add('cache');
    $('jFin').classList.remove('cache');
  } else {
    $('jCoup').textContent = jeu.coups.length + 1;
  }
}

function afficherScores() {
  const scores = charger(CLES.scores, []);
  $('jClassement').innerHTML = scores.length
    ? scores.slice(0, 10).map((e, i) => `<li><span class="rang">${['🥇', '🥈', '🥉'][i] || (i + 1)}</span><span class="nom">${html(e.nom)}</span><b>${e.score}</b></li>`).join('')
    : '<li class="aide">Aucun score pour l\'instant. À toi de jouer !</li>';
}

function enregistrerScore() {
  const nom = $('jNom').value.trim() || 'Moi';
  const scores = charger(CLES.scores, []);
  scores.push({ nom, score: jeu.score, date: aujourdhui() });
  scores.sort((a, b) => b.score - a.score);
  try {
    localStorage.setItem(CLES.scores, JSON.stringify(scores.slice(0, 50)));
    localStorage.setItem('tircoach-pseudo', JSON.stringify(nom));
  } catch (e) {}
  $('jEnregistrer').classList.add('cache');
  afficherScores();
  message('Score enregistré');
}

// =====================================================================
// Apprendre
// =====================================================================

function afficherApprendre() {
  const zone = $('listeApprendre');
  if (!zone.childElementCount) {
    APPRENDRE.forEach((section) => {
      const d = document.createElement('details');
      d.className = 'carte theme';
      d.innerHTML = `<summary>${html(section.titre)}</summary>
        ${section.image ? `<img class="dessinHaut" src="images/calibres/${section.image}.svg" alt="">` : ''}
        <dl>${section.termes.map(([terme, def, img, lien]) => `
          <dt>${html(terme)}</dt>
          ${img ? `<dd class="dessin"><img src="images/calibres/${img}.svg" alt=""></dd>` : ''}
          <dd>${html(def)}${lien ? ` <a href="${lien}" target="_blank" rel="noopener">Service-public.fr →</a>` : ''}</dd>`).join('')}
        </dl>`;
      zone.appendChild(d);
    });
  }
  montrer('apprendre');
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
      case 'apprendre': afficherApprendre(); break;
      case 'papiers': afficherPapiers(); break;
      case 'jeu': ouvrirJeu(); break;
      case 'infos': depuisMenu = true; montrer('infos'); break;
      default: message('Cette partie arrive bientôt.');
    }
  };
});

$('btnNouvelle').onclick = () => ouvrirFormulaire(false);
$('btnEnregistrer').onclick = enregistrerSeance;
$('btnModifier').onclick = () => ouvrirFormulaire(true);
$('btnAjoutTir').onclick = () => ouvrirFormulaireTir(false);
$('btnEnregistrerTir').onclick = enregistrerTir;
$('btnSupprimerTir').onclick = supprimerTir;
$('btnSupprimer').onclick = supprimerSeance;

$('btnNouvelleArme').onclick = () => ouvrirFormulaireArme(false);
$('btnEnregistrerArme').onclick = enregistrerArme;
$('btnModifierArme').onclick = () => ouvrirFormulaireArme(true);
$('btnPhotoArme').onclick = () => imageArme('photo');
$('btnGalerieArme').onclick = () => imageArme('galerie');
$('btnAjoutModif').onclick = () => ajouterJournal('modifs');
$('btnAjoutEntretien').onclick = () => ajouterJournal('entretiens');
$('btnSupprimerArme').onclick = supprimerArme;

$('btnAjoutStock').onclick = ajouterMunition;

$('btnNouveauStand').onclick = () => ouvrirFormulaireStand(false);
$('btnModifierStand').onclick = () => ouvrirFormulaireStand(true);
$('btnEnregistrerStand').onclick = enregistrerStand;
$('btnSupprimerStand').onclick = supprimerStand;
$('btnProposerStand').onclick = proposerStand;

$('controleStand').onchange = afficherControles;
$('btnAjoutControle').onclick = ajouterControle;
$('btnProposerControles').onclick = proposerControles;

$('btnEnregistrerLicence').onclick = enregistrerLicence;
$('btnChoisirLicence').onclick = () => choisirImageDocument('image', 'Papiers/licence.jpg');
$('btnChoisirCertificat').onclick = () => choisirImageDocument('certificatImage', 'Papiers/certificat-medical.jpg');
$('btnNumeroGrand').onclick = numeroEnGrand;
$('grandNumero').onclick = () => $('grandNumero').classList.add('cache');

$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');

if (natif && P.App) {
  P.App.addListener('backButton', () => { if (!retour()) P.App.exitApp(); });
}

$('btnInfos').onclick = () => { depuisMenu = false; montrer('infos'); };
$('btnPartager').onclick = partagerAppli;
$('jTir').onclick = tirerJeu;
$('jCible').onclick = tirerJeu;
$('jRejouer').onclick = nouvellePartie;
$('jEnregistrer').onclick = enregistrerScore;
$('btnExporter').onclick = exporterSauvegarde;
$('btnRestaurer').onclick = () => $('fichierRestauration').click();
$('fichierRestauration').onchange = (e) => { if (e.target.files[0]) restaurerSauvegarde(e.target.files[0]); e.target.value = ''; };

$('btnNouveauPapier').onclick = () => ouvrirFormulairePapier(false);
$('btnEnregistrerPapier').onclick = enregistrerPapier;
$('btnModifierPapier').onclick = () => ouvrirFormulairePapier(true);
$('btnPhotoPapier').onclick = () => documentPapier('photo');
$('btnGaleriePapier').onclick = () => documentPapier('galerie');
$('btnSupprimerPapier').onclick = supprimerPapier;
$('papierCategorie').onchange = texteRappel;

async function afficherVersion() {
  let v = '';
  try { if (natif && P.App) v = (await P.App.getInfo()).version; } catch (e) {}
  document.querySelectorAll('.version').forEach((el) => { el.textContent = v ? 'v' + v : 'version web'; });
}

afficherVersion();
verifierAccord();
if (charger(CLES.accord, null)) programmerRappels();
montrer('accueil');
