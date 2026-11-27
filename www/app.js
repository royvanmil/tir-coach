// Tir Coach — V16
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
  scores: 'tircoach-scores',
  notes: 'tircoach-notes'
};

// =====================================================================
// Base de données intégrée (mise à jour avec l'appli)
// =====================================================================

// Le T.A.A. Eauze reste dans le code, caché tant que le club n'a pas donné son accord
const AFFICHER_TAA = false;

const STANDS_BASE_TOUS = [
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
const CONTROLES_BASE_TOUS = ['2026-10-04', '2026-11-07', '2026-12-06', '2027-01-02', '2027-02-07', '2027-03-06',
  '2027-04-04', '2027-05-01', '2027-06-06', '2027-07-03', '2027-08-01']
  .map((date) => ({ standId: 'taa-eauze', date, notes: 'Repas du midi possible, sur réservation' }));
const STANDS_BASE = STANDS_BASE_TOUS.filter((s) => AFFICHER_TAA || s.id !== 'taa-eauze');
const CONTROLES_BASE = CONTROLES_BASE_TOUS.filter((c) => AFFICHER_TAA || c.standId !== 'taa-eauze');
const CONTROLES_INFO = {
  'taa-eauze': 'Saison 2026/2027. Sauf changement en raison de manifestations hippiques.'
};

// Calibres (les anciens identifiants restent valables)
const CALIBRES = [
  ['Air comprimé', 'plomb45', '4,5 mm (.177)'], ['Air comprimé', 'plomb55', '5,5 mm (.22)'],
  ['Petits calibres', '22lr', '22 LR'], ['Petits calibres', '22short', '.22 Short'], ['Petits calibres', '22wmr', '.22 WMR (22 Magnum)'],
  ['Petits calibres', '17hmr', '.17 HMR'],
  ['Armes de poing', '635', '6,35 mm (.25 ACP)'], ['Armes de poing', '765', '7,65 mm Browning (.32 ACP)'],
  ['Armes de poing', '32sw', '.32 S&W Long'], ['Armes de poing', '380', '9 mm Court (.380 ACP)'],
  ['Armes de poing', '9mak', '9×18 Makarov'], ['Armes de poing', '9mm', '9 mm (9×19)'], ['Armes de poing', '921', '9×21 IMI'],
  ['Armes de poing', '357sig', '.357 SIG'], ['Armes de poing', '38sp', '.38 Special'], ['Armes de poing', '357mag', '.357 Magnum'],
  ['Armes de poing', '40sw', '.40 S&W'], ['Armes de poing', '10mm', '10 mm Auto'], ['Armes de poing', '44sp', '.44 Special'],
  ['Armes de poing', '44mag', '.44 Magnum'], ['Armes de poing', '45acp', '.45 ACP'], ['Armes de poing', '45colt', '.45 Colt'],
  ['Armes de poing', '454', '.454 Casull'], ['Armes de poing', '500sw', '.500 S&W Magnum'],
  ['Armes de poing', '762tok', '7,62×25 Tokarev'], ['Armes de poing', '57', '5,7×28'],
  ['Armes d\'épaule', '30car', '.30 Carbine'], ['Armes d\'épaule', '222', '.222 Remington'], ['Armes d\'épaule', '223', '.223 Rem / 5,56×45'],
  ['Armes d\'épaule', '22250', '.22-250 Remington'], ['Armes d\'épaule', '243', '.243 Winchester'], ['Armes d\'épaule', '6br', '6 mm BR'],
  ['Armes d\'épaule', '65cm', '6,5 Creedmoor'], ['Armes d\'épaule', '6555', '6,5×55 Suédois'], ['Armes d\'épaule', '65prc', '6,5 PRC'],
  ['Armes d\'épaule', '270', '.270 Winchester'], ['Armes d\'épaule', '708', '7 mm-08 Remington'], ['Armes d\'épaule', '757', '7×57 Mauser'],
  ['Armes d\'épaule', '764', '7×64'], ['Armes d\'épaule', '7rm', '7 mm Remington Magnum'], ['Armes d\'épaule', '300blk', '.300 Blackout'],
  ['Armes d\'épaule', '76239', '7,62×39'], ['Armes d\'épaule', '308', '.308 Win / 7,62×51'], ['Armes d\'épaule', '3006', '.30-06 Springfield'],
  ['Armes d\'épaule', '76254', '7,62×54R'], ['Armes d\'épaule', '303', '.303 British'], ['Armes d\'épaule', '300wm', '.300 Winchester Magnum'],
  ['Armes d\'épaule', '300wsm', '.300 WSM'], ['Armes d\'épaule', '300prc', '.300 PRC'], ['Armes d\'épaule', '857', '8×57 IS'],
  ['Armes d\'épaule', '9362', '9,3×62'], ['Armes d\'épaule', '9374', '9,3×74R'], ['Armes d\'épaule', '338lm', '.338 Lapua Magnum'],
  ['Armes d\'épaule', '4570', '.45-70 Government'], ['Armes d\'épaule', '50bmg', '.50 BMG (12,7×99)'],
  ['Fusils', 'cal12', 'Calibre 12'], ['Fusils', 'cal16', 'Calibre 16'], ['Fusils', 'cal20', 'Calibre 20'], ['Fusils', '410', '.410 (calibre 36)'],
  ['Poudre noire', 'pn36', '.36 poudre noire'], ['Poudre noire', 'pn44', '.44 poudre noire'], ['Poudre noire', 'pn45', '.45 poudre noire'],
  ['Poudre noire', 'pn58', '.58 poudre noire']
].map(([g, id, nom]) => ({ g, id, nom }));
const TYPES_ACCESSOIRES = ['Red dot', 'Lunette', 'Détente allégée (connecteur)', 'Silencieux / modérateur', 'Lampe', 'Laser', 'Bipied', 'Poignée', 'Chargeur grande capacité'];
const CIBLES = ['C50', 'C200', 'TAR'];
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
// Tant que l'appli n'est pas sur Google Play : partage du site, avis par mail
const SUR_PLAY_STORE = false;
const SITE_APPLI = 'https://royvanmil.fr/tir-coach/';
const LIEN_PARTAGE = SUR_PLAY_STORE ? PLAY_STORE : SITE_APPLI;
const LIEN_AVIS = SUR_PLAY_STORE ? PLAY_STORE : 'https://royvanmil.fr/tir-coach/avis.html';


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
  { titre: '📐 MOA, MRAD et clics', termes: [
    ['Le principe', "MOA et MRAD sont des angles. Plus la cible est loin, plus un même angle fait de centimètres sur la cible."],
    ['1 MOA', "≈ 2,9 cm à 100 m. Donc ≈ 1,45 cm à 50 m, et ≈ 5,8 cm à 200 m."],
    ['1 MRAD', "= 10 cm à 100 m. Donc 5 cm à 50 m, et 20 cm à 200 m."],
    ['Un clic', "C'est écrit sur la tourelle : souvent ¼ MOA ou 0,1 MRAD par clic. Une lunette en MRAD avec un réticule en MRAD, c'est le plus simple."],
    ['La méthode', "1. Tire un groupement de 3 à 5 coups. 2. Mesure l'écart entre le centre du groupe et le centre de la cible, en hauteur et sur le côté. 3. Divise par la valeur d'un clic à cette distance. 4. Tourne la tourelle dans le sens indiqué (UP = la balle monte, R = la balle va à droite)."],
    ['Exemple', "À 100 m, groupe 5 cm trop bas, clics de ¼ MOA (0,73 cm) : 5 ÷ 0,73 ≈ 7 clics vers le haut (UP)."]
  ], html: `
    <table class="tableauClics">
      <tr><th>1 clic =</th><th>50 m</th><th>100 m</th><th>200 m</th></tr>
      <tr><td>⅛ MOA</td><td>0,18 cm</td><td>0,36 cm</td><td>0,73 cm</td></tr>
      <tr><td>¼ MOA</td><td>0,36 cm</td><td>0,73 cm</td><td>1,45 cm</td></tr>
      <tr><td>½ MOA</td><td>0,73 cm</td><td>1,45 cm</td><td>2,9 cm</td></tr>
      <tr><td>1 MOA</td><td>1,45 cm</td><td>2,9 cm</td><td>5,8 cm</td></tr>
      <tr><td>0,05 MRAD</td><td>0,25 cm</td><td>0,5 cm</td><td>1 cm</td></tr>
      <tr><td>0,1 MRAD</td><td>0,5 cm</td><td>1 cm</td><td>2 cm</td></tr>
      <tr><td>1 MRAD</td><td>5 cm</td><td>10 cm</td><td>20 cm</td></tr>
    </table>
    <div class="calcClics">
      <b>Calcule tes clics</b>
      <label>Distance (m)<input type="number" id="ccDistance" inputmode="numeric" value="100"></label>
      <label>Écart mesuré sur la cible (cm)<input type="number" id="ccEcart" inputmode="decimal" placeholder="ex. 5"></label>
      <label>Valeur d'un clic
        <select id="ccClic">
          <option value="0.25">¼ MOA</option><option value="0.125">⅛ MOA</option><option value="0.5">½ MOA</option>
          <option value="m0.1">0,1 MRAD</option><option value="m0.05">0,05 MRAD</option>
        </select>
      </label>
      <div id="ccResultat" class="resultat"></div>
    </div>` },
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
let notesBloc = charger(CLES.notes, []);
let licence = Object.assign({ numero: '', fin: '', image: '', certificatFin: '', certificatImage: '' }, charger(CLES.licence, {}));

let seanceActive = null;
let tirActif = null;
let armeActive = null;
let standActif = null;
let papierActif = null;
let papierEnModification = false;
let noteActive = null;
let notesVisibles = new Set();
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
  return { appli: 'Tir Coach', version: 16, date: new Date().toISOString(), seances, armes, munitions, standsPerso, controles, licence, papiers, notes: notesBloc };
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
    localStorage.setItem(CLES.notes, JSON.stringify(notesBloc));
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

// Liste déroulante avec « Autre… » : la case texte s'ouvre et c'est ce texte qui est gardé
function normal(t) { return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function remplirSelectAutre(sel, inp, options, valeur, vide) {
  // options : [{ id, nom, g? }]
  const groupes = [];
  options.forEach((o) => { const g = o.g || ''; let x = groupes.find((y) => y.g === g); if (!x) { x = { g, liste: [] }; groupes.push(x); } x.liste.push(o); });
  $(sel).innerHTML = (vide ? `<option value="">${html(vide)}</option>` : '') +
    groupes.map((x) => {
      const opts = x.liste.map((o) => `<option value="${html(o.id)}">${html(o.nom)}</option>`).join('');
      return x.g ? `<optgroup label="${html(x.g)}">${opts}</optgroup>` : opts;
    }).join('') + '<option value="autre">Autre… (à écrire)</option>';
  let v = valeur || '';
  if (v && v !== 'autre' && !options.some((o) => o.id === v)) {
    const nv = normal(v);
    const egal = options.find((o) => normal(o.nom) === nv || normal(o.id) === nv);
    const debut = nv.length >= 2 ? options.filter((o) => normal(o.nom).startsWith(nv)) : [];
    const trouve = egal || (debut.length === 1 ? debut[0] : null);
    if (trouve) v = trouve.id;
  }
  if (v && v !== 'autre' && !options.some((o) => o.id === v)) { $(sel).value = 'autre'; $(inp).value = valeur; }
  else { $(sel).value = v; $(inp).value = ''; }
  $(inp).classList.toggle('cache', $(sel).value !== 'autre');
  $(sel).onchange = () => { $(inp).classList.toggle('cache', $(sel).value !== 'autre'); if ($(sel).value === 'autre') $(inp).focus(); if ($(sel).onchangeSuite) $(sel).onchangeSuite(); };
}
function lireSelectAutre(sel, inp) {
  return $(sel).value === 'autre' ? $(inp).value.trim() : $(sel).value;
}
function remplirCalibres(sel, inp, valeur) { remplirSelectAutre(sel, inp, CALIBRES, valeur, 'Calibre…'); }

function envoyerMail(sujet, corps) {
  window.location.href = `mailto:${EMAIL_PROPOSITIONS}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}

// ---------- Photos ----------

async function afficherImage(img, nom) {
  if (!natif || !nom) return;
  if (/\.pdf$/i.test(nom)) nom = nom.replace(/\.pdf$/i, '.jpg');
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
  $('visionneuse').classList.remove('tourne', 'avecPdf');
  $('pagesPdf').classList.add('cache');
  $('pagesPdf').innerHTML = '';
  $('imageGrande').classList.remove('cache');
  $('visionneuse').classList.remove('cache');
  if (/\.pdf$/i.test(nom)) { voirPdf(nom); return; }
  afficherImage($('imageGrande'), nom);
}

// ---------- PDF (affichage avec pdf.js, inclus dans l'appli) ----------
let pdfjs = null;
async function chargerPdfjs() {
  if (!pdfjs) {
    pdfjs = await import('./lib/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.mjs';
  }
  return pdfjs;
}
function base64EnOctets(b64) {
  const bin = atob(b64); const o = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i);
  return o;
}
async function pagesPdf(b64, max, largeur) {
  const lib = await chargerPdfjs();
  const doc = await lib.getDocument({ data: base64EnOctets(b64) }).promise;
  const toiles = [];
  for (let n = 1; n <= Math.min(doc.numPages, max); n++) {
    const page = await doc.getPage(n);
    const v1 = page.getViewport({ scale: 1 });
    const vue = page.getViewport({ scale: largeur / v1.width });
    const c = document.createElement('canvas');
    c.width = Math.round(vue.width); c.height = Math.round(vue.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vue }).promise;
    toiles.push(c);
  }
  return toiles;
}
async function voirPdf(nom) {
  $('imageGrande').classList.add('cache');
  $('visionneuse').classList.add('avecPdf');
  $('pagesPdf').classList.remove('cache');
  $('pagesPdf').innerHTML = '<p>Ouverture du PDF…</p>';
  try {
    const r = await P.Filesystem.readFile({ path: DOSSIER + '/' + nom, directory: 'DOCUMENTS' });
    const toiles = await pagesPdf(r.data, 30, 1400);
    $('pagesPdf').innerHTML = '';
    toiles.forEach((c) => $('pagesPdf').appendChild(c));
  } catch (e) { $('pagesPdf').innerHTML = '<p>Impossible d\'ouvrir ce PDF.</p>'; }
}

// Choisir une image ou un PDF dans les fichiers du téléphone. Renvoie le nom enregistré (ou '').
function choisirFichier() {
  return new Promise((ok) => {
    const inp = $('choixFichier');
    inp.value = '';
    inp.onchange = () => ok(inp.files[0] || null);
    inp.click();
  });
}
function lireEnBase64(fichier) {
  return new Promise((ok, ko) => {
    const l = new FileReader();
    l.onload = () => ok(String(l.result).split(',')[1]);
    l.onerror = ko;
    l.readAsDataURL(fichier);
  });
}
async function enregistrerFichier(fichier, cheminSansExt) {
  const estPdf = fichier.type === 'application/pdf' || /\.pdf$/i.test(fichier.name);
  const data = await lireEnBase64(fichier);
  const ecrire = (chemin, d) => P.Filesystem.writeFile({ path: DOSSIER + '/' + chemin, data: d, directory: 'DOCUMENTS', recursive: true });
  if (estPdf) {
    await ecrire(cheminSansExt + '.pdf', data);
    try {
      const [c] = await pagesPdf(data, 1, 1000);
      await ecrire(cheminSansExt + '.jpg', c.toDataURL('image/jpeg', 0.85).split(',')[1]);
    } catch (e) {}
    return cheminSansExt + '.pdf';
  }
  await ecrire(cheminSansExt + '.jpg', data);
  return cheminSansExt + '.jpg';
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
      <div class="boutonsAvis"><a class="petit" href="${LIEN_AVIS}" target="_blank" rel="noopener">Laisser un avis</a>
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
            schedule: { at: jour, allowWhileIdle: true },
            // Rappels des mois à l'avance : pas besoin d'alarme exacte (sinon Android ouvre « Alarmes et rappels »)
            isExactNotification: false
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
  'Munitions', 'Stands', 'Stand', 'StandForm', 'Controles', 'Licence', 'Demarches', 'Apprendre', 'Infos', 'Papiers', 'PapierForm', 'Papier', 'Jeu', 'Notes', 'NoteForm'];
const TITRES = {
  menu: 'Tir Coach', carnet: 'Carnet de tir', seance: 'Séance', ratelier: 'Mon râtelier', arme: 'Arme',
  munitions: 'Munitions', stands: 'Stands & ouvertures', stand: 'Stand', controles: 'Dates tirs de contrôle', notes: 'Bloc-notes',
  licence: 'Licence & certificat', demarches: 'Démarches', apprendre: 'Apprendre', infos: 'À propos', papiers: 'Mes papiers', papier: 'Papier', jeu: 'Jeu de précision'
};

function montrer(nom) {
  const memeEcran = nom === ecran; // même écran redessiné après une action : on garde la position
  ecran = nom;
  $('ecranAccueil').classList.toggle('cache', nom !== 'accueil');
  $('entete').classList.toggle('cache', nom === 'accueil');
  ECRANS.forEach((e) => $('ecran' + e).classList.toggle('cache', e.toLowerCase() !== nom));
  const titres = {
    form: enModification ? 'Modifier la séance' : 'Nouvelle séance',
    tirform: tirEnModification ? "Modifier l'arme tirée" : 'Arme tirée',
    armeform: armeEnModification ? "Modifier l'arme" : 'Nouvelle arme',
    standform: standEnModification ? 'Modifier le stand' : 'Nouveau stand',
    papierform: papierEnModification ? 'Modifier le papier' : 'Nouveau papier',
    noteform: noteActive ? 'Modifier la note' : 'Nouvelle note'
  };
  $('titre').textContent = titres[nom] || TITRES[nom] || 'Tir Coach';
  if (nom === 'menu') afficherAlertes();
  if (!memeEcran) window.scrollTo(0, 0);
}

function retour() {
  for (const id of ['visionneuse', 'grandNumero']) {
    if (!$(id).classList.contains('cache')) { $(id).classList.add('cache'); return true; }
  }
  switch (ecran) {
    case 'menu': montrer('accueil'); return true;
    case 'infos': montrer(depuisMenu ? 'menu' : 'accueil'); return true;
    case 'carnet': case 'ratelier': case 'munitions': case 'stands':
    case 'controles': case 'licence': case 'demarches': case 'apprendre': case 'papiers': case 'jeu': case 'notes': montrer('menu'); return true;
    case 'noteform': afficherNotes(); return true;
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

// Tirs d'assiduité : chaque séance au stand compte ; 3 séances sur la saison (1er sept → 31 août), espacées d'au moins 2 mois
function saisonCourante() {
  const a = aujourdhui(); const an = parseInt(a.slice(0, 4), 10); const mois = parseInt(a.slice(5, 7), 10);
  const debut = mois >= 9 ? an : an - 1;
  return { debut: `${debut}-09-01`, fin: `${debut + 1}-08-31`, nom: `${debut}-${debut + 1}` };
}
function bilanAssiduite() {
  const sa = saisonCourante();
  const dates = [...new Set(seances.map((s) => s.date).filter((d) => d >= sa.debut && d <= sa.fin && d <= aujourdhui()))].sort();
  const valables = [];
  dates.forEach((d) => { if (!valables.length || d >= decalerMois(valables[valables.length - 1], 2)) valables.push(d); });
  return { saison: sa, valables };
}

function afficherCompteur() {
  const { saison, valables } = bilanAssiduite();
  const n = Math.min(valables.length, 3);
  const prochain = valables.length ? decalerMois(valables[valables.length - 1], 2) : '';
  $('compteurControles').className = 'carte assiduite';
  $('compteurControles').innerHTML = `
    <div class="ligneListe">
      <div class="milieu">
        <div class="haut">Tirs d'assiduité — saison ${saison.nom}</div>
        ${n >= 3 ? '<div class="bas">3 séances valables ✓</div>'
          : prochain ? `<div class="bas">La prochaine séance compte à partir du ${dateFr(prochain)}</div>`
          : '<div class="bas">Aucune séance cette saison pour le moment</div>'}
        ${valables.length ? `<div class="datesComptees">Comptées : ${valables.slice(0, 3).map(dateFr).join(' · ')}</div>` : ''}
      </div>
      <div class="compteur">${n}/3</div>
    </div>
    <p class="regle">Chaque passage au stand compte (cahier de présence ou badgeuse). Il faut 3 séances sur la saison sportive (1er septembre → 31 août), espacées d'au moins 2 mois. Vérifie le règlement de ton club.</p>`;
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

function ouvrirFormulaire(modifier) {
  enModification = modifier;
  remplirListe('listeLieux', [...tousLesStands().map((s) => s.nom), ...seances.map((s) => s.lieu)]);
  const der = seances[seances.length - 1] || {};
  const s = modifier && seanceActive ? seanceActive
    : { date: aujourdhui(), lieu: der.lieu || '', note: 0, notes: '' };
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

function carteTir(t) {
  const notes = t.photos.map((p) => parseFloat(p.score)).filter((n) => !isNaN(n));
  const total = notes.reduce((a, b) => a + b, 0);
  const infos = [[t.calibre ? nomCalibre(t.calibre) : '', t.munition].filter(Boolean).join(' · '), [t.distance ? t.distance + ' m' : '', t.cible].filter(Boolean).join(' · ')].filter(Boolean);
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
  remplirListe('listeArmes', tousTirs.filter((t) => !t.armeId).map((t) => t.arme));
  remplirListe('listeMunitions', [...munitions.map((m) => m.nom), ...tousTirs.map((t) => t.munition)]);
  let t;
  if (modifier && tirActif) {
    t = tirActif;
  } else {
    tirActif = null;
    const der = tousTirs[tousTirs.length - 1] || {};
    t = { arme: '', calibre: '', munition: '', coups: '', distance: der.distance || 25, cible: der.cible || 'C50' };
  }
  // Arme : liste du râtelier (chaque arme est unique), ou « Autre » à écrire
  const lie = t.armeId ? armes.find((a) => a.id === t.armeId) : (t.arme ? trouverArme(t.arme) : null);
  $('tirArmeChoix').innerHTML = '<option value="">Choisis l\'arme…</option>' +
    [...armes].sort((a, b) => nomArme(a).localeCompare(nomArme(b))).map((a) => `<option value="${a.id}">${html(nomArme(a))}</option>`).join('') +
    '<option value="autre">Autre… (pas dans mon râtelier)</option>';
  $('tirArmeChoix').value = lie ? String(lie.id) : (t.arme || !armes.length ? 'autre' : '');
  $('tirArme').value = lie ? '' : t.arme;
  $('tirArme').classList.toggle('cache', $('tirArmeChoix').value !== 'autre');
  remplirCalibres('tirCalibre', 'tirCalibreAutre', t.calibre || '');
  $('tirMunition').value = t.munition;
  $('tirCoups').value = t.coups;
  $('tirDistance').value = t.distance;
  remplirSelectAutre('tirCible', 'tirCibleAutre', CIBLES.map((c) => ({ id: c, nom: c })), t.cible || 'C50');
  $('btnSupprimerTir').classList.toggle('cache', !modifier);
  $('zoneStock').classList.toggle('cache', modifier || !munitions.length);
  remplirStockTir();
  montrer('tirform');
}

function armeDuFormulaire() {
  const v = $('tirArmeChoix').value;
  return v && v !== 'autre' ? armes.find((a) => String(a.id) === v) || null : null;
}
// Liste « Déduire du stock » : les munitions du même calibre d'abord
function remplirStockTir() {
  const cal = lireSelectAutre('tirCalibre', 'tirCalibreAutre');
  const mun = $('tirMunition').value;
  const tri = [...munitions].sort((a, b) => ((b.calibre === cal) - (a.calibre === cal)) || a.nom.localeCompare(b.nom));
  $('tirStock').innerHTML = '<option value="">— Ne pas déduire —</option>' +
    tri.map((m) => `<option value="${m.id}">${html(m.nom)}${m.calibre ? ' — ' + html(nomCalibre(m.calibre)) : ''} (${parseInt(m.quantite, 10) || 0})</option>`).join('');
  const parNom = munitions.find((m) => memeTexte(m.nom, mun));
  const memeCal = cal ? munitions.filter((m) => m.calibre === cal) : [];
  const choix = parNom || (memeCal.length === 1 ? memeCal[0] : null);
  $('tirStock').value = choix ? String(choix.id) : '';
}
function quandArmeChange() {
  const a = armeDuFormulaire();
  $('tirArme').classList.toggle('cache', $('tirArmeChoix').value !== 'autre');
  if ($('tirArmeChoix').value === 'autre') $('tirArme').focus();
  if (a && a.calibre) remplirCalibres('tirCalibre', 'tirCalibreAutre', a.calibre);
  if (!$('tirMunition').value) {
    const tirs = seances.flatMap((s) => s.tirs).filter((t) => (a ? tirDeLArme(t, a) : memeTexte(t.arme, $('tirArme').value)));
    const der = tirs[tirs.length - 1];
    if (der) $('tirMunition').value = der.munition;
  }
  remplirStockTir();
}
$('tirArmeChoix').addEventListener('change', quandArmeChange);
$('tirArme').addEventListener('change', quandArmeChange);
$('tirCalibre').onchangeSuite = remplirStockTir;
$('tirMunition').addEventListener('change', remplirStockTir);


async function enregistrerTir() {
  const valeurs = {
    arme: armeDuFormulaire() ? nomArme(armeDuFormulaire()) : $('tirArme').value.trim(),
    calibre: lireSelectAutre('tirCalibre', 'tirCalibreAutre'),
    munition: $('tirMunition').value.trim(),
    coups: $('tirCoups').value,
    distance: $('tirDistance').value,
    cible: lireSelectAutre('tirCible', 'tirCibleAutre')
  };
  if (!valeurs.arme) { message("Indique l'arme."); return; }
  const armeLiee = armeDuFormulaire() || trouverArme(valeurs.arme);
  valeurs.armeId = armeLiee ? armeLiee.id : null;
  const stock = munitions.find((m) => String(m.id) === $('tirStock').value);
  if (stock && !valeurs.munition) valeurs.munition = stock.nom;
  const nouveau = !(tirEnModification && tirActif);
  if (nouveau) {
    tirActif = Object.assign({ id: Date.now(), photos: [] }, valeurs);
    seanceActive.tirs.push(tirActif);
  } else {
    Object.assign(tirActif, valeurs);
  }
  const coups = parseInt(valeurs.coups, 10);
  if (nouveau && coups > 0 && stock) {
    const nomStock = stock.nom + (stock.calibre ? ' — ' + nomCalibre(stock.calibre) : '');
    if (confirm(`Voulez-vous déduire ${coups} cartouches de votre stock « ${nomStock} » ?\nStock actuel : ${parseInt(stock.quantite, 10) || 0}`)) {
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

// Retrouve une arme du râtelier à partir du nom écrit dans une séance
function trouverArme(nom) {
  if (!nom) return null;
  const exactes = armes.filter((a) => memeTexte(nomArme(a), nom) || memeTexte(a.nom, nom));
  if (exactes.length === 1) return exactes[0];
  if (exactes.length > 1) return exactes.find((a) => memeTexte(nomArme(a), nom)) || null;
  const n = normal(nom);
  if (n.length < 3) return null;
  const proches = armes.filter((a) => { const m = normal(a.nom); return m && (m.includes(n) || n.includes(m)); });
  if (proches.length > 1) { const p2 = proches.filter((a) => normal(nomArme(a)) === n); return p2.length === 1 ? p2[0] : null; }
  return proches.length === 1 ? proches[0] : null;
}
function nomArme(a) { return a ? a.nom + (a.distinctif ? ' — ' + a.distinctif : '') : ''; }
function tirDeLArme(t, a) { return t.armeId ? t.armeId === a.id : trouverArme(t.arme) === a; }
function tirsDeLArme(a) { return seances.flatMap((s) => s.tirs).filter((t) => tirDeLArme(t, a)); }
function seancesDeLArme(a) { return seances.filter((s) => s.tirs.some((t) => tirDeLArme(t, a))); }
function lierTirsAuxArmes() {
  seances.forEach((s) => s.tirs.forEach((t) => { if (!t.armeId) { const a = trouverArme(t.arme); if (a) t.armeId = a.id; } }));
}

function afficherRatelier() {
  const zone = $('listeArmesRatelier');
  zone.innerHTML = '';
  if (!armes.length) zone.innerHTML = '<div class="vide">Ton râtelier est vide.</div>';
  [...armes].sort((a, b) => nomArme(a).localeCompare(nomArme(b))).forEach((a) => {
    const infos = [a.categorie ? 'Cat. ' + a.categorie : '', nomCalibre(a.calibre),
      a.chargeurs ? pluriel(parseInt(a.chargeurs, 10), 'chargeur') : ''].filter(Boolean).join(' · ');
    const nb = seancesDeLArme(a).length;
    const coups = tirsDeLArme(a).reduce((t, x) => t + (parseInt(x.coups, 10) || 0), 0);
    const div = document.createElement('div');
    div.className = 'carte ligneListe';
    div.innerHTML = `
      <img class="miniature" alt="">
      <div class="milieu">
        <div class="haut">${html(a.nom)}${a.distinctif ? ` <span class="badge">${html(a.distinctif)}</span>` : ''}</div>
        <div class="bas">${html(infos)}</div>
      </div>
      <div class="droite"><div class="nb">${pluriel(nb, 'séance')}</div>${coups ? `<div class="nb">${coups} coups</div>` : ''}</div>`;
    const img = div.querySelector('img');
    if (a.photos.length) afficherImage(img, a.photos[0]); else img.style.visibility = 'hidden';
    div.onclick = () => ouvrirArme(a.id);
    zone.appendChild(div);
  });
  montrer('ratelier');
}

function ouvrirFormulaireArme(modifier) {
  armeEnModification = modifier;
  const a = modifier && armeActive ? armeActive : { nom: '', distinctif: '', categorie: '', calibre: '', chargeurs: '', notes: '' };
  $('armeNom').value = a.nom;
  $('armeDistinctif').value = a.distinctif || '';
  $('armeCategorie').value = a.categorie;
  remplirCalibres('armeCalibre', 'armeCalibreAutre', a.calibre);
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
    distinctif: $('armeDistinctif').value.trim(),
    categorie: $('armeCategorie').value,
    calibre: lireSelectAutre('armeCalibre', 'armeCalibreAutre'),
    chargeurs: $('armeChargeurs').value,
    notes: $('armeNotes').value.trim()
  };
  valeurs.pourRire = ARMES_POUR_RIRE.includes(valeurs.nom);
  if (!valeurs.nom) { message("Indique le nom de l'arme."); return; }
  if (armeEnModification && armeActive) {
    const ancien = armeActive.nom;
    if (ancien !== valeurs.nom || (armeActive.distinctif || '') !== valeurs.distinctif) {
      seances.forEach((s) => s.tirs.forEach((t) => { if (t.armeId === armeActive.id || (!t.armeId && memeTexte(t.arme, ancien))) t.armeId = armeActive.id; }));
    }
    Object.assign(armeActive, valeurs);
    seances.forEach((s) => s.tirs.forEach((t) => { if (t.armeId === armeActive.id) t.arme = nomArme(armeActive); }));
  } else {
    armeActive = Object.assign({ id: Date.now(), photos: [], modifs: [], entretiens: [], accessoires: [] }, valeurs);
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
  if (!a.accessoires) a.accessoires = [];
  const tirs = tirsDeLArme(a);
  const nbSeances = seancesDeLArme(a).length;
  const coupsTotal = tirs.reduce((t, x) => t + (parseInt(x.coups, 10) || 0), 0);
  const lignes = [
    a.categorie ? 'Catégorie ' + a.categorie : '',
    a.calibre ? 'Calibre ' + nomCalibre(a.calibre) : '',
    a.chargeurs ? pluriel(parseInt(a.chargeurs, 10), 'chargeur') : '',
    pluriel(nbSeances, 'séance') + (coupsTotal ? ` · ${coupsTotal} coups tirés` : ''),
    a.accessoires.length ? a.accessoires.map((x) => x.type).join(' · ') : ''
  ].filter(Boolean);
  $('resumeArme').innerHTML = `
    <div class="haut">${html(a.nom)}${a.distinctif ? ` <span class="badge">${html(a.distinctif)}</span>` : ''}</div>
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

  afficherAccessoires();
  remplirSelectAutre('accType', 'accTypeAutre', TYPES_ACCESSOIRES.map((t) => ({ id: t, nom: t })), '', 'Type d\'accessoire…');
  $('accModele').value = '';
  $('accNotes').value = '';
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

function afficherAccessoires() {
  const a = armeActive;
  const zone = $('listeAccessoires');
  zone.innerHTML = a.accessoires.length ? '' : '<p class="aide">Aucun accessoire noté.</p>';
  a.accessoires.forEach((x) => {
    const div = document.createElement('div');
    div.className = 'carte ligneListe accessoire';
    div.innerHTML = `
      ${x.photo ? '<img class="miniAcc" alt="">' : ''}
      <div class="milieu">
        <div class="haut">${html(x.type)}</div>
        ${x.modele ? `<div class="bas">${html(x.modele)}</div>` : ''}
        ${x.notes ? `<div class="bas">${html(x.notes)}</div>` : ''}
        <div class="actionsAcc">
          <button class="lienPetit btnP">&#128247; Photo</button>
          <button class="lienPetit btnG">&#128444;&#65039; Galerie</button>
          <button class="lienPetit btnS">Supprimer</button>
        </div>
      </div>`;
    if (x.photo) { const img = div.querySelector('img'); afficherImage(img, x.photo); img.onclick = () => voirPhoto(x.photo); }
    const photo = async (source) => {
      if (sansNatif()) return;
      try {
        const nom = `Ratelier/${nettoyer(a.nom) || 'Arme'}_${nettoyer(x.type) || 'Accessoire'}_${Date.now()}.jpg`;
        if (!(await obtenirImage(source, nom))) return;
        x.photo = nom; await sauver(); ouvrirArme(a.id);
      } catch (e) { erreurPhoto(e); }
    };
    div.querySelector('.btnP').onclick = () => photo('photo');
    div.querySelector('.btnG').onclick = () => photo('galerie');
    div.querySelector('.btnS').onclick = async () => {
      if (!confirm(`Supprimer « ${x.type} » ?`)) return;
      a.accessoires = a.accessoires.filter((y) => y !== x); await sauver(); ouvrirArme(a.id);
    };
    zone.appendChild(div);
  });
}

async function ajouterAccessoire() {
  const type = lireSelectAutre('accType', 'accTypeAutre');
  if (!type) { message("Choisis le type d'accessoire."); return; }
  armeActive.accessoires.push({ id: Date.now(), type, modele: $('accModele').value.trim(), notes: $('accNotes').value.trim(), photo: '' });
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

function nomCalibre(v) { if (!v || v === 'autre') return ''; const c = CALIBRES.find((x) => x.id === v); return c ? c.nom : v; }

function afficherMunitions() {
  remplirCalibres('stockCalibre', 'stockCalibreAutre', '');
  const zone = $('listeStock');
  zone.innerHTML = '';
  if (!munitions.length) zone.innerHTML = '<div class="vide">Aucune munition enregistrée.</div>';
  [...munitions].sort((a, b) => (nomCalibre(a.calibre) + a.nom).localeCompare(nomCalibre(b.calibre) + b.nom)).forEach((m) => {
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
      ${m.photo ? '<img class="photoStock" alt="">' : ''}
      <div class="boutons">
        <button class="moins" data-d="-50">−50</button>
        <button class="moins" data-d="-10">−10</button>
        <button class="moins" data-d="-1">−1</button>
        <button class="plus" data-d="1">+1</button>
        <button class="plus" data-d="10">+10</button>
        <button class="plus" data-d="50">+50</button>
      </div>
      <div class="liensStock">
        <button class="lienPetit btnPhotoStock">&#128247; Photo</button>
        <button class="lienPetit btnGalerieStock">&#128444;&#65039; Galerie</button>
        <button class="lienPetit btnCalibreStock">Calibre</button>
        <button class="lienPetit btnSupprStock">Supprimer</button>
      </div>
      <div class="zoneCal formStock cache"></div>`;
    if (m.photo) {
      const img = div.querySelector('.photoStock');
      afficherImage(img, m.photo);
      img.onclick = () => voirPhoto(m.photo);
    }
    div.querySelectorAll('.boutons button').forEach((b) => {
      b.onclick = async () => {
        m.quantite = Math.max(0, (parseInt(m.quantite, 10) || 0) + parseInt(b.dataset.d, 10));
        div.querySelector('.qte').textContent = m.quantite; // mise à jour sur place, la page ne bouge pas
        await sauver();
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
    div.querySelector('.btnCalibreStock').onclick = () => {
      const z = div.querySelector('.zoneCal');
      z.classList.toggle('cache');
      if (z.classList.contains('cache')) return;
      const idS = 'cal' + m.id, idT = 'calT' + m.id;
      z.innerHTML = `<select id="${idS}"></select><input type="text" id="${idT}" class="cache champAutre" placeholder="Écris le calibre"><button class="petit okCal">OK</button>`;
      remplirCalibres(idS, idT, m.calibre);
      z.querySelector('.okCal').onclick = async () => { m.calibre = lireSelectAutre(idS, idT); await sauver(); afficherMunitions(); };
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
  const calibre = lireSelectAutre('stockCalibre', 'stockCalibreAutre');
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
  zone.innerHTML = tousLesStands().length ? '' : '<div class="vide">Aucun stand pour le moment. Ajoute le tien !</div>';
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
  if (!stands.length) {
    zone.innerHTML = '<div class="vide">Ajoute d\'abord ton stand dans « Stands &amp; ouvertures ».</div>';
    if (ecran !== 'controles') montrer('controles');
    return;
  }
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
   ['imageCertificat', 'certificatImage', 'btnChoisirCertificat', "l'image du certificat"]].forEach(([idImg, cle]) => {
    const img = $(idImg);
    if (licence[cle]) { img.classList.remove('cache'); afficherImage(img, licence[cle]); img.onclick = () => voirPhoto(licence[cle]); }
    else img.classList.add('cache');
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

async function choisirImageDocument(cle, chemin, mode) {
  if (sansNatif()) return;
  try {
    if (mode === 'fichier') {
      const f = await choisirFichier();
      if (!f) return;
      chemin = await enregistrerFichier(f, chemin.replace(/\.jpg$/, '') + '_' + Date.now());
    } else if (!(await obtenirImage('galerie', chemin))) return;
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
function nomCategorieDuPapier(p) { return p.categorie === 'autre' && p.categorieTexte ? p.categorieTexte : nomCategoriePapier(p.categorie); }

function afficherPapiers() {
  const zone = $('listePapiers');
  zone.innerHTML = '';
  if (!papiers.length) zone.innerHTML = '<div class="vide">Aucun papier pour le moment.</div>';
  const groupes = [];
  CATEGORIES_PAPIERS.forEach((cat) => {
    if (cat.id !== 'autre') { groupes.push({ cat, nom: cat.nom, liste: papiers.filter((p) => p.categorie === cat.id) }); return; }
    const autres = papiers.filter((p) => p.categorie === 'autre' || !CATEGORIES_PAPIERS.some((c) => c.id === p.categorie));
    [...new Set(autres.map((p) => p.categorieTexte || 'Autre'))].forEach((nom) => groupes.push({ cat, nom, liste: autres.filter((p) => (p.categorieTexte || 'Autre') === nom) }));
  });
  groupes.forEach(({ cat, nom, liste }) => {
    if (!liste.length) return;
    const titre = document.createElement('h2');
    titre.textContent = nom;
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
  remplirSelectAutre('papierCategorie', 'papierCategorieAutre', CATEGORIES_PAPIERS.filter((c) => c.id !== 'autre'), p.categorie === 'autre' ? (p.categorieTexte || 'autre') : p.categorie);
  $('papierCategorie').onchangeSuite = texteRappel;
  $('papierTitre').value = p.titre;
  $('papierFin').value = p.fin;
  $('papierNotes').value = p.notes;
  texteRappel();
  montrer('papierform');
}

async function enregistrerPapier() {
  const valeurs = {
    categorie: $('papierCategorie').value || 'armes',
    categorieTexte: $('papierCategorie').value === 'autre' ? $('papierCategorieAutre').value.trim() : '',
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
    <div class="haut">${html(p.titre || nomCategorieDuPapier(p))}</div>
    <div class="bas">${html(nomCategorieDuPapier(p))}</div>
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
    let nom = `Papiers/${nettoyer(p.titre || p.categorie) || 'Papier'}_${Date.now()}`;
    if (source === 'fichier') {
      const f = await choisirFichier();
      if (!f) return;
      nom = await enregistrerFichier(f, nom);
    } else {
      nom += '.jpg';
      if (!(await obtenirImage(source, nom))) return;
    }
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
// Bloc-notes (codes de porte, infos…)
// =====================================================================

function afficherNotes() {
  const zone = $('listeNotes');
  zone.innerHTML = notesBloc.length ? '' : '<div class="vide">Aucune note pour le moment.</div>';
  const stands = tousLesStands();
  [...notesBloc].sort((a, b) => (a.titre || '').localeCompare(b.titre || '')).forEach((n) => {
    const stand = stands.find((s) => s.id === n.standId);
    const visible = !n.secret || notesVisibles.has(n.id);
    const div = document.createElement('div');
    div.className = 'carte note';
    div.innerHTML = `
      <div class="haut">${n.secret ? '&#128274; ' : ''}${html(n.titre || 'Note')}</div>
      ${stand ? `<div class="bas">${html(stand.nom)}</div>` : ''}
      <div class="texteNote ${visible ? '' : 'masque'}">${visible ? html(n.texte) : '•••••• (appuie pour voir)'}</div>
      <button class="lienPetit btnModifNote">Modifier</button>`;
    div.onclick = () => { if (!n.secret) return; if (notesVisibles.has(n.id)) notesVisibles.delete(n.id); else notesVisibles.add(n.id); afficherNotes(); };
    div.querySelector('.btnModifNote').onclick = (e) => { e.stopPropagation(); ouvrirFormulaireNote(n); };
    zone.appendChild(div);
  });
  if (ecran !== 'notes') montrer('notes');
}

function ouvrirFormulaireNote(n) {
  noteActive = n || null;
  const v = n || { titre: '', standId: '', texte: '', secret: false };
  $('noteTitre').value = v.titre;
  $('noteStand').innerHTML = '<option value="">— aucun —</option>' + tousLesStands().map((s) => `<option value="${html(s.id)}">${html(s.nom)}</option>`).join('');
  $('noteStand').value = v.standId || '';
  $('noteTexte').value = v.texte;
  $('noteSecret').checked = !!v.secret;
  $('btnSupprimerNote').classList.toggle('cache', !n);
  montrer('noteform');
}

async function enregistrerNote() {
  const v = { titre: $('noteTitre').value.trim(), standId: $('noteStand').value, texte: $('noteTexte').value, secret: $('noteSecret').checked };
  if (!v.titre && !v.texte.trim()) { message('Écris un titre ou une note.'); return; }
  if (noteActive) Object.assign(noteActive, v);
  else notesBloc.push(Object.assign({ id: Date.now() }, v));
  await sauver();
  noteActive = null;
  afficherNotes();
}

async function supprimerNote() {
  if (!noteActive || !confirm('Supprimer cette note ?')) return;
  notesBloc = notesBloc.filter((n) => n !== noteActive);
  noteActive = null;
  await sauver();
  afficherNotes();
}

// =====================================================================
// Partage, sauvegarde, premier lancement
// =====================================================================

async function partagerAppli() {
  const texte = "Tir Coach : le carnet de tir gratuit et 100 % local (séances, cibles, râtelier, munitions, licence…). À télécharger ici :";
  try {
    if (natif && P.Share) { await P.Share.share({ title: 'Tir Coach', text: texte, url: LIEN_PARTAGE, dialogTitle: "Partager Tir Coach" }); return; }
    if (navigator.share) { await navigator.share({ title: 'Tir Coach', text: texte, url: LIEN_PARTAGE }); return; }
  } catch (e) { return; }
  message(LIEN_PARTAGE);
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
      notesBloc = d.notes || [];
      lierTirsAuxArmes();
      await sauver();
      await programmerRappels();
      message('Sauvegarde restaurée');
      montrer('menu');
    } catch (e) { message('Restauration impossible : ' + e.message); }
  };
  lecteur.readAsText(fichier);
}

// Message de Roy à l'ouverture (lu sur son serveur ; l'appli n'envoie aucune donnée)
const SERVEUR_MESSAGE = 'https://avis-tircoach.royvanmil86.workers.dev/message';
async function messageDeRoy() {
  let ouv = 0;
  try { ouv = (parseInt(localStorage.getItem('tircoach-ouvertures'), 10) || 0) + 1; localStorage.setItem('tircoach-ouvertures', String(ouv)); } catch (e) {}
  if (ouv < 2 || !charger(CLES.accord, null) || !navigator.onLine) return;
  const vus = charger('tircoach-messages', {});
  let m;
  try {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(SERVEUR_MESSAGE, { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(minuteur);
    m = await r.json();
  } catch (e) { return; }
  if (!m || !m.id || !m.titre) return;
  const etat = vus[m.id];
  if (etat === 'jamais' || (etat && aujourdhui() < etat)) return;
  const noter = (v) => { vus[m.id] = v; try { localStorage.setItem('tircoach-messages', JSON.stringify(vus)); } catch (e) {} $('messageRoy').classList.add('cache'); };
  $('msgTitre').textContent = m.titre;
  $('msgTexte').textContent = m.texte || '';
  const b = $('msgBouton');
  if (m.bouton && m.lien) { b.textContent = m.bouton; b.href = m.lien; b.classList.remove('cache'); b.onclick = () => noter('jamais'); }
  else b.classList.add('cache');
  $('msgPlusTard').onclick = () => { const d = new Date(); d.setDate(d.getDate() + 7); noter(d.toISOString().slice(0, 10)); };
  $('msgJamais').onclick = () => noter('jamais');
  $('messageRoy').classList.remove('cache');
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
  messageDeRoy();
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
        </dl>${section.html || ''}`;
      zone.appendChild(d);
    });
    const calc = () => {
      const dist = parseFloat($('ccDistance').value), ecart = parseFloat(String($('ccEcart').value).replace(',', '.'));
      if (!(dist > 0) || !(ecart > 0)) { $('ccResultat').textContent = ''; return; }
      const v = $('ccClic').value;
      const cmParClic = v.startsWith('m') ? parseFloat(v.slice(1)) * 10 * dist / 100 : parseFloat(v) * 2.909 * dist / 100;
      const n = ecart / cmParClic;
      $('ccResultat').textContent = `≈ ${Math.round(n)} clics (1 clic = ${String(Math.round(cmParClic * 100) / 100).replace('.', ',')} cm à ${dist} m)`;
    };
    ['ccDistance', 'ccEcart', 'ccClic'].forEach((id) => { $(id).oninput = calc; $(id).onchange = calc; });
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
      case 'notes': afficherNotes(); break;
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
$('btnAjoutAcc').onclick = ajouterAccessoire;
$('btnNouvelleNote').onclick = () => ouvrirFormulaireNote(null);
$('btnEnregistrerNote').onclick = enregistrerNote;
$('btnSupprimerNote').onclick = supprimerNote;

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
$('btnFichierLicence').onclick = () => choisirImageDocument('image', 'Papiers/licence.jpg', 'fichier');
$('btnFichierCertificat').onclick = () => choisirImageDocument('certificatImage', 'Papiers/certificat-medical.jpg', 'fichier');
$('btnNumeroGrand').onclick = numeroEnGrand;
$('grandNumero').onclick = () => $('grandNumero').classList.add('cache');

$('visionneuse').onclick = () => $('visionneuse').classList.add('cache');
$('btnTourner').onclick = (e) => { e.stopPropagation(); $('visionneuse').classList.toggle('tourne'); };

if (natif && P.App) {
  P.App.addListener('backButton', () => { if (!retour()) P.App.exitApp(); });
}

$('carteMerci').classList.toggle('cache', !AFFICHER_TAA);
document.querySelectorAll('.lienAvis').forEach((a) => { a.href = LIEN_AVIS; });
$('qrAppli').src = SUR_PLAY_STORE ? 'images/qr-playstore.svg' : 'images/qr-site.svg';
$('texteAvis').textContent = SUR_PLAY_STORE
  ? "Roy VAN MIL sera content de connaître ton avis. Laisse une petite note sur le Play Store, et partage l'appli avec tes amis du tir."
  : "Roy VAN MIL sera content de connaître ton avis. Donne-lui une note sur 10 sur la page des avis, et partage l'appli avec tes amis du tir.";
$('btnInfos').onclick = () => { depuisMenu = false; montrer('infos'); };
$('btnPartager').onclick = partagerAppli;
$('jTir').onclick = tirerJeu;
$('jCible').onclick = tirerJeu;
$('jRejouer').onclick = nouvellePartie;
$('jEnregistrer').onclick = enregistrerScore;
$('jNom').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !$('jEnregistrer').classList.contains('cache')) { e.preventDefault(); $('jNom').blur(); enregistrerScore(); }
});
$('btnExporter').onclick = exporterSauvegarde;
$('btnRestaurer').onclick = () => $('fichierRestauration').click();
$('fichierRestauration').onchange = (e) => { if (e.target.files[0]) restaurerSauvegarde(e.target.files[0]); e.target.value = ''; };

$('btnNouveauPapier').onclick = () => ouvrirFormulairePapier(false);
$('btnEnregistrerPapier').onclick = enregistrerPapier;
$('btnModifierPapier').onclick = () => ouvrirFormulairePapier(true);
$('btnPhotoPapier').onclick = () => documentPapier('photo');
$('btnGaleriePapier').onclick = () => documentPapier('galerie');
$('btnFichierPapier').onclick = () => documentPapier('fichier');
$('btnSupprimerPapier').onclick = supprimerPapier;

async function afficherVersion() {
  let v = '';
  try { if (natif && P.App) v = (await P.App.getInfo()).version; } catch (e) {}
  document.querySelectorAll('.version').forEach((el) => { el.textContent = v ? 'v' + v : 'version web'; });
}

afficherVersion();
lierTirsAuxArmes();
verifierAccord();
if (charger(CLES.accord, null)) programmerRappels();
montrer('accueil');
