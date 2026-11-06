import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import HeroBanner from '@/Components/HeroBanner';
import MyNbaWidget from '@/Components/MyNbaWidget';
import GamesTicker from '@/Components/GamesTicker';
import KPIsBar from '@/Components/KPIsBar';
import StandingsTable from '@/Components/StandingsTable';
import LeagueLeaders from '@/Components/LeagueLeaders';
import PlayerComparator from '@/Components/PlayerComparator';
import PlayoffsBracket from '@/Components/PlayoffsBracket';
import TeamsGrid from '@/Components/TeamsGrid';
import NewsSection from '@/Components/NewsSection';
import TeamDrawer from '@/Components/TeamDrawer';

export default function Welcome({
    auth,
    heroGame,
    recentGames,
    standingsEast,
    standingsWest,
    teams,
    news,
    kpis,
    seasons,
    selectedSeasonId,
    lastSyncTime,
    leagueLeaders = {},
    comparativePlayers = [],
}) {
    // Estado do Drawer Lateral (Equipa selecionada)
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Abrir o Drawer através da sigla ou objeto
    const handleSelectTeam = (siglaOrTeam) => {
        let teamToOpen = null;
        if (typeof siglaOrTeam === 'string') {
            teamToOpen = teams.find(t => t.sigla === siglaOrTeam);
        } else {
            teamToOpen = siglaOrTeam;
        }

        if (teamToOpen) {
            setSelectedTeam(teamToOpen);
            setIsDrawerOpen(true);
        }
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Head title="NBA League Manager & Hub Pro - Oficial" />

            {/* Barra de Navegação */}
            <Navbar auth={auth} />

            {/* Corpo Principal */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 1. Hero Banner Interativo (Jogo Destaque / Live Score) */}
                <HeroBanner 
                    game={heroGame} 
                    onSelectTeam={handleSelectTeam} 
                />

                {/* 2. Área "Minha NBA & Favoritos" */}
                <MyNbaWidget
                    auth={auth}
                    teams={teams}
                />

                {/* 3. Marcador Oficial de Jogos Recentes com Quarters (Q1-Q4) e Sincronização ESPN */}
                <GamesTicker 
                    games={recentGames}
                    onSelectTeam={handleSelectTeam}
                    lastSyncTime={lastSyncTime}
                />

                {/* 3. Barra de KPIs Automáticos da Liga */}
                <KPIsBar kpis={kpis} />

                {/* 3. Tabela de Classificação Oficial (Este e Oeste) */}
                <StandingsTable 
                    eastStandings={standingsEast} 
                    westStandings={standingsWest} 
                    seasons={seasons}
                    selectedSeasonId={selectedSeasonId}
                    onSelectTeam={handleSelectTeam}
                />

                {/* 4. Líderes Estatísticos da Liga */}
                <LeagueLeaders
                    leaders={leagueLeaders}
                    onSelectTeam={handleSelectTeam}
                />

                {/* 5. Comparador Head-to-Head */}
                <PlayerComparator players={comparativePlayers} />

                {/* 6. Playoffs e Play-In */}
                <PlayoffsBracket
                    currentStandingsEast={standingsEast}
                    currentStandingsWest={standingsWest}
                    selectedSeasonName={seasons?.find((s) => Number(s.id) === Number(selectedSeasonId))?.nome}
                />

                {/* 7. Grelha das 30 Franquias Oficiais */}
                <TeamsGrid 
                    teams={teams} 
                    onSelectTeam={handleSelectTeam} 
                />

                {/* 5. Portal de Notícias & Editorial */}
                <NewsSection news={news} />
            </main>

            {/* Painel Lateral Deslizante (Drawer dos 8 Atletas) */}
            <TeamDrawer 
                team={selectedTeam} 
                isOpen={isDrawerOpen} 
                onClose={handleCloseDrawer} 
            />

            {/* Rodapé Oficial */}
            <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-16 text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white italic">
                            NBA
                        </div>
                        <span>
                            NBA League Manager & Hub Pro © 2026 • Plataforma de Gestão Desportiva e Estatística
                        </span>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-400">
                        <span>Tecnologias: <strong>Laravel 10 • Inertia.js • React • Tailwind CSS</strong></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
