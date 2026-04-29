'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_PLAYERS, MOCK_UNIFORMS, MOCK_MATCHES, MOCK_RESULTS, MOCK_SEASONS } from '@/lib/mockData';
import { computeTeamStats, computeTopScorers, computeTopAssisters, computePlayerStats } from '@/lib/firestore';
import { useAuth } from '@/lib/AuthContext';

const DataContext = createContext(null);

// Check if Firebase is configured (not demo values)
const isFirebaseConfigured = () => {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project';
};

export function DataProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const [players, setPlayers] = useState([]);
    const [uniforms, setUniforms] = useState([]);
    const [matches, setMatches] = useState([]);
    const [results, setResults] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [useFirestore, setUseFirestore] = useState(false);

    // Initialize/Refresh data when user auth status changes
    useEffect(() => {
        // Only load data if auth state is settled
        if (authLoading) return;

        async function loadData() {
            setLoading(true);
            if (isFirebaseConfigured() && user) {
                try {
                    const { PlayersService, UniformsService, MatchesService, ResultsService, SeasonsService } = await import('@/lib/firestore');
                    const [p, u, m, r, s] = await Promise.all([
                        PlayersService.getAll(),
                        UniformsService.getAll(),
                        MatchesService.getAll(),
                        ResultsService.getAll(),
                        SeasonsService.getAll(),
                    ]);
                    setPlayers(p);
                    setUniforms(u);
                    setMatches(m);
                    setResults(r);
                    setSeasons(s);
                    const currentSeason = s.find(season => season.isCurrent);
                    if (currentSeason) {
                        setSelectedSeasonId(currentSeason.id);
                    } else {
                        setSelectedSeasonId('all');
                    }
                    setUseFirestore(true);
                } catch (err) {
                    console.warn('Firestore not available, using mock data:', err.message);
                    loadMockData();
                    setUseFirestore(false);
                }
            } else {
                loadMockData();
                setUseFirestore(false);
            }
            setLoading(false);
        }

        function loadMockData() {
            setPlayers([...MOCK_PLAYERS]);
            setUniforms([...MOCK_UNIFORMS]);
            setMatches([...MOCK_MATCHES]);
            setResults([...MOCK_RESULTS]);
            setSeasons([...MOCK_SEASONS]);
            const currentSeason = MOCK_SEASONS.find(s => s.isCurrent);
            if (currentSeason) {
                setSelectedSeasonId(currentSeason.id);
            } else {
                setSelectedSeasonId('all');
            }
        }

        loadData();
    }, [user, authLoading]);

    // ---- Player CRUD ----
    const addPlayer = useCallback(async (data) => {
        if (useFirestore) {
            const { PlayersService } = await import('@/lib/firestore');
            const id = await PlayersService.create(data);
            setPlayers(prev => [...prev, { id, ...data }]);
            return id;
        }
        const id = 'p' + Date.now();
        setPlayers(prev => [...prev, { id, ...data }]);
        return id;
    }, [useFirestore]);

    const updatePlayer = useCallback(async (id, data) => {
        if (useFirestore) {
            const { PlayersService } = await import('@/lib/firestore');
            await PlayersService.update(id, data);
        }
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    }, [useFirestore]);

    const deletePlayer = useCallback(async (id) => {
        if (useFirestore) {
            const { PlayersService } = await import('@/lib/firestore');
            await PlayersService.delete(id);
        }
        setPlayers(prev => prev.filter(p => p.id !== id));
    }, [useFirestore]);

    // ---- Uniform CRUD ----
    const addUniform = useCallback(async (data) => {
        if (useFirestore) {
            const { UniformsService } = await import('@/lib/firestore');
            const id = await UniformsService.create(data);
            setUniforms(prev => [...prev, { id, ...data }]);
            return id;
        }
        const id = 'u' + Date.now();
        setUniforms(prev => [...prev, { id, ...data }]);
        return id;
    }, [useFirestore]);

    const updateUniform = useCallback(async (id, data) => {
        if (useFirestore) {
            const { UniformsService } = await import('@/lib/firestore');
            await UniformsService.update(id, data);
        }
        setUniforms(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    }, [useFirestore]);

    const deleteUniform = useCallback(async (id) => {
        if (useFirestore) {
            const { UniformsService } = await import('@/lib/firestore');
            await UniformsService.delete(id);
        }
        setUniforms(prev => prev.filter(u => u.id !== id));
    }, [useFirestore]);

    // ---- Match CRUD ----
    const addMatch = useCallback(async (data) => {
        if (useFirestore) {
            const { MatchesService } = await import('@/lib/firestore');
            const id = await MatchesService.create(data);
            setMatches(prev => [...prev, { id, ...data }]);
            return id;
        }
        const id = 'm' + Date.now();
        setMatches(prev => [...prev, { id, ...data }]);
        return id;
    }, [useFirestore]);

    const updateMatch = useCallback(async (id, data) => {
        if (useFirestore) {
            const { MatchesService } = await import('@/lib/firestore');
            await MatchesService.update(id, data);
        }
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    }, [useFirestore]);

    const deleteMatch = useCallback(async (id) => {
        if (useFirestore) {
            const { MatchesService } = await import('@/lib/firestore');
            await MatchesService.delete(id);
        }
        setMatches(prev => prev.filter(m => m.id !== id));
        setResults(prev => prev.filter(r => r.matchId !== id));
    }, [useFirestore]);

    // ---- Result CRUD ----
    const saveResult = useCallback(async (matchId, data) => {
        const existing = results.find(r => r.matchId === matchId);

        // When saving a result, also mark the match as completed
        const match = matches.find(m => m.id === matchId);
        if (match && match.status !== 'completed') {
            await updateMatch(matchId, { ...match, status: 'completed' });
        }

        if (existing) {
            if (useFirestore) {
                const { ResultsService } = await import('@/lib/firestore');
                await ResultsService.update(existing.id, data);
            }
            setResults(prev => prev.map(r => r.matchId === matchId ? { ...r, ...data } : r));
        } else {
            if (useFirestore) {
                const { ResultsService } = await import('@/lib/firestore');
                const id = await ResultsService.create({ matchId, ...data });
                setResults(prev => [...prev, { id, matchId, ...data }]);
            } else {
                const id = 'r' + Date.now();
                setResults(prev => [...prev, { id, matchId, ...data }]);
            }
        }
    }, [useFirestore, results, matches, updateMatch]);

    // ---- Season CRUD ----
    const addSeason = useCallback(async (data) => {
        if (useFirestore) {
            const { SeasonsService } = await import('@/lib/firestore');
            const id = await SeasonsService.create(data);
            setSeasons(prev => [...prev, { id, ...data }]);
            return id;
        }
        const id = 's' + Date.now();
        setSeasons(prev => [...prev, { id, ...data }]);
        return id;
    }, [useFirestore]);

    const updateSeason = useCallback(async (id, data) => {
        if (useFirestore) {
            const { SeasonsService } = await import('@/lib/firestore');
            await SeasonsService.update(id, data);
        }
        setSeasons(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    }, [useFirestore]);

    const deleteSeason = useCallback(async (id) => {
        if (useFirestore) {
            const { SeasonsService } = await import('@/lib/firestore');
            await SeasonsService.delete(id);
        }
        setSeasons(prev => prev.filter(s => s.id !== id));
    }, [useFirestore]);

    // ---- Computed values ----
    // If no seasonId selected, or 'all', or no matches have seasonId yet => show all
    const hasSeasonData = matches.some(m => m.seasonId);
    const activeMatches = (!selectedSeasonId || selectedSeasonId === 'all' || !hasSeasonData)
        ? matches
        : matches.filter(m => m.seasonId === selectedSeasonId);
    const activeMatchIds = activeMatches.map(m => m.id);
    const activeResults = (!selectedSeasonId || selectedSeasonId === 'all' || !hasSeasonData)
        ? results
        : results.filter(r => activeMatchIds.includes(r.matchId));

    const teamStats = computeTeamStats(activeMatches, activeResults);
    const topScorers = computeTopScorers(activeResults, players, 5);
    const topAssisters = computeTopAssisters(activeResults, players, 5);

    const getPlayerStats = useCallback((playerId) => {
        return computePlayerStats(playerId, activeResults);
    }, [activeResults]);

    const getUniformById = useCallback((id) => {
        return uniforms.find(u => u.id === id);
    }, [uniforms]);

    const getResultByMatchId = useCallback((matchId) => {
        return results.find(r => r.matchId === matchId);
    }, [results]);

    const value = {
        // Data
        players, uniforms, matches, results, seasons, loading, useFirestore,
        selectedSeasonId, setSelectedSeasonId, activeMatches, activeResults,
        // Player CRUD
        addPlayer, updatePlayer, deletePlayer,
        // Uniform CRUD
        addUniform, updateUniform, deleteUniform,
        // Match CRUD
        addMatch, updateMatch, deleteMatch,
        // Result CRUD
        saveResult,
        // Season CRUD
        addSeason, updateSeason, deleteSeason,
        // Computed
        teamStats, topScorers, topAssisters,
        getPlayerStats, getUniformById, getResultByMatchId,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}
