import React, { useState } from 'react';
import { Trophy, Award, Calendar, Flame, ChevronRight, ShieldCheck, Star } from 'lucide-react';

export default function PlayoffsBracket({ currentStandingsEast = [], currentStandingsWest = [], selectedSeasonName = '2026/2027' }) {
    const seasonKeys = ['2026/2027', '2025/2026', '2024/2025'];
    const initialSeason = seasonKeys.includes(selectedSeasonName) ? selectedSeasonName : '2026/2027';
    const [selectedSeason, setSelectedSeason] = useState(initialSeason);
    const [activeConference, setActiveConference] = useState('todas'); // 'todas', 'este', 'oeste'

    // Dados Históricos Reais dos Playoffs e Play-In
    const seasonsData = {
        '2025/2026': {
            nome: '2025/2026',
            campeao: {
                nome: 'New York Knicks',
                sigla: 'NYK',
                logo: '/images/teams/nyk.png',
                cor: '#006BB6',
                resultado: '4 - 2 vs San Antonio Spurs',
                mvp: 'Jalen Brunson',
                nota: 'Primeiro título dos Knicks em 53 anos após baterem os Spurs de Victor Wembanyama.'
            },
            playIn: {
                este: [
                    { tipo: '7º vs 8º (Vencedor = 7º Seed)', equipa1: { sigla: 'MIA', nome: 'Miami Heat', seed: 7, score: 112, win: true }, equipa2: { sigla: 'PHI', nome: 'Philadelphia 76ers', seed: 8, score: 104, win: false } },
                    { tipo: '9º vs 10º (Eliminatório)', equipa1: { sigla: 'CHI', nome: 'Chicago Bulls', seed: 9, score: 118, win: true }, equipa2: { sigla: 'ATL', nome: 'Atlanta Hawks', seed: 10, score: 109, win: false } },
                    { tipo: 'Jogo Decisivo (8º Seed)', equipa1: { sigla: 'PHI', nome: 'Philadelphia 76ers', seed: 8, score: 108, win: true }, equipa2: { sigla: 'CHI', nome: 'Chicago Bulls', seed: 9, score: 100, win: false } }
                ],
                oeste: [
                    { tipo: '7º vs 8º (Vencedor = 7º Seed)', equipa1: { sigla: 'GSW', nome: 'Golden State Warriors', seed: 7, score: 115, win: true }, equipa2: { sigla: 'LAL', nome: 'Los Angeles Lakers', seed: 8, score: 110, win: false } },
                    { tipo: '9º vs 10º (Eliminatório)', equipa1: { sigla: 'SAC', nome: 'Sacramento Kings', seed: 9, score: 122, win: true }, equipa2: { sigla: 'NOP', nome: 'New Orleans Pelicans', seed: 10, score: 114, win: false } },
                    { tipo: 'Jogo Decisivo (8º Seed)', equipa1: { sigla: 'LAL', nome: 'Los Angeles Lakers', seed: 8, score: 116, win: true }, equipa2: { sigla: 'SAC', nome: 'Sacramento Kings', seed: 9, score: 109, win: false } }
                ]
            },
            playoffs: {
                este: {
                    ronda1: [
                        { t1: { sigla: 'BOS', nome: 'Celtics', seed: 1, wins: 4, win: true, logo: '/images/teams/bos.png' }, t2: { sigla: 'PHI', nome: '76ers', seed: 8, wins: 1, win: false, logo: '/images/teams/phi.png' } },
                        { t1: { sigla: 'CLE', nome: 'Cavaliers', seed: 4, wins: 4, win: true, logo: '/images/teams/cle.png' }, t2: { sigla: 'MIL', nome: 'Bucks', seed: 5, wins: 3, win: false, logo: '/images/teams/mil.png' } },
                        { t1: { sigla: 'IND', nome: 'Pacers', seed: 3, wins: 2, win: false, logo: '/images/teams/ind.png' }, t2: { sigla: 'DET', nome: 'Pistons', seed: 6, wins: 4, win: true, logo: '/images/teams/det.png' } },
                        { t1: { sigla: 'NYK', nome: 'Knicks', seed: 2, wins: 4, win: true, logo: '/images/teams/nyk.png' }, t2: { sigla: 'MIA', nome: 'Heat', seed: 7, wins: 1, win: false, logo: '/images/teams/mia.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'BOS', nome: 'Celtics', seed: 1, wins: 3, win: false, logo: '/images/teams/bos.png' }, t2: { sigla: 'CLE', nome: 'Cavaliers', seed: 4, wins: 4, win: true, logo: '/images/teams/cle.png' } },
                        { t1: { sigla: 'DET', nome: 'Pistons', seed: 6, wins: 2, win: false, logo: '/images/teams/det.png' }, t2: { sigla: 'NYK', nome: 'Knicks', seed: 2, wins: 4, win: true, logo: '/images/teams/nyk.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'CLE', nome: 'Cavaliers', seed: 4, wins: 2, win: false, logo: '/images/teams/cle.png' },
                        t2: { sigla: 'NYK', nome: 'Knicks', seed: 2, wins: 4, win: true, logo: '/images/teams/nyk.png' }
                    }
                },
                oeste: {
                    ronda1: [
                        { t1: { sigla: 'OKC', nome: 'Thunder', seed: 1, wins: 4, win: true, logo: '/images/teams/okc.png' }, t2: { sigla: 'LAL', nome: 'Lakers', seed: 8, wins: 2, win: false, logo: '/images/teams/lal.png' } },
                        { t1: { sigla: 'SAS', nome: 'Spurs', seed: 4, wins: 4, win: true, logo: '/images/teams/sas.png' }, t2: { sigla: 'DAL', nome: 'Mavericks', seed: 5, wins: 3, win: false, logo: '/images/teams/dal.png' } },
                        { t1: { sigla: 'MIN', nome: 'Timberwolves', seed: 3, wins: 4, win: true, logo: '/images/teams/min.png' }, t2: { sigla: 'LAC', nome: 'Clippers', seed: 6, wins: 2, win: false, logo: '/images/teams/lac.png' } },
                        { t1: { sigla: 'DEN', nome: 'Nuggets', seed: 2, wins: 4, win: true, logo: '/images/teams/den.png' }, t2: { sigla: 'GSW', nome: 'Warriors', seed: 7, wins: 1, win: false, logo: '/images/teams/gsw.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'OKC', nome: 'Thunder', seed: 1, wins: 3, win: false, logo: '/images/teams/okc.png' }, t2: { sigla: 'SAS', nome: 'Spurs', seed: 4, wins: 4, win: true, logo: '/images/teams/sas.png' } },
                        { t1: { sigla: 'MIN', nome: 'Timberwolves', seed: 3, wins: 3, win: false, logo: '/images/teams/min.png' }, t2: { sigla: 'DEN', nome: 'Nuggets', seed: 2, wins: 4, win: true, logo: '/images/teams/den.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'SAS', nome: 'Spurs', seed: 4, wins: 4, win: true, logo: '/images/teams/sas.png' },
                        t2: { sigla: 'DEN', nome: 'Nuggets', seed: 2, wins: 3, win: false, logo: '/images/teams/den.png' }
                    }
                },
                finaisNba: {
                    t1: { sigla: 'NYK', nome: 'New York Knicks', conf: 'Este', wins: 4, win: true, logo: '/images/teams/nyk.png' },
                    t2: { sigla: 'SAS', nome: 'San Antonio Spurs', conf: 'Oeste', wins: 2, win: false, logo: '/images/teams/sas.png' }
                }
            }
        },
        '2024/2025': {
            nome: '2024/2025',
            campeao: {
                nome: 'Boston Celtics',
                sigla: 'BOS',
                logo: '/images/teams/bos.png',
                cor: '#007A33',
                resultado: '4 - 1 vs Dallas Mavericks',
                mvp: 'Jaylen Brown',
                nota: 'Banner 18 conquistado de forma dominante sob liderança de Jayson Tatum e Jaylen Brown.'
            },
            playIn: {
                este: [
                    { tipo: '7º vs 8º', equipa1: { sigla: 'PHI', nome: 'Philadelphia 76ers', seed: 7, score: 105, win: true }, equipa2: { sigla: 'MIA', nome: 'Miami Heat', seed: 8, score: 104, win: false } },
                    { tipo: '9º vs 10º', equipa1: { sigla: 'CHI', nome: 'Chicago Bulls', seed: 9, score: 131, win: true }, equipa2: { sigla: 'ATL', nome: 'Atlanta Hawks', seed: 10, score: 116, win: false } },
                    { tipo: 'Decisão 8º Seed', equipa1: { sigla: 'MIA', nome: 'Miami Heat', seed: 8, score: 112, win: true }, equipa2: { sigla: 'CHI', nome: 'Chicago Bulls', seed: 9, score: 91, win: false } }
                ],
                oeste: [
                    { tipo: '7º vs 8º', equipa1: { sigla: 'NOP', nome: 'New Orleans Pelicans', seed: 7, score: 106, win: false }, equipa2: { sigla: 'LAL', nome: 'Los Angeles Lakers', seed: 8, score: 110, win: true } },
                    { tipo: '9º vs 10º', equipa1: { sigla: 'SAC', nome: 'Sacramento Kings', seed: 9, score: 118, win: true }, equipa2: { sigla: 'GSW', nome: 'Golden State Warriors', seed: 10, score: 94, win: false } },
                    { tipo: 'Decisão 8º Seed', equipa1: { sigla: 'NOP', nome: 'New Orleans Pelicans', seed: 7, score: 105, win: true }, equipa2: { sigla: 'SAC', nome: 'Sacramento Kings', seed: 9, score: 98, win: false } }
                ]
            },
            playoffs: {
                este: {
                    ronda1: [
                        { t1: { sigla: 'BOS', nome: 'Celtics', seed: 1, wins: 4, win: true, logo: '/images/teams/bos.png' }, t2: { sigla: 'MIA', nome: 'Heat', seed: 8, wins: 1, win: false, logo: '/images/teams/mia.png' } },
                        { t1: { sigla: 'CLE', nome: 'Cavaliers', seed: 4, wins: 4, win: true, logo: '/images/teams/cle.png' }, t2: { sigla: 'ORL', nome: 'Magic', seed: 5, wins: 3, win: false, logo: '/images/teams/orl.png' } },
                        { t1: { sigla: 'MIL', nome: 'Bucks', seed: 3, wins: 2, win: false, logo: '/images/teams/mil.png' }, t2: { sigla: 'IND', nome: 'Pacers', seed: 6, wins: 4, win: true, logo: '/images/teams/ind.png' } },
                        { t1: { sigla: 'NYK', nome: 'Knicks', seed: 2, wins: 4, win: true, logo: '/images/teams/nyk.png' }, t2: { sigla: 'PHI', nome: '76ers', seed: 7, wins: 2, win: false, logo: '/images/teams/phi.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'BOS', nome: 'Celtics', seed: 1, wins: 4, win: true, logo: '/images/teams/bos.png' }, t2: { sigla: 'CLE', nome: 'Cavaliers', seed: 4, wins: 1, win: false, logo: '/images/teams/cle.png' } },
                        { t1: { sigla: 'IND', nome: 'Pacers', seed: 6, wins: 4, win: true, logo: '/images/teams/ind.png' }, t2: { sigla: 'NYK', nome: 'Knicks', seed: 2, wins: 3, win: false, logo: '/images/teams/nyk.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'BOS', nome: 'Celtics', seed: 1, wins: 4, win: true, logo: '/images/teams/bos.png' },
                        t2: { sigla: 'IND', nome: 'Pacers', seed: 6, wins: 0, win: false, logo: '/images/teams/ind.png' }
                    }
                },
                oeste: {
                    ronda1: [
                        { t1: { sigla: 'OKC', nome: 'Thunder', seed: 1, wins: 4, win: true, logo: '/images/teams/okc.png' }, t2: { sigla: 'NOP', nome: 'Pelicans', seed: 8, wins: 0, win: false, logo: '/images/teams/nop.png' } },
                        { t1: { sigla: 'LAC', nome: 'Clippers', seed: 4, wins: 2, win: false, logo: '/images/teams/lac.png' }, t2: { sigla: 'DAL', nome: 'Mavericks', seed: 5, wins: 4, win: true, logo: '/images/teams/dal.png' } },
                        { t1: { sigla: 'MIN', nome: 'Timberwolves', seed: 3, wins: 4, win: true, logo: '/images/teams/min.png' }, t2: { sigla: 'PHX', nome: 'Suns', seed: 6, wins: 0, win: false, logo: '/images/teams/phx.png' } },
                        { t1: { sigla: 'DEN', nome: 'Nuggets', seed: 2, wins: 4, win: true, logo: '/images/teams/den.png' }, t2: { sigla: 'LAL', nome: 'Lakers', seed: 7, wins: 1, win: false, logo: '/images/teams/lal.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'OKC', nome: 'Thunder', seed: 1, wins: 2, win: false, logo: '/images/teams/okc.png' }, t2: { sigla: 'DAL', nome: 'Mavericks', seed: 5, wins: 4, win: true, logo: '/images/teams/dal.png' } },
                        { t1: { sigla: 'MIN', nome: 'Timberwolves', seed: 3, wins: 4, win: true, logo: '/images/teams/min.png' }, t2: { sigla: 'DEN', nome: 'Nuggets', seed: 2, wins: 3, win: false, logo: '/images/teams/den.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'DAL', nome: 'Mavericks', seed: 5, wins: 4, win: true, logo: '/images/teams/dal.png' },
                        t2: { sigla: 'MIN', nome: 'Timberwolves', seed: 3, wins: 1, win: false, logo: '/images/teams/min.png' }
                    }
                },
                finaisNba: {
                    t1: { sigla: 'BOS', nome: 'Boston Celtics', conf: 'Este', wins: 4, win: true, logo: '/images/teams/bos.png' },
                    t2: { sigla: 'DAL', nome: 'Dallas Mavericks', conf: 'Oeste', wins: 1, win: false, logo: '/images/teams/dal.png' }
                }
            }
        },
        '2026/2027': {
            nome: '2026/2027 (Projeção Atual)',
            campeao: {
                nome: 'Em Disputa (Temporada Regular)',
                sigla: 'NBA',
                logo: '/images/teams/tor.png',
                cor: '#1D428A',
                resultado: 'Projeção Oficial ao Vivo',
                mvp: 'A definir em Junho 2027',
                nota: 'Emparelhamentos projetados com base na tabela oficial da classificação em direto.'
            },
            playIn: {
                este: [
                    { tipo: '7º vs 8º Seed Play-In', equipa1: { sigla: currentStandingsEast[6]?.sigla || 'IND', nome: currentStandingsEast[6]?.nome_completo || 'Pacers', seed: 7, score: '-', win: false }, equipa2: { sigla: currentStandingsEast[7]?.sigla || 'NYK', nome: currentStandingsEast[7]?.nome_completo || 'Knicks', seed: 8, score: '-', win: false } },
                    { tipo: '9º vs 10º Seed Play-In', equipa1: { sigla: currentStandingsEast[8]?.sigla || 'ORL', nome: currentStandingsEast[8]?.nome_completo || 'Magic', seed: 9, score: '-', win: false }, equipa2: { sigla: currentStandingsEast[9]?.sigla || 'BKN', nome: currentStandingsEast[9]?.nome_completo || 'Nets', seed: 10, score: '-', win: false } },
                    { tipo: 'Decisão 8º Seed Play-In', equipa1: { sigla: 'TBD', nome: 'Perdedor 7v8', seed: 8, score: '-', win: false }, equipa2: { sigla: 'TBD', nome: 'Vencedor 9v10', seed: 9, score: '-', win: false } }
                ],
                oeste: [
                    { tipo: '7º vs 8º Seed Play-In', equipa1: { sigla: currentStandingsWest[6]?.sigla || 'HOU', nome: currentStandingsWest[6]?.nome_completo || 'Rockets', seed: 7, score: '-', win: false }, equipa2: { sigla: currentStandingsWest[7]?.sigla || 'NOP', nome: currentStandingsWest[7]?.nome_completo || 'Pelicans', seed: 8, score: '-', win: false } },
                    { tipo: '9º vs 10º Seed Play-In', equipa1: { sigla: currentStandingsWest[8]?.sigla || 'DEN', nome: currentStandingsWest[8]?.nome_completo || 'Nuggets', seed: 9, score: '-', win: false }, equipa2: { sigla: currentStandingsWest[9]?.sigla || 'SAS', nome: currentStandingsWest[9]?.nome_completo || 'Spurs', seed: 10, score: '-', win: false } },
                    { tipo: 'Decisão 8º Seed Play-In', equipa1: { sigla: 'TBD', nome: 'Perdedor 7v8', seed: 8, score: '-', win: false }, equipa2: { sigla: 'TBD', nome: 'Vencedor 9v10', seed: 9, score: '-', win: false } }
                ]
            },
            playoffs: {
                este: {
                    ronda1: [
                        { t1: { sigla: currentStandingsEast[0]?.sigla || 'TOR', nome: 'Raptors', seed: 1, wins: '-', win: false, logo: currentStandingsEast[0]?.logo_url || '/images/teams/tor.png' }, t2: { sigla: 'PLAY-IN', nome: '8º Seed', seed: 8, wins: '-', win: false, logo: '/images/teams/phi.png' } },
                        { t1: { sigla: currentStandingsEast[3]?.sigla || 'DET', nome: 'Pistons', seed: 4, wins: '-', win: false, logo: currentStandingsEast[3]?.logo_url || '/images/teams/det.png' }, t2: { sigla: currentStandingsEast[4]?.sigla || 'CHA', nome: 'Hornets', seed: 5, wins: '-', win: false, logo: currentStandingsEast[4]?.logo_url || '/images/teams/cha.png' } },
                        { t1: { sigla: currentStandingsEast[2]?.sigla || 'WAS', nome: 'Wizards', seed: 3, wins: '-', win: false, logo: currentStandingsEast[2]?.logo_url || '/images/teams/was.png' }, t2: { sigla: currentStandingsEast[5]?.sigla || 'ATL', nome: 'Hawks', seed: 6, wins: '-', win: false, logo: currentStandingsEast[5]?.logo_url || '/images/teams/atl.png' } },
                        { t1: { sigla: currentStandingsEast[1]?.sigla || 'PHI', nome: '76ers', seed: 2, wins: '-', win: false, logo: currentStandingsEast[1]?.logo_url || '/images/teams/phi.png' }, t2: { sigla: 'PLAY-IN', nome: '7º Seed', seed: 7, wins: '-', win: false, logo: '/images/teams/mia.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'TBD', nome: 'Vencedor 1v8', seed: 1, wins: '-', win: false, logo: '/images/teams/tor.png' }, t2: { sigla: 'TBD', nome: 'Vencedor 4v5', seed: 4, wins: '-', win: false, logo: '/images/teams/det.png' } },
                        { t1: { sigla: 'TBD', nome: 'Vencedor 3v6', seed: 3, wins: '-', win: false, logo: '/images/teams/was.png' }, t2: { sigla: 'TBD', nome: 'Vencedor 2v7', seed: 2, wins: '-', win: false, logo: '/images/teams/phi.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'TBD', nome: 'Finalista Este 1', seed: 1, wins: '-', win: false, logo: '/images/teams/tor.png' },
                        t2: { sigla: 'TBD', nome: 'Finalista Este 2', seed: 2, wins: '-', win: false, logo: '/images/teams/phi.png' }
                    }
                },
                oeste: {
                    ronda1: [
                        { t1: { sigla: currentStandingsWest[0]?.sigla || 'POR', nome: 'Blazers', seed: 1, wins: '-', win: false, logo: currentStandingsWest[0]?.logo_url || '/images/teams/por.png' }, t2: { sigla: 'PLAY-IN', nome: '8º Seed', seed: 8, wins: '-', win: false, logo: '/images/teams/okc.png' } },
                        { t1: { sigla: currentStandingsWest[3]?.sigla || 'OKC', nome: 'Thunder', seed: 4, wins: '-', win: false, logo: currentStandingsWest[3]?.logo_url || '/images/teams/okc.png' }, t2: { sigla: currentStandingsWest[4]?.sigla || 'LAL', nome: 'Lakers', seed: 5, wins: '-', win: false, logo: currentStandingsWest[4]?.logo_url || '/images/teams/lal.png' } },
                        { t1: { sigla: currentStandingsWest[2]?.sigla || 'MIN', nome: 'Wolves', seed: 3, wins: '-', win: false, logo: currentStandingsWest[2]?.logo_url || '/images/teams/min.png' }, t2: { sigla: currentStandingsWest[5]?.sigla || 'MEM', nome: 'Grizzlies', seed: 6, wins: '-', win: false, logo: currentStandingsWest[5]?.logo_url || '/images/teams/mem.png' } },
                        { t1: { sigla: currentStandingsWest[1]?.sigla || 'LAC', nome: 'Clippers', seed: 2, wins: '-', win: false, logo: currentStandingsWest[1]?.logo_url || '/images/teams/lac.png' }, t2: { sigla: 'PLAY-IN', nome: '7º Seed', seed: 7, wins: '-', win: false, logo: '/images/teams/hou.png' } }
                    ],
                    semis: [
                        { t1: { sigla: 'TBD', nome: 'Vencedor 1v8', seed: 1, wins: '-', win: false, logo: '/images/teams/por.png' }, t2: { sigla: 'TBD', nome: 'Vencedor 4v5', seed: 4, wins: '-', win: false, logo: '/images/teams/okc.png' } },
                        { t1: { sigla: 'TBD', nome: 'Vencedor 3v6', seed: 3, wins: '-', win: false, logo: '/images/teams/min.png' }, t2: { sigla: 'TBD', nome: 'Vencedor 2v7', seed: 2, wins: '-', win: false, logo: '/images/teams/lac.png' } }
                    ],
                    finaisConf: {
                        t1: { sigla: 'TBD', nome: 'Finalista Oeste 1', seed: 1, wins: '-', win: false, logo: '/images/teams/por.png' },
                        t2: { sigla: 'TBD', nome: 'Finalista Oeste 2', seed: 2, wins: '-', win: false, logo: '/images/teams/lac.png' }
                    }
                },
                finaisNba: {
                    t1: { sigla: 'ESTE', nome: 'Campeão do Este', conf: 'Este', wins: '-', win: false, logo: '/images/teams/tor.png' },
                    t2: { sigla: 'OESTE', nome: 'Campeão do Oeste', conf: 'Oeste', wins: '-', win: false, logo: '/images/teams/por.png' }
                }
            }
        }
    };

    const currentData = seasonsData[selectedSeason] || seasonsData['2025/2026'];
    const { campeao, playIn, playoffs } = currentData;

    return (
        <section id="playoffs" className="mb-12 scroll-mt-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center">
                        <Trophy className="w-6 h-6 mr-2.5 text-amber-400" />
                        Playoffs & Torneio Play-In da NBA
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Árvore oficial de eliminatórias, emparelhamentos e decisões de títulos históricos e em direto.
                    </p>
                </div>

                {/* Seletor de Épocas */}
                <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                    {Object.keys(seasonsData).map((seasonKey) => (
                        <button
                            key={seasonKey}
                            onClick={() => setSelectedSeason(seasonKey)}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                                selectedSeason === seasonKey
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {seasonKey}
                        </button>
                    ))}
                </div>
            </div>

            {/* Banner do Campeão da Época */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-5 sm:p-6 mb-8 relative overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-500/30 p-2 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <img src={campeao.logo} alt={campeao.nome} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                                Campeão da NBA ({selectedSeason}) • Troféu Larry O'Brien
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white">{campeao.nome}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{campeao.nota}</p>
                        </div>
                    </div>

                    <div className="text-center sm:text-right bg-slate-950/70 px-4 py-2.5 rounded-2xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">MVP das Finais</span>
                        <span className="text-sm font-black text-amber-400 font-sans block">{campeao.mvp}</span>
                        <span className="text-[11px] font-mono text-slate-400">{campeao.resultado}</span>
                    </div>
                </div>
            </div>

            {/* Secção 1: Torneio Play-In */}
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        Torneio Play-In Oficial (7.º ao 10.º Lugar)
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Play-In Conferência Este */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                            <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Conferência Este</span>
                            <span className="text-[10px] font-bold text-slate-400">2 Vagas de Playoffs</span>
                        </div>
                        <div className="space-y-2.5">
                            {playIn.este.map((match, i) => (
                                <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase max-w-[130px] truncate">{match.tipo}</span>
                                    <div className="flex items-center space-x-3 font-mono">
                                        <span className={`font-bold ${match.equipa1.win ? 'text-white' : 'text-slate-400'}`}>
                                            #{match.equipa1.seed} {match.equipa1.sigla} ({match.equipa1.score})
                                        </span>
                                        <span className="text-slate-600">vs</span>
                                        <span className={`font-bold ${match.equipa2.win ? 'text-white' : 'text-slate-400'}`}>
                                            #{match.equipa2.seed} {match.equipa2.sigla} ({match.equipa2.score})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Play-In Conferência Oeste */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                            <span className="text-xs font-black text-red-400 uppercase tracking-wider">Conferência Oeste</span>
                            <span className="text-[10px] font-bold text-slate-400">2 Vagas de Playoffs</span>
                        </div>
                        <div className="space-y-2.5">
                            {playIn.oeste.map((match, i) => (
                                <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase max-w-[130px] truncate">{match.tipo}</span>
                                    <div className="flex items-center space-x-3 font-mono">
                                        <span className={`font-bold ${match.equipa1.win ? 'text-white' : 'text-slate-400'}`}>
                                            #{match.equipa1.seed} {match.equipa1.sigla} ({match.equipa1.score})
                                        </span>
                                        <span className="text-slate-600">vs</span>
                                        <span className={`font-bold ${match.equipa2.win ? 'text-white' : 'text-slate-400'}`}>
                                            #{match.equipa2.seed} {match.equipa2.sigla} ({match.equipa2.score})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secção 2: Árvore Completa dos Playoffs (Bracket) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-x-auto">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            Bracket Oficial dos Playoffs da NBA (Séries à Melhor de 7)
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Temporada {selectedSeason}</span>
                </div>

                {/* Estrutura Visual da Árvore */}
                <div className="min-w-[900px] grid grid-cols-5 gap-4 items-center">
                    {/* Coluna 1: 1ª Ronda Este (4 Séries) */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase font-black text-blue-400 pb-1 text-center border-b border-slate-800">
                            1.ª Ronda (Este)
                        </div>
                        {playoffs.este.ronda1.map((m, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-md">
                                <div className={`flex items-center justify-between text-xs ${m.t1.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t1.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t1.seed} {m.t1.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t1.wins}</span>
                                </div>
                                <div className={`flex items-center justify-between text-xs ${m.t2.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t2.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t2.seed} {m.t2.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t2.wins}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coluna 2: Semifinais Este (2 Séries) */}
                    <div className="space-y-12">
                        <div className="text-[10px] uppercase font-black text-blue-400 pb-1 text-center border-b border-slate-800">
                            Semis de Conf. (Este)
                        </div>
                        {playoffs.este.semis.map((m, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-md">
                                <div className={`flex items-center justify-between text-xs ${m.t1.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t1.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t1.seed} {m.t1.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t1.wins}</span>
                                </div>
                                <div className={`flex items-center justify-between text-xs ${m.t2.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t2.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t2.seed} {m.t2.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t2.wins}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coluna 3: Finais da NBA (Centro) */}
                    <div className="space-y-4 px-2">
                        <div className="text-[11px] uppercase font-black text-amber-400 pb-1 text-center border-b border-amber-500/30">
                            🏆 Finais da NBA
                        </div>
                        
                        {/* Card das Finais da NBA */}
                        <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-2xl text-center">
                            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2 drop-shadow" />
                            
                            <div className="space-y-3 py-2 font-mono">
                                <div className={`flex items-center justify-between text-xs ${playoffs.finaisNba.t1.win ? 'text-amber-300 font-black' : 'text-slate-300'}`}>
                                    <span className="flex items-center space-x-1.5 truncate font-sans font-bold">
                                        <img src={playoffs.finaisNba.t1.logo} className="w-5 h-5 object-contain" />
                                        <span>{playoffs.finaisNba.t1.sigla}</span>
                                    </span>
                                    <span className="text-base font-black">{playoffs.finaisNba.t1.wins}</span>
                                </div>
                                <div className={`flex items-center justify-between text-xs ${playoffs.finaisNba.t2.win ? 'text-amber-300 font-black' : 'text-slate-300'}`}>
                                    <span className="flex items-center space-x-1.5 truncate font-sans font-bold">
                                        <img src={playoffs.finaisNba.t2.logo} className="w-5 h-5 object-contain" />
                                        <span>{playoffs.finaisNba.t2.sigla}</span>
                                    </span>
                                    <span className="text-base font-black">{playoffs.finaisNba.t2.wins}</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-bold uppercase">
                                Campeão: {campeao.nome}
                            </div>
                        </div>
                    </div>

                    {/* Coluna 4: Semifinais Oeste (2 Séries) */}
                    <div className="space-y-12">
                        <div className="text-[10px] uppercase font-black text-red-400 pb-1 text-center border-b border-slate-800">
                            Semis de Conf. (Oeste)
                        </div>
                        {playoffs.oeste.semis.map((m, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-md">
                                <div className={`flex items-center justify-between text-xs ${m.t1.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t1.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t1.seed} {m.t1.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t1.wins}</span>
                                </div>
                                <div className={`flex items-center justify-between text-xs ${m.t2.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t2.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t2.seed} {m.t2.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t2.wins}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coluna 5: 1ª Ronda Oeste (4 Séries) */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase font-black text-red-400 pb-1 text-center border-b border-slate-800">
                            1.ª Ronda (Oeste)
                        </div>
                        {playoffs.oeste.ronda1.map((m, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-md">
                                <div className={`flex items-center justify-between text-xs ${m.t1.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t1.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t1.seed} {m.t1.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t1.wins}</span>
                                </div>
                                <div className={`flex items-center justify-between text-xs ${m.t2.win ? 'text-white font-black' : 'text-slate-400'}`}>
                                    <span className="flex items-center space-x-1.5 truncate">
                                        <img src={m.t2.logo} className="w-4 h-4 object-contain inline" />
                                        <span>#{m.t2.seed} {m.t2.sigla}</span>
                                    </span>
                                    <span className="font-mono text-sm">{m.t2.wins}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
