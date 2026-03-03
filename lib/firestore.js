// Firestore CRUD Services
import { db } from './firebase';
import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ============================================
// Generic helpers
// ============================================
function docToObj(docSnap) {
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data };
}

async function getAll(collName, orderField = 'createdAt', dir = 'desc') {
    const q = query(collection(db, collName), orderBy(orderField, dir));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(collName, id) {
    const snap = await getDoc(doc(db, collName, id));
    return docToObj(snap);
}

async function create(collName, data) {
    const ref = await addDoc(collection(db, collName), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

async function update(collName, id, data) {
    await updateDoc(doc(db, collName, id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

async function remove(collName, id) {
    await deleteDoc(doc(db, collName, id));
}

// ============================================
// Players
// ============================================
export const PlayersService = {
    getAll: () => getAll('players', 'number', 'asc'),
    getById: (id) => getById('players', id),
    create: (data) => create('players', data),
    update: (id, data) => update('players', id, data),
    delete: (id) => remove('players', id),
};

// ============================================
// Uniforms
// ============================================
export const UniformsService = {
    getAll: () => getAll('uniforms', 'createdAt', 'asc'),
    getById: (id) => getById('uniforms', id),
    create: (data) => create('uniforms', data),
    update: (id, data) => update('uniforms', id, data),
    delete: (id) => remove('uniforms', id),
};

// ============================================
// Matches
// ============================================
export const MatchesService = {
    getAll: () => getAll('matches', 'date', 'desc'),
    getById: (id) => getById('matches', id),
    getUpcoming: async () => {
        const q = query(
            collection(db, 'matches'),
            where('status', '==', 'upcoming'),
            orderBy('date', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    getCompleted: async () => {
        const q = query(
            collection(db, 'matches'),
            where('status', '==', 'completed'),
            orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    create: (data) => create('matches', data),
    update: (id, data) => update('matches', id, data),
    delete: (id) => remove('matches', id),
};

// ============================================
// Results
// ============================================
export const ResultsService = {
    getAll: () => getAll('results', 'createdAt', 'desc'),
    getByMatchId: async (matchId) => {
        const q = query(collection(db, 'results'), where('matchId', '==', matchId));
        const snap = await getDocs(q);
        return snap.docs.length > 0 ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
    },
    create: (data) => create('results', data),
    update: (id, data) => update('results', id, data),
    delete: (id) => remove('results', id),
};

// ============================================
// Stats helpers (client-side compute)
// ============================================
export function computeTeamStats(matches, results) {
    const completed = matches.filter(m => m.status === 'completed');
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    completed.forEach(m => {
        const r = results.find(res => res.matchId === m.id);
        if (r) {
            goalsFor += r.ourScore || 0;
            goalsAgainst += r.opponentScore || 0;
            if (r.ourScore > r.opponentScore) wins++;
            else if (r.ourScore === r.opponentScore) draws++;
            else losses++;
        }
    });
    return {
        totalMatches: completed.length,
        upcomingMatches: matches.filter(m => m.status === 'upcoming').length,
        wins, draws, losses, goalsFor, goalsAgainst,
        winRate: completed.length ? Math.round((wins / completed.length) * 100) : 0,
    };
}

export function computeTopScorers(results, players, limit = 5) {
    const scorerMap = {};
    results.forEach(r => {
        (r.scorers || []).forEach(s => {
            scorerMap[s.playerId] = (scorerMap[s.playerId] || 0) + 1;
        });
    });
    return Object.entries(scorerMap)
        .map(([id, goals]) => ({ player: players.find(p => p.id === id), goals }))
        .filter(item => item.player)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);
}

export function computeTopAssisters(results, players, limit = 5) {
    const assistMap = {};
    results.forEach(r => {
        (r.assists || []).forEach(a => {
            assistMap[a.playerId] = (assistMap[a.playerId] || 0) + 1;
        });
    });
    return Object.entries(assistMap)
        .map(([id, assists]) => ({ player: players.find(p => p.id === id), assists }))
        .filter(item => item.player)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, limit);
}

export function computePlayerStats(playerId, results) {
    let goals = 0, assists = 0, mvps = 0, matchesPlayed = 0;
    results.forEach(r => {
        let played = false;
        (r.scorers || []).forEach(s => { if (s.playerId === playerId) { goals++; played = true; } });
        (r.assists || []).forEach(a => { if (a.playerId === playerId) { assists++; played = true; } });
        if (r.mvpPlayerId === playerId) { mvps++; played = true; }
        if (played) matchesPlayed++;
    });
    return { goals, assists, mvps, matchesPlayed };
}
