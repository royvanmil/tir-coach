// =====================================================================
//  Serveur des avis Tir Coach — Cloudflare Worker
//  À coller tel quel dans le worker « avis-tircoach ».
//  Besoin de :
//    - une liaison KV nommée  AVIS
//    - un secret nommé        CODE_ADMIN  (ton mot de passe admin)
//  Rien d'autre à modifier ici.
//  Compte aussi les visites et les clics des pages Tir Coach,
//  et donne le message affiché à l'ouverture de l'appli.
// =====================================================================

const ORIGINES = ['https://royvanmil.fr', 'https://www.royvanmil.fr'];
const MAX_PAR_PERSONNE = 2;
const COMPTEURS = ['tircoach-page', 'tircoach-telechargement', 'tircoach-testeur', 'tircoach-avis-page', 'tircoach-avis-envoi'];

function jourParis(decalage = 0) {
  const d = new Date(Date.now() - decalage * 86400000);
  return d.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ
}

function entetes(req) {
  const o = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGINES.includes(o) ? o : ORIGINES[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
}
function json(req, data, statut = 200) {
  return new Response(JSON.stringify(data), { status: statut, headers: entetes(req) });
}
function nettoie(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
async function empreinte(texte) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tircoach-avis|' + texte));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function lireTout(env) {
  return (await env.AVIS.get('avis', 'json')) || [];
}
async function ecrireTout(env, liste) {
  await env.AVIS.put('avis', JSON.stringify(liste));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: entetes(req) });

    // ---- Message affiché dans l'appli (lu par l'appli, rien n'est envoyé) ----
    if (url.pathname === '/message' && req.method === 'GET') {
      const m = (await env.AVIS.get('message', 'json')) || {};
      const corps = m.actif ? { id: m.id, titre: m.titre, texte: m.texte, bouton: m.bouton, lien: m.lien } : {};
      return new Response(JSON.stringify(corps), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
    }

    // ---- Compteurs : +1 ----
    if (url.pathname === '/compte') {
      const c = url.searchParams.get('c');
      if (!COMPTEURS.includes(c)) return json(req, { ok: false, erreur: 'cle' }, 400);
      const kj = 'c:' + c + ':' + jourParis();
      const kt = 'c:' + c + ':total';
      const [vj, vt] = await Promise.all([env.AVIS.get(kj), env.AVIS.get(kt)]);
      await Promise.all([
        env.AVIS.put(kj, String((parseInt(vj, 10) || 0) + 1), { expirationTtl: 60 * 60 * 24 * 40 }),
        env.AVIS.put(kt, String((parseInt(vt, 10) || 0) + 1)),
      ]);
      return json(req, { ok: true });
    }

    // ---- Compteurs : lecture (aujourd'hui, hier, 7 jours, 30 jours, toujours) ----
    if (url.pathname === '/periodes') {
      const cles = (url.searchParams.get('cles') || COMPTEURS.join(',')).split(',').filter((c) => COMPTEURS.includes(c));
      const res = {};
      for (const c of cles) {
        const jours = await Promise.all([...Array(30).keys()].map((i) => env.AVIS.get('c:' + c + ':' + jourParis(i))));
        const n = jours.map((v) => parseInt(v, 10) || 0);
        const total = parseInt(await env.AVIS.get('c:' + c + ':total'), 10) || 0;
        res[c] = { jour: n[0], hier: n[1], j7: n.slice(0, 7).reduce((a, b) => a + b, 0), j30: n.reduce((a, b) => a + b, 0), total };
      }
      return json(req, res);
    }

    // ---- Avis publiés (page publique) ----
    if (url.pathname === '/publics' && req.method === 'GET') {
      const liste = (await lireTout(env))
        .filter((a) => a.statut === 'publie' && a.accord)
        .map((a) => ({ prenom: a.prenom, note: a.note, date: a.date, plait: a.plait, ameliorer: a.ameliorer, reponse: a.reponse }));
      return json(req, liste);
    }

    // ---- Envoi d'un avis ----
    if (url.pathname === '/avis' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch (e) { return json(req, { ok: false, erreur: 'format' }, 400); }
      if (b.site) return json(req, { ok: true }); // piège à robots : on fait semblant
      const prenom = nettoie(b.prenom, 40);
      const note = parseInt(b.note, 10);
      if (prenom.length < 2) return json(req, { ok: false, erreur: 'prenom' }, 400);
      if (!(note >= 1 && note <= 10)) return json(req, { ok: false, erreur: 'note' }, 400);

      // Max 2 avis par personne (adresse internet, gardée seulement sous forme codée)
      const ip = req.headers.get('CF-Connecting-IP') || 'inconnu';
      const cle = 'ip:' + (await empreinte(ip));
      const deja = parseInt((await env.AVIS.get(cle)) || '0', 10);
      if (deja >= MAX_PAR_PERSONNE) return json(req, { ok: false, erreur: 'limite' }, 429);

      const avis = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        date: new Date().toISOString().slice(0, 10),
        statut: 'attente',
        prenom,
        note,
        plait: nettoie(b.plait, 1500),
        ameliorer: nettoie(b.ameliorer, 1500),
        stand: nettoie(b.stand, 1500),
        mail: nettoie(b.mail, 80),
        accord: b.accord === true,
        reponse: '',
      };
      const liste = await lireTout(env);
      if (liste.filter((a) => a.statut === 'attente').length >= 300) return json(req, { ok: false, erreur: 'plein' }, 503);
      liste.unshift(avis);
      await ecrireTout(env, liste);
      await env.AVIS.put(cle, String(deja + 1), { expirationTtl: 60 * 60 * 24 * 365 });
      return json(req, { ok: true });
    }

    // ---- Admin ----
    if (url.pathname === '/admin' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch (e) { return json(req, { ok: false }, 400); }
      if (!env.CODE_ADMIN || b.code !== env.CODE_ADMIN) {
        await new Promise((r) => setTimeout(r, 800));
        return json(req, { ok: false, erreur: 'code' }, 403);
      }
      const liste = await lireTout(env);
      if (b.action === 'liste') return json(req, { ok: true, avis: liste, message: (await env.AVIS.get('message', 'json')) || {} });
      if (b.action === 'message') {
        const m = b.message || {};
        const lien = nettoie(m.lien, 400);
        const propre = {
          actif: m.actif === true,
          id: Date.now().toString(36),
          titre: nettoie(m.titre, 80),
          texte: nettoie(m.texte, 800),
          bouton: nettoie(m.bouton, 40),
          lien: /^(https:|mailto:)/.test(lien) ? lien : '',
        };
        await env.AVIS.put('message', JSON.stringify(propre));
        return json(req, { ok: true, message: propre });
      }

      const i = liste.findIndex((a) => a.id === b.id);
      if (i < 0) return json(req, { ok: false, erreur: 'introuvable' }, 404);
      const a = liste[i];
      if (b.action === 'publier') { if (!a.accord) return json(req, { ok: false, erreur: 'pas_accord' }, 400); a.statut = 'publie'; }
      else if (b.action === 'retirer') a.statut = 'attente';
      else if (b.action === 'jeter') a.statut = 'corbeille';
      else if (b.action === 'restaurer') a.statut = 'attente';
      else if (b.action === 'supprimer') liste.splice(i, 1);
      else if (b.action === 'reponse') a.reponse = nettoie(b.reponse, 1000);
      else return json(req, { ok: false, erreur: 'action' }, 400);
      await ecrireTout(env, liste);
      return json(req, { ok: true });
    }

    return json(req, { ok: false, erreur: 'inconnu' }, 404);
  },
};
