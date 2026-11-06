import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    SkipBack,
    SkipForward,
    Activity,
    Sparkles,
    Trophy,
    Flame,
    Target,
    Zap,
    Filter,
    Volume2,
    VolumeX,
    ArrowRightLeft,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

export default function CourtReplaySimulator({
    replayPlays = [],
    homeTeam = {},
    awayTeam = {},
    homeStats = [],
    awayStats = [],
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'shots' | 'made' | 'threes'
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [transitionEnabled, setTransitionEnabled] = useState(true);

    // Fases da jogada: 'transition' | 'pass' | 'shot' | 'result'
    const [playPhase, setPlayPhase] = useState('transition');
    const [transProgress, setTransProgress] = useState(0); // 0 -> 1
    const [flightProgress, setFlightProgress] = useState(0); // 0 -> 1
    const [resultProgress, setResultProgress] = useState(0); // 0 -> 1
    const [showSplash, setShowSplash] = useState(false);
    const [transitionNonce, setTransitionNonce] = useState(0);

    const audioCtxRef = useRef(null);

    // Cores das equipas
    const homeColor = homeTeam?.cor_primaria || '#1D428A';
    const awayColor = awayTeam?.cor_primaria || '#C8102E';

    // Lista de jogadas filtradas
    const filteredPlays = useMemo(() => {
        if (!replayPlays || replayPlays.length === 0) return [];
        if (filterCategory === 'shots') {
            return replayPlays.filter(p => p.is_shot);
        }
        if (filterCategory === 'made') {
            return replayPlays.filter(p => p.is_shot && p.shot_made);
        }
        if (filterCategory === 'threes') {
            return replayPlays.filter(p => p.is_shot && p.shot_type === '3-Pointer');
        }
        return replayPlays;
    }, [replayPlays, filterCategory]);

    // Índice protegido
    const safeIndex = Math.min(currentIndex, Math.max(0, filteredPlays.length - 1));
    const currentPlay = filteredPlays[safeIndex] || replayPlays[0] || null;

    // Helper de som sintético via Web Audio API
    const playSynthSound = useCallback((type) => {
        if (!soundEnabled) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'swish') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(540, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1080, ctx.currentTime + 0.16);
                gain.gain.setValueAtTime(0.22, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.24);
                osc.start();
                osc.stop(ctx.currentTime + 0.24);
            } else if (type === 'pass') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            } else if (type === 'rim') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(160, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
                osc.start();
                osc.stop(ctx.currentTime + 0.16);
            } else if (type === 'dribble') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.06);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
                osc.start();
                osc.stop(ctx.currentTime + 0.07);
            }
        } catch (e) {}
    }, [soundEnabled]);

    // Comparação de nomes flexível
    const matchPlayerName = (ath, targetName) => {
        if (!ath || !targetName) return false;
        const name1 = (ath.nome_completo || '').toLowerCase().trim();
        const name2 = targetName.toLowerCase().trim();
        if (name1 === name2) return true;
        if (name1.includes(name2) || name2.includes(name1)) return true;

        const p1 = name1.split(' ');
        const p2 = name2.split(' ');
        const last1 = p1[p1.length - 1];
        const last2 = p2[p2.length - 1];
        return (last1.length >= 3 && last2.length >= 3 && last1 === last2);
    };

    // Obter o 5 em campo
    const getFiveManLineup = (roster, primaryName, secondaryName) => {
        if (!roster || roster.length === 0) return [];
        let starters = roster.filter(s => s.titular);
        if (starters.length < 5) starters = roster.slice(0, 5);
        else starters = starters.slice(0, 5);

        const lineup = starters.map(p => ({ ...p }));

        if (primaryName) {
            const alreadyIn = lineup.some(p => matchPlayerName(p, primaryName));
            if (!alreadyIn) {
                const benchPlayer = roster.find(p => matchPlayerName(p, primaryName));
                if (benchPlayer) {
                    const matchPosIdx = lineup.findIndex(p => p.posicao === benchPlayer.posicao);
                    const replaceIdx = matchPosIdx !== -1 ? matchPosIdx : (lineup.length - 1);
                    lineup[replaceIdx] = { ...benchPlayer };
                }
            }
        }

        if (secondaryName) {
            const alreadyIn = lineup.some(p => matchPlayerName(p, secondaryName));
            if (!alreadyIn) {
                const benchPlayer = roster.find(p => matchPlayerName(p, secondaryName));
                if (benchPlayer) {
                    const replaceIdx = lineup.findIndex(p => !matchPlayerName(p, primaryName));
                    if (replaceIdx !== -1) lineup[replaceIdx] = { ...benchPlayer };
                }
            }
        }

        return lineup.slice(0, 5);
    };

    // Tática, Espaçamento e Coordenadas
    const tacticalData = useMemo(() => {
        if (!currentPlay) {
            return {
                isHomeAttack: true,
                offLineup: [],
                defLineup: [],
                shooterIdx: 0,
                passerIdx: -1,
                handlerIdx: 0,
                shooterCoords: { x: 74, y: 25 },
                passerCoords: null,
                rim: { x: 94, y: 25 },
                offCoords: [],
                defCoords: [],
                startOffCoords: [],
                startDefCoords: [],
            };
        }

        const isHomeAttack = currentPlay.is_home ?? true;
        const offStats = isHomeAttack ? homeStats : awayStats;
        const defStats = isHomeAttack ? awayStats : homeStats;

        const shooterName = currentPlay.player_name || '';
        const passerName = currentPlay.assist?.player_name || null;

        const offLineup = getFiveManLineup(offStats, shooterName, passerName);
        const defLineup = getFiveManLineup(defStats, null, null);

        let shooterIdx = offLineup.findIndex(p => matchPlayerName(p, shooterName));
        if (shooterIdx === -1) shooterIdx = 0;

        let passerIdx = -1;
        if (passerName) {
            passerIdx = offLineup.findIndex((p, idx) => idx !== shooterIdx && matchPlayerName(p, passerName));
        }

        // Portador inicial da bola na transição: passer se houver, ou base (0), ou lançador
        const handlerIdx = passerIdx !== -1 ? passerIdx : 0;

        // Cesto Alvo: Home ataca o aro direito (x=94), Away ataca o aro esquerdo (x=6)
        const rim = isHomeAttack ? { x: 94, y: 25 } : { x: 6, y: 25 };

        // Coordenadas Exatas do Lançador a partir dos dados reais do lance
        const rawY = currentPlay.shot_y ?? 18;
        const rawX = currentPlay.shot_x ?? 50;
        const depth = Math.max(0, (rawY - 12)) * 0.65;
        const lateral = (rawX - 50) * 0.44;

        const shooterX = isHomeAttack
            ? Math.max(56, Math.min(94, 94 - depth))
            : Math.max(6, Math.min(44, 6 + depth));

        const shooterY = isHomeAttack
            ? Math.max(7, Math.min(43, 25 + lateral))
            : Math.max(7, Math.min(43, 25 - lateral));

        const shooterCoords = { x: shooterX, y: shooterY };

        // Slots Oficiais de Espaçamento Tático 5-Out da NBA
        const tacticalSlots = isHomeAttack
            ? [
                  { name: 'top_key',    x: 68, y: 25 },
                  { name: 'wing_top',   x: 74, y: 13 },
                  { name: 'wing_bot',   x: 74, y: 37 },
                  { name: 'corner_top', x: 90, y: 7.5 },
                  { name: 'corner_bot', x: 90, y: 42.5 },
                  { name: 'dunker',     x: 88, y: 19 },
                  { name: 'high_post',  x: 80, y: 30 },
              ]
            : [
                  { name: 'top_key',    x: 32, y: 25 },
                  { name: 'wing_top',   x: 26, y: 13 },
                  { name: 'wing_bot',   x: 26, y: 37 },
                  { name: 'corner_top', x: 10, y: 7.5 },
                  { name: 'corner_bot', x: 10, y: 42.5 },
                  { name: 'dunker',     x: 12, y: 19 },
                  { name: 'high_post',  x: 20, y: 30 },
              ];

        // Ordenar slots para preencher os colegas
        const slotsSorted = [...tacticalSlots].sort((a, b) => {
            const da = Math.hypot(a.x - shooterX, a.y - shooterY);
            const db = Math.hypot(b.x - shooterX, b.y - shooterY);
            return da - db;
        });

        const availableSlots = slotsSorted.slice(1);

        let passerCoords = null;
        if (passerIdx !== -1) {
            const bestPassSlot = availableSlots.find(s => s.name === 'top_key') || availableSlots[0];
            passerCoords = { x: bestPassSlot.x, y: bestPassSlot.y };
        }

        // Atribuir coordenadas finais ofensivas
        const offCoords = [];
        let slotCounter = 0;
        const seqSeed = (currentPlay.sequence || 1);

        for (let i = 0; i < 5; i++) {
            if (i === shooterIdx) {
                offCoords.push(shooterCoords);
            } else if (i === passerIdx && passerCoords) {
                offCoords.push(passerCoords);
            } else {
                const slot = availableSlots[slotCounter % availableSlots.length];
                slotCounter++;
                const microX = Math.sin(seqSeed + i) * 0.7;
                const microY = Math.cos(seqSeed + i) * 0.7;
                offCoords.push({
                    x: Math.max(isHomeAttack ? 54 : 6, Math.min(isHomeAttack ? 94 : 46, slot.x + microX)),
                    y: Math.max(7, Math.min(43, slot.y + microY)),
                });
            }
        }

        // Atribuir coordenadas defensivas (Marcação e contestação)
        const defCoords = [];
        for (let i = 0; i < 5; i++) {
            const assignedOff = offCoords[i];
            if (i === shooterIdx) {
                const dx = shooterX - rim.x;
                const dy = shooterY - rim.y;
                const dist = Math.hypot(dx, dy) || 1;
                const contestDist = Math.min(3.2, Math.max(2.0, dist * 0.25));
                defCoords.push({
                    x: shooterX - (dx / dist) * contestDist,
                    y: shooterY - (dy / dist) * contestDist,
                });
            } else {
                const dx = assignedOff.x - rim.x;
                const dy = assignedOff.y - rim.y;
                defCoords.push({
                    x: assignedOff.x - dx * 0.32,
                    y: assignedOff.y - dy * 0.32,
                });
            }
        }

        // Coordenadas Iniciais da Transição de Quadra (Recuperação no fundo defensivo)
        const startOffCoords = [];
        const startDefCoords = [];

        if (isHomeAttack) {
            // Home recupera no fundo esquerdo (x=8..16) e corre para a direita
            for (let i = 0; i < 5; i++) {
                if (i === handlerIdx) {
                    startOffCoords.push({ x: 14, y: 25 }); // Portador conduz pelo centro
                } else if (i === 1) {
                    startOffCoords.push({ x: 16, y: 10 }); // Ala superior
                } else if (i === 2) {
                    startOffCoords.push({ x: 16, y: 40 }); // Ala inferior
                } else if (i === 3) {
                    startOffCoords.push({ x: 8,  y: 20 }); // Poste rim runner
                } else {
                    startOffCoords.push({ x: 10, y: 30 }); // Atirador trailer
                }
            }

            // Defesa de Fora recua a correr para a direita
            startDefCoords.push({ x: 36, y: 22 });
            startDefCoords.push({ x: 32, y: 12 });
            startDefCoords.push({ x: 32, y: 38 });
            startDefCoords.push({ x: 28, y: 25 });
            startDefCoords.push({ x: 24, y: 30 });
        } else {
            // Away recupera no fundo direito (x=92..84) e corre para a esquerda
            for (let i = 0; i < 5; i++) {
                if (i === handlerIdx) {
                    startOffCoords.push({ x: 86, y: 25 }); // Portador conduz pelo centro
                } else if (i === 1) {
                    startOffCoords.push({ x: 84, y: 10 }); // Ala superior
                } else if (i === 2) {
                    startOffCoords.push({ x: 84, y: 40 }); // Ala inferior
                } else if (i === 3) {
                    startOffCoords.push({ x: 92, y: 20 }); // Poste rim runner
                } else {
                    startOffCoords.push({ x: 90, y: 30 }); // Atirador trailer
                }
            }

            // Defesa da Casa recua a correr para a esquerda
            startDefCoords.push({ x: 64, y: 22 });
            startDefCoords.push({ x: 68, y: 12 });
            startDefCoords.push({ x: 68, y: 38 });
            startDefCoords.push({ x: 72, y: 25 });
            startDefCoords.push({ x: 76, y: 30 });
        }

        return {
            isHomeAttack,
            offLineup,
            defLineup,
            shooterIdx,
            passerIdx,
            handlerIdx,
            shooterCoords,
            passerCoords,
            rim,
            offCoords,
            defCoords,
            startOffCoords,
            startDefCoords,
        };
    }, [currentPlay, homeStats, awayStats]);

    const {
        isHomeAttack,
        offLineup,
        defLineup,
        shooterIdx,
        passerIdx,
        handlerIdx,
        shooterCoords,
        passerCoords,
        rim,
        offCoords,
        defCoords,
        startOffCoords,
        startDefCoords,
    } = tacticalData;

    // Altura Máxima da Parábola de Voo do Lançamento
    const shotArcMetrics = useMemo(() => {
        if (!shooterCoords || !rim) return { peakHeight: 4, path: '' };
        const dist = Math.hypot(rim.x - shooterCoords.x, rim.y - shooterCoords.y);
        // Altura no ar em 2.5D: proporcional à distância do tiro
        const peakHeight = Math.min(8.0, Math.max(3.8, dist * 0.22));

        const midX = (shooterCoords.x + rim.x) / 2;
        const midY = (shooterCoords.y + rim.y) / 2;
        // Ponto de controlo Bézier em -Y (para cima no ecrã em 2.5D)
        const ctrlY = midY - peakHeight * 2;
        const path = `M ${shooterCoords.x} ${shooterCoords.y} Q ${midX} ${ctrlY} ${rim.x} ${rim.y}`;

        return { peakHeight, path };
    }, [shooterCoords, rim]);

    // Motor de Animação com requestAnimationFrame
    useEffect(() => {
        if (!currentPlay) return;

        let animFrameId = null;
        const initialPhase = transitionEnabled ? 'transition' : (passerCoords ? 'pass' : (currentPlay.is_shot ? 'shot' : 'result'));

        setPlayPhase(initialPhase);
        setTransProgress(0);
        setFlightProgress(0);
        setResultProgress(0);
        setShowSplash(false);

        let curPhase = initialPhase;
        let phaseStartTime = performance.now();
        let lastDribbleTick = 0;

        const animateLoop = (now) => {
            const elapsed = now - phaseStartTime;

            if (curPhase === 'transition') {
                const transDuration = 850 / playbackSpeed;
                const p = Math.min(1, elapsed / transDuration);
                setTransProgress(p);

                // Drible sonoro sincronizado a meio caminho
                const dribbleStep = Math.floor(p * 5);
                if (dribbleStep !== lastDribbleTick && p < 0.9) {
                    lastDribbleTick = dribbleStep;
                    playSynthSound('dribble');
                }

                if (p >= 1) {
                    curPhase = passerCoords ? 'pass' : (currentPlay.is_shot ? 'shot' : 'result');
                    setPlayPhase(curPhase);
                    phaseStartTime = now;
                    if (curPhase === 'pass') playSynthSound('pass');
                }
            } else if (curPhase === 'pass') {
                const passDuration = 360 / playbackSpeed;
                const p = Math.min(1, elapsed / passDuration);
                setFlightProgress(p);

                if (p >= 1) {
                    curPhase = currentPlay.is_shot ? 'shot' : 'result';
                    setPlayPhase(curPhase);
                    setFlightProgress(0);
                    phaseStartTime = now;
                }
            } else if (curPhase === 'shot') {
                const shotDuration = 650 / playbackSpeed;
                const p = Math.min(1, elapsed / shotDuration);
                setFlightProgress(p);

                if (p >= 1) {
                    curPhase = 'result';
                    setPlayPhase('result');
                    phaseStartTime = now;

                    if (currentPlay.shot_made) {
                        setShowSplash(true);
                        playSynthSound('swish');
                    } else {
                        playSynthSound('rim');
                    }
                }
            } else if (curPhase === 'result') {
                const resultDuration = 750 / playbackSpeed;
                const p = Math.min(1, elapsed / resultDuration);
                setResultProgress(p);

                if (p >= 1) {
                    if (isPlaying) {
                        if (safeIndex < filteredPlays.length - 1) {
                            setCurrentIndex(prev => prev + 1);
                        } else {
                            setIsPlaying(false);
                        }
                    }
                    return;
                }
            }

            animFrameId = requestAnimationFrame(animateLoop);
        };

        animFrameId = requestAnimationFrame(animateLoop);

        return () => {
            if (animFrameId) cancelAnimationFrame(animFrameId);
        };
    }, [
        safeIndex,
        currentPlay?.id,
        playbackSpeed,
        transitionEnabled,
        passerCoords,
        isPlaying,
        transitionNonce,
        playSynthSound,
    ]);

    // Curva cúbica suave
    const easeCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Coordenadas dinâmicas dos 5 atacantes
    const currentOffCoords = useMemo(() => {
        if (playPhase === 'transition' && startOffCoords.length === 5 && offCoords.length === 5) {
            const e = easeCubic(transProgress);
            return offCoords.map((target, i) => {
                const start = startOffCoords[i];
                return {
                    x: start.x + (target.x - start.x) * e,
                    y: start.y + (target.y - start.y) * e,
                };
            });
        }
        return offCoords;
    }, [playPhase, transProgress, startOffCoords, offCoords]);

    // Coordenadas dinâmicas dos 5 defesas
    const currentDefCoords = useMemo(() => {
        if (playPhase === 'transition' && startDefCoords.length === 5 && defCoords.length === 5) {
            const e = easeCubic(transProgress);
            return defCoords.map((target, i) => {
                const start = startDefCoords[i];
                return {
                    x: start.x + (target.x - start.x) * e,
                    y: start.y + (target.y - start.y) * e,
                };
            });
        }
        return defCoords;
    }, [playPhase, transProgress, startDefCoords, defCoords]);

    // FÍSICA AUTÊNTICA DA BOLA 🏀 (Drible 2.5D, Linha Reta no Solo & Altura Parabólica Real)
    const { ballPos, shadowPos, ballRotation, cometTrail } = useMemo(() => {
        let bx = shooterCoords.x;
        let by = shooterCoords.y;
        let br = 1.35;
        let sx = bx;
        let sy = by;
        let srx = 1.25;
        let sry = 0.6;
        let sopacity = 0.5;
        let rotation = 0;
        const trail = [];

        if (playPhase === 'transition') {
            // DRIBLE REALISTA DE CONTRA-ATAQUE: A bola vai à frente do portador no sentido da corrida!
            const handler = currentOffCoords[handlerIdx] || currentOffCoords[0] || { x: 50, y: 25 };
            const leadX = isHomeAttack ? 2.3 : -2.3;

            // Ciclo de drible: toca no solo e sobe até à mão
            const bounceCycle = Math.abs(Math.sin(transProgress * 6 * Math.PI));
            const bounceHeight = bounceCycle * 1.7; // Altura no ar em 2.5D

            bx = handler.x + leadX;
            by = handler.y - bounceHeight; // Sobe no ecrã para a mão
            br = 1.35;

            // Sombra permanece sempre no solo do parquete
            sx = bx;
            sy = handler.y;
            srx = 1.2;
            sry = 0.55;
            sopacity = 0.55 - (bounceHeight / 1.7) * 0.25;
            rotation = transProgress * 1080;
        } else if (playPhase === 'pass' && passerCoords) {
            // PASSE DE ASSISTÊNCIA EM LINHA DIRETA COM ARCO SUAVE
            const p = flightProgress;
            const gx = (1 - p) * passerCoords.x + p * shooterCoords.x;
            const gy = (1 - p) * passerCoords.y + p * shooterCoords.y;
            const passLift = Math.sin(p * Math.PI) * 1.5;

            bx = gx;
            by = gy - passLift;
            br = 1.35;

            sx = gx;
            sy = gy;
            srx = 1.2;
            sry = 0.55;
            sopacity = 0.45;
            rotation = p * 540;

            for (let i = 1; i <= 4; i++) {
                const tp = Math.max(0, p - i * 0.05);
                trail.push({
                    x: (1 - tp) * passerCoords.x + tp * shooterCoords.x,
                    y: (1 - tp) * passerCoords.y + tp * shooterCoords.y - Math.sin(tp * Math.PI) * 1.5,
                    r: Math.max(0.4, 1.2 - i * 0.2),
                    opacity: 0.6 - i * 0.12,
                });
            }
        } else if (playPhase === 'shot') {
            // LANÇAMENTO EM VERDADEIRA PROJEÇÃO 2.5D:
            // A linha de projeção no solo é DIRETA entre atirador e cesto!
            // O arco do arremesso é a ALTURA no ar (desloca em -Y e cresce em diâmetro)
            const u = flightProgress;
            const x0 = shooterCoords.x;
            const y0 = shooterCoords.y;
            const xr = rim.x;
            const yr = rim.y;

            // Posição no solo
            const groundX = (1 - u) * x0 + u * xr;
            const groundY = (1 - u) * y0 + u * yr;

            // Altura do arco parabólico
            const height = 4 * u * (1 - u) * shotArcMetrics.peakHeight;

            bx = groundX;
            by = groundY - height; // Eleva-se na atmosfera da quadra
            br = 1.35 + (height / shotArcMetrics.peakHeight) * 0.9; // Cresce em 3D no ápice

            // Sombra no parquete desliza em linha reta direta para o cesto
            sx = groundX;
            sy = groundY;
            srx = Math.max(0.8, 1.35 - (height / shotArcMetrics.peakHeight) * 0.35);
            sry = srx * 0.5;
            sopacity = Math.max(0.18, 0.55 - (height / shotArcMetrics.peakHeight) * 0.32);
            rotation = u * 720; // Backspin

            // Rastro luminoso contínuo da trajetória
            for (let i = 1; i <= 6; i++) {
                const tu = Math.max(0, u - i * 0.04);
                const tgx = (1 - tu) * x0 + tu * xr;
                const tgy = (1 - tu) * y0 + tu * yr;
                const th = 4 * tu * (1 - tu) * shotArcMetrics.peakHeight;
                trail.push({
                    x: tgx,
                    y: tgy - th,
                    r: Math.max(0.4, (1.35 + (th / shotArcMetrics.peakHeight) * 0.8) - i * 0.16),
                    opacity: Math.max(0.1, 0.8 - i * 0.12),
                });
            }
        } else if (playPhase === 'result') {
            if (currentPlay?.shot_made) {
                // Cai limpo dentro do cesto
                const w = resultProgress;
                bx = rim.x;
                by = rim.y + w * 1.2;
                br = 1.2;
                sx = rim.x;
                sy = rim.y + 1.2;
                srx = 1.1;
                sry = 0.5;
                sopacity = 0.4;
                rotation = 720;
            } else {
                // Ressalta do ferro e cai no garrafão
                const w = resultProgress;
                const bounceDir = isHomeAttack ? -1 : 1;
                const bounceDist = w * 4.8;
                const bounceArc = Math.sin(w * Math.PI) * 2.8;

                bx = rim.x + bounceDir * bounceDist;
                by = rim.y + (shooterCoords.y > 25 ? -1 : 1) * (w * 1.8) - bounceArc;
                br = 1.25;

                sx = bx;
                sy = rim.y + (shooterCoords.y > 25 ? -1 : 1) * (w * 1.8);
                srx = 1.1;
                sry = 0.5;
                sopacity = 0.45;
                rotation = 720 + w * 360;
            }
        }

        return {
            ballPos: { x: bx, y: by, r: br },
            shadowPos: { x: sx, y: sy, rx: srx, ry: sry, opacity: sopacity },
            ballRotation: rotation,
            cometTrail: trail,
        };
    }, [
        playPhase,
        transProgress,
        flightProgress,
        resultProgress,
        currentOffCoords,
        handlerIdx,
        isHomeAttack,
        passerCoords,
        shooterCoords,
        rim,
        shotArcMetrics.peakHeight,
        currentPlay?.shot_made,
    ]);

    // Controlos do Reprodutor
    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleRestart = () => {
        setIsPlaying(false);
        setCurrentIndex(0);
        setTransitionNonce(prev => prev + 1);
    };
    const handleNext = () => {
        if (safeIndex < filteredPlays.length - 1) {
            setCurrentIndex(safeIndex + 1);
            setTransitionNonce(prev => prev + 1);
        }
    };
    const handlePrev = () => {
        if (safeIndex > 0) {
            setCurrentIndex(safeIndex - 1);
            setTransitionNonce(prev => prev + 1);
        }
    };
    const replayCurrentTransition = () => {
        setTransitionNonce(prev => prev + 1);
    };

    if (!replayPlays || replayPlays.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                <p className="font-bold">A carregar dados do simulador de replay...</p>
            </div>
        );
    }

    const shooterPlayer = offLineup[shooterIdx] || null;
    const attackingTeamSigla = currentPlay?.team_sigla || (isHomeAttack ? homeTeam?.sigla : awayTeam?.sigla);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* CABEÇALHO DO SIMULADOR COM PLACAR EM TEMPO REAL */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span>Simulador 2D NBA • Quadra &amp; Trajetória</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Transição rápida de contra-ataque, drible e trajetória parabólica do arremesso.
                    </p>
                </div>

                {/* Placar Oficial no Momento da Jogada */}
                <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor }} />
                        <span className="text-xs font-black text-white">{homeTeam?.sigla}</span>
                        <span className="text-lg font-black font-mono text-blue-400">
                            {currentPlay?.home_score ?? 0}
                        </span>
                    </div>

                    <span className="text-xs font-bold text-slate-600">vs</span>

                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-black font-mono text-slate-200">
                            {currentPlay?.away_score ?? 0}
                        </span>
                        <span className="text-xs font-black text-white">{awayTeam?.sigla}</span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor }} />
                    </div>

                    <div className="border-l border-slate-800 pl-3 flex flex-col items-end">
                        <span className="text-[11px] font-black font-mono text-emerald-400">
                            Q{currentPlay?.period || 1} • {currentPlay?.clock || '12:00'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                            Posse: {attackingTeamSigla}
                        </span>
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTROS & CONTROLOS RÁPIDOS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1 flex items-center">
                        <Filter className="w-3 h-3 mr-1" />
                        Filtro:
                    </span>
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'shots', label: 'Arremessos' },
                        { id: 'made', label: 'Cestos' },
                        { id: 'threes', label: 'Triplos' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setFilterCategory(f.id);
                                setCurrentIndex(0);
                                setTransitionNonce(prev => prev + 1);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                filterCategory === f.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Toggle de Transição de Quadra */}
                    <button
                        onClick={() => {
                            setTransitionEnabled(!transitionEnabled);
                            setTransitionNonce(prev => prev + 1);
                        }}
                        className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${
                            transitionEnabled
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title="Ativar/Desativar transição de contra-ataque"
                    >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black uppercase">
                            Transição {transitionEnabled ? 'ON' : 'OFF'}
                        </span>
                    </button>

                    {/* Botão para rever a transição atual */}
                    <button
                        onClick={replayCurrentTransition}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1 transition"
                        title="Rever transição de quadra"
                    >
                        <RotateCcw className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] uppercase font-black">Repetir</span>
                    </button>

                    {/* Som */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-1.5 rounded-xl border text-xs flex items-center space-x-1.5 transition ${
                            soundEnabled
                                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title={soundEnabled ? 'Desativar Sons' : 'Ativar Efeitos Sonoros'}
                    >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-black uppercase">{soundEnabled ? 'Som' : 'Mudo'}</span>
                    </button>
                </div>
            </div>

            {/* BARRA BROADCAST DE STATUS DO LANCE (FORA DO SVG PARA NÃO TAPAR OS CESTOS) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center space-x-2.5 min-w-0">
                    {playPhase === 'transition' && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 flex-shrink-0 animate-pulse">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Contra-Ataque {attackingTeamSigla}</span>
                        </span>
                    )}
                    {playPhase === 'pass' && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 flex-shrink-0">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Passe de Assistência</span>
                        </span>
                    )}
                    {playPhase === 'shot' && (
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 flex-shrink-0">
                            <Target className="w-3.5 h-3.5 animate-spin" />
                            <span>Lançamento em Voo</span>
                        </span>
                    )}
                    {playPhase === 'result' && (
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 flex-shrink-0 ${
                            currentPlay?.shot_made
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-red-500/20 border-red-500/40 text-red-400'
                        }`}>
                            {currentPlay?.shot_made ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{currentPlay?.shot_made ? `Cesto Convertido (+${currentPlay?.score_value || 2})` : 'Tiro Falhado'}</span>
                        </span>
                    )}

                    <p className="text-xs text-slate-300 font-medium truncate">
                        {currentPlay?.text || 'Jogada em reprodução...'}
                    </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono font-bold text-slate-400">
                    {currentPlay?.is_shot && (
                        <span className="text-amber-400 font-sans font-bold">
                            {currentPlay.shot_type} • {currentPlay.distance_ft || 15} pés
                        </span>
                    )}
                    <span>{safeIndex + 1}/{filteredPlays.length}</span>
                </div>
            </div>

            {/* A QUADRA 2D COMPLETA DA NBA (Clean, Proporcional & Sem Elementos a Tapar os Jogadores) */}
            <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                <svg
                    viewBox="0 0 100 50"
                    className="w-full aspect-[2/1] select-none block"
                    style={{ background: '#070b16' }}
                >
                    <defs>
                        {/* Madeira da Quadra */}
                        <linearGradient id="courtFloorGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#080e22" />
                            <stop offset="50%" stopColor="#0e1734" />
                            <stop offset="100%" stopColor="#080e22" />
                        </linearGradient>

                        {/* Garrafão Casa */}
                        <linearGradient id="paintHomeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={homeColor} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={homeColor} stopOpacity="0.10" />
                        </linearGradient>

                        {/* Garrafão Fora */}
                        <linearGradient id="paintAwayGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={awayColor} stopOpacity="0.10" />
                            <stop offset="100%" stopColor={awayColor} stopOpacity="0.28" />
                        </linearGradient>

                        {/* Textura Gradiente 3D da Bola */}
                        <radialGradient id="basketballGrad" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ff8533" />
                            <stop offset="60%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#9a3412" />
                        </radialGradient>

                        {/* Gradiente do Arco da Trajetória */}
                        <linearGradient id="shotArcGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#facc15" stopOpacity="0.3" />
                            <stop offset="60%" stopColor="#fb923c" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                        </linearGradient>

                        {/* Sombra dos Jogadores */}
                        <filter id="playerDropShadow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.9" />
                        </filter>

                        {/* Brilho da Trajetória */}
                        <filter id="shotGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#f59e0b" floodOpacity="0.9" />
                        </filter>
                    </defs>

                    {/* Piso da Quadra */}
                    <rect x="0" y="0" width="100" height="50" fill="url(#courtFloorGrad)" stroke="#334155" strokeWidth="1" />

                    {/* Linha de Meio-Campo */}
                    <line x1="50" y1="0" x2="50" y2="50" stroke="#475569" strokeWidth="0.8" />
                    <circle cx="50" cy="25" r="6" fill="none" stroke="#475569" strokeWidth="0.8" />
                    <circle cx="50" cy="25" r="2" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="1,1" />

                    {/* CESTO ESQUERDO (Aro em x=6, y=25) */}
                    <rect x="0" y="16" width="19" height="18" fill="url(#paintAwayGrad)" stroke="#38bdf8" strokeWidth="0.8" />
                    <circle cx="19" cy="25" r="6" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
                    <line x1="0" y1="4.5" x2="14" y2="4.5" stroke="#cbd5e1" strokeWidth="0.8" />
                    <line x1="0" y1="45.5" x2="14" y2="45.5" stroke="#cbd5e1" strokeWidth="0.8" />
                    <path d="M 14 4.5 A 23.75 23.75 0 0 1 14 45.5" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
                    <line x1="4" y1="21" x2="4" y2="29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="6" cy="25" r="1.6" fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />

                    {/* CESTO DIREITO (Aro em x=94, y=25) */}
                    <rect x="81" y="16" width="19" height="18" fill="url(#paintHomeGrad)" stroke="#38bdf8" strokeWidth="0.8" />
                    <circle cx="81" cy="25" r="6" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
                    <line x1="100" y1="4.5" x2="86" y2="4.5" stroke="#cbd5e1" strokeWidth="0.8" />
                    <line x1="100" y1="45.5" x2="86" y2="45.5" stroke="#cbd5e1" strokeWidth="0.8" />
                    <path d="M 86 4.5 A 23.75 23.75 0 0 0 86 45.5" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
                    <line x1="96" y1="21" x2="96" y2="29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="94" cy="25" r="1.6" fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />

                    {/* LINHA DISCRETA DE PASSE DE ASSISTÊNCIA */}
                    {passerCoords && (playPhase === 'pass' || playPhase === 'shot' || playPhase === 'result') && (
                        <line
                            x1={passerCoords.x}
                            y1={passerCoords.y}
                            x2={shooterCoords.x}
                            y2={shooterCoords.y}
                            stroke="#facc15"
                            strokeWidth="0.5"
                            strokeDasharray="1.2,1.2"
                            opacity="0.75"
                        />
                    )}

                    {/* TRAJETÓRIA DO LANÇAMENTO 2.5D (Arco Guia e Rastro) */}
                    {currentPlay?.is_shot && shotArcMetrics.path && (playPhase === 'shot' || playPhase === 'result') && (
                        <path
                            d={shotArcMetrics.path}
                            fill="none"
                            stroke="url(#shotArcGrad)"
                            strokeWidth="0.75"
                            strokeDasharray="1.5,1.5"
                            opacity="0.85"
                            filter="url(#shotGlow)"
                        />
                    )}

                    {/* RASTRO COMETA DA BOLA DURANTE O ARREMESSO */}
                    {cometTrail.map((dot, idx) => (
                        <circle
                            key={`comet_${idx}`}
                            cx={dot.x}
                            cy={dot.y}
                            r={dot.r}
                            fill="#f97316"
                            fillOpacity={dot.opacity}
                            filter="url(#shotGlow)"
                            className="pointer-events-none"
                        />
                    ))}

                    {/* SOMBRA DA BOLA NO SOLO DO PARQUETE */}
                    <ellipse
                        cx={shadowPos.x}
                        cy={shadowPos.y}
                        rx={shadowPos.rx}
                        ry={shadowPos.ry}
                        fill="#000000"
                        fillOpacity={shadowPos.opacity}
                        className="pointer-events-none"
                    />

                    {/* OS 5 DEFESAS (Sem Caixas de Texto a Colidir) */}
                    {defLineup.map((player, idx) => {
                        const coords = currentDefCoords[idx] || { x: 50, y: 25 };
                        const isPrimaryDefender = (idx === shooterIdx && playPhase !== 'transition');
                        const teamColor = isHomeAttack ? awayColor : homeColor;

                        return (
                            <g
                                key={`def_${player.id || idx}`}
                                className="transition-transform duration-100 ease-out cursor-pointer"
                                transform={`translate(${coords.x}, ${coords.y})`}
                            >
                                {/* Anel de Conteste no Defesa Principal */}
                                {isPrimaryDefender && (
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="3.2"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="0.5"
                                        strokeDasharray="1,1"
                                        className="animate-spin opacity-80"
                                    />
                                )}

                                {/* Corpo do Defesa */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="2.1"
                                    fill={teamColor}
                                    stroke="#ffffff"
                                    strokeWidth="0.4"
                                    filter="url(#playerDropShadow)"
                                />

                                {/* Número */}
                                <text
                                    x="0"
                                    y="0.7"
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="1.5"
                                    fontWeight="black"
                                    className="select-none pointer-events-none"
                                >
                                    {player.numero_camisola ?? (idx + 1)}
                                </text>

                                {/* Nome Abreviado */}
                                <text
                                    x="0"
                                    y="3.4"
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="1.1"
                                    fontWeight="bold"
                                    className="select-none pointer-events-none"
                                >
                                    {player.nome_completo?.split(' ').slice(-1)[0]}
                                </text>
                            </g>
                        );
                    })}

                    {/* OS 5 ATACANTES (Com halos elegantes e sem caixas de texto desformatadas) */}
                    {offLineup.map((player, idx) => {
                        const coords = currentOffCoords[idx] || { x: 50, y: 25 };
                        const isShooter = (idx === shooterIdx);
                        const isPasser = (idx === passerIdx);
                        const isHandler = (idx === handlerIdx && playPhase === 'transition');
                        const teamColor = isHomeAttack ? homeColor : awayColor;

                        return (
                            <g
                                key={`off_${player.id || idx}`}
                                className="transition-transform duration-100 ease-out cursor-pointer"
                                transform={`translate(${coords.x}, ${coords.y})`}
                            >
                                {/* Aura Dourada no Lançador */}
                                {isShooter && playPhase !== 'transition' && (
                                    <>
                                        <circle
                                            cx="0"
                                            cy="0"
                                            r="3.8"
                                            fill="none"
                                            stroke="#facc15"
                                            strokeWidth="0.6"
                                            className="animate-ping opacity-75"
                                        />
                                        <circle
                                            cx="0"
                                            cy="0"
                                            r="3.2"
                                            fill="#facc15"
                                            fillOpacity="0.15"
                                            stroke="#facc15"
                                            strokeWidth="0.5"
                                        />
                                    </>
                                )}

                                {/* Anel de Destaque no Portador da Bola em Transição */}
                                {isHandler && (
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="3.2"
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="0.6"
                                        strokeDasharray="1.5,1.5"
                                        className="animate-spin"
                                    />
                                )}

                                {/* Anel no Passador */}
                                {isPasser && !isShooter && playPhase !== 'transition' && (
                                    <circle
                                        cx="0"
                                        cy="0"
                                        r="3.0"
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="0.5"
                                        strokeDasharray="1,1"
                                    />
                                )}

                                {/* Corpo do Jogador Atacante */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="2.3"
                                    fill={teamColor}
                                    stroke={isShooter ? '#facc15' : '#ffffff'}
                                    strokeWidth={isShooter ? '0.7' : '0.4'}
                                    filter="url(#playerDropShadow)"
                                />

                                {/* Número */}
                                <text
                                    x="0"
                                    y="0.8"
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="1.6"
                                    fontWeight="black"
                                    className="select-none pointer-events-none"
                                >
                                    {player.numero_camisola ?? (idx + 1)}
                                </text>

                                {/* Nome do Jogador */}
                                <text
                                    x="0"
                                    y="3.5"
                                    textAnchor="middle"
                                    fill={isShooter ? '#facc15' : '#ffffff'}
                                    fontSize={isShooter ? '1.25' : '1.1'}
                                    fontWeight="black"
                                    className="select-none pointer-events-none drop-shadow"
                                >
                                    {player.nome_completo?.split(' ').slice(-1)[0]}
                                </text>
                            </g>
                        );
                    })}

                    {/* A BOLA DE BASQUETEBOL OFICIAL (Textura Real & Rotação) */}
                    <g
                        transform={`translate(${ballPos.x}, ${ballPos.y}) rotate(${ballRotation})`}
                        className="select-none pointer-events-none"
                    >
                        <circle
                            cx="0"
                            cy="0"
                            r={ballPos.r}
                            fill="url(#basketballGrad)"
                            stroke="#0f172a"
                            strokeWidth="0.2"
                            filter="url(#playerDropShadow)"
                        />
                        <line
                            x1={-ballPos.r}
                            y1="0"
                            x2={ballPos.r}
                            y2="0"
                            stroke="#1e293b"
                            strokeWidth="0.2"
                        />
                        <path
                            d={`M 0 ${-ballPos.r} Q ${ballPos.r * 0.45} 0 0 ${ballPos.r}`}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="0.15"
                        />
                        <path
                            d={`M 0 ${-ballPos.r} Q ${-ballPos.r * 0.45} 0 0 ${ballPos.r}`}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="0.15"
                        />
                    </g>

                    {/* SPLASH VISUAL DE CESTO CONVERTIDO (Limpo e sem texto sobre o aro) */}
                    {showSplash && (
                        <g transform={`translate(${rim.x}, ${rim.y})`}>
                            <circle cx="0" cy="0" r="4.8" fill="none" stroke="#10b981" strokeWidth="0.8" className="animate-ping" />
                            <circle cx="0" cy="0" r="2.8" fill="#10b981" fillOpacity="0.45" />
                        </g>
                    )}
                </svg>
            </div>

            {/* PAINEL INFERIOR DO ATLETA EM DESTAQUE */}
            <div className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                    <img
                        src={shooterPlayer?.foto_url || currentPlay?.player_photo || '/images/players/placeholder.png'}
                        className="w-10 h-10 rounded-full object-cover bg-slate-900 border-2 border-slate-700 flex-shrink-0"
                        onError={(e) => { e.target.src = '/images/players/placeholder.png'; }}
                    />
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-white">
                                {shooterPlayer?.nome_completo || currentPlay?.player_name}
                            </span>
                            <span
                                className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase text-white"
                                style={{ backgroundColor: isHomeAttack ? homeColor : awayColor }}
                            >
                                #{shooterPlayer?.numero_camisola ?? currentPlay?.player_jersey ?? '?'} {attackingTeamSigla}
                            </span>
                        </div>
                        {currentPlay?.assist && (
                            <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                                Assistência de {currentPlay.assist.player_name} (#{currentPlay.assist.jersey})
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleRestart}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Reiniciar Simulação"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handlePrev}
                        disabled={safeIndex === 0}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-40"
                        title="Jogada Anterior"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handlePlayPause}
                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 transition shadow-lg ${
                            isPlaying
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-4 h-4 fill-white" />
                                <span>Pausar</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-white" />
                                <span>Reproduzir</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={safeIndex >= filteredPlays.length - 1}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-40"
                        title="Próxima Jogada"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Velocidade */}
                    <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold ml-2">
                        {[0.5, 1, 2].map((spd) => (
                            <button
                                key={spd}
                                onClick={() => setPlaybackSpeed(spd)}
                                className={`px-2 py-1 rounded-lg text-xs transition ${
                                    playbackSpeed === spd
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {spd}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Linha do Tempo (Scrubber) */}
            <div className="mt-2 px-1">
                <input
                    type="range"
                    min="0"
                    max={Math.max(0, filteredPlays.length - 1)}
                    value={safeIndex}
                    onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentIndex(Number(e.target.value));
                        setTransitionNonce(prev => prev + 1);
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition"
                />
            </div>
        </div>
    );
}
