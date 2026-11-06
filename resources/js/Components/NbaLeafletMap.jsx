import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Maximize2, ExternalLink, MapPin } from 'lucide-react';

// Camadas de mapa 100% livres de marcas d'água (Google Maps Oficial, Satélite e Dark)
const TILE_LAYERS = {
    google_streets: {
        name: 'Google Maps Oficial (Ruas & Cidades)',
        url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        attribution: '&copy; Google Maps',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
    },
    google_hybrid: {
        name: 'Google Maps Satélite (Vista Aérea)',
        url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attribution: '&copy; Google Maps Satélite',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
    },
    dark: {
        name: 'Modo Noturno (Esri Dark)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Sem marcas d\'água',
        subdomains: '',
        maxZoom: 18,
    },
    osm: {
        name: 'OpenStreetMap Padrão',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: '',
        maxZoom: 19,
    },
};

export default function NbaLeafletMap({ arenas = [], selectedArena = null, onSelectArena = () => {} }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef(new Map());
    const tileLayerRef = useRef(null);

    const [currentLayer, setCurrentLayer] = useState('google_streets');
    const [layerMenuOpen, setLayerMenuOpen] = useState(false);

    // Inicializar o Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Se já existir instância de mapa, não recriar
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [39.8283, -98.5795], // Centro geográfico dos EUA
                zoom: 4,
                minZoom: 3,
                maxZoom: 18,
                zoomControl: false, // Vamos adicionar o controle em posição customizada
            });

            // Adicionar controles de zoom no topo à esquerda
            L.control.zoom({ position: 'topleft' }).addTo(map);

            // Adicionar camada inicial de tiles
            const config = TILE_LAYERS[currentLayer];
            const tileLayer = L.tileLayer(config.url, {
                attribution: config.attribution,
                subdomains: config.subdomains,
                maxZoom: config.maxZoom,
            }).addTo(map);

            tileLayerRef.current = tileLayer;
            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Atualizar camada de visualização (Dark / Streets / Satélite)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        const config = TILE_LAYERS[currentLayer];
        const newLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            subdomains: config.subdomains,
            maxZoom: config.maxZoom,
        }).addTo(map);

        tileLayerRef.current = newLayer;
    }, [currentLayer]);

    // Atualizar marcadores quando a lista de arenas mudar
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Limpar marcadores anteriores
        markersRef.current.forEach((marker) => {
            map.removeLayer(marker);
        });
        markersRef.current.clear();

        // Adicionar novos marcadores para cada arena com coordenadas reais
        arenas.forEach((arena) => {
            if (!arena.lat || !arena.lng) return;

            const team = arena.equipa;
            const primaryColor = team?.cor_primaria || '#3b82f6';
            const teamSigla = team?.sigla || 'NBA';
            const teamLogo = team?.logo_url || 'https://cdn.nba.com/logos/leagues/L/logo-light.svg';

            // Criar ícone HTML personalizado com logo oficial e anel pulsante
            const customIcon = L.divIcon({
                className: 'custom-nba-pin',
                html: `
                    <div style="
                        position: relative;
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    ">
                        <div style="
                            position: absolute;
                            inset: -3px;
                            border-radius: 9999px;
                            background: ${primaryColor};
                            opacity: 0.35;
                            filter: blur(4px);
                        "></div>
                        <div style="
                            position: relative;
                            width: 38px;
                            height: 38px;
                            border-radius: 9999px;
                            background: #0f172a;
                            border: 2.5px solid ${primaryColor};
                            box-shadow: 0 4px 12px rgba(0,0,0,0.7);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                            transition: transform 0.2s ease;
                        " class="pin-inner">
                            <img src="${teamLogo}" alt="${teamSigla}" style="width: 26px; height: 26px; object-fit: contain;" />
                        </div>
                        <div style="
                            position: absolute;
                            bottom: -4px;
                            background: #020617;
                            border: 1px solid ${primaryColor};
                            color: #f8fafc;
                            font-size: 8px;
                            font-weight: 900;
                            padding: 0 4px;
                            border-radius: 4px;
                            letter-spacing: 0.5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.8);
                        ">${teamSigla}</div>
                    </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 22],
                popupAnchor: [0, -22],
            });

            const marker = L.marker([arena.lat, arena.lng], { icon: customIcon }).addTo(map);

            // Conteúdo do Popup estilo Google Maps
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                arena.nome + ' ' + arena.cidade + ' ' + (team?.nome_completo || '')
            )}`;

            const popupContent = document.createElement('div');
            popupContent.className = 'nba-popup-wrapper';
            popupContent.innerHTML = `
                <div style="
                    background: #0f172a;
                    color: #f8fafc;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #334155;
                    font-family: inherit;
                    width: 260px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
                ">
                    <div style="position: relative; height: 110px; width: 100%; overflow: hidden; background: #020617;">
                        <img src="${arena.photo_url}" alt="${arena.nome}" style="width: 100%; height: 100%; object-fit: cover;" />
                        <div style="position: absolute; inset: 0; background: linear-gradient(to top, #0f172a 0%, transparent 60%);"></div>
                        <div style="
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: rgba(15,23,42,0.85);
                            backdrop-filter: blur(4px);
                            border: 1px solid ${primaryColor};
                            padding: 2px 8px;
                            border-radius: 9999px;
                            font-size: 9px;
                            font-weight: 900;
                            color: #f8fafc;
                        ">
                            ${team?.conferencia ? team.conferencia + ' Conf.' : 'NBA'}
                        </div>
                    </div>

                    <div style="padding: 12px 14px 14px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <img src="${teamLogo}" style="width: 22px; height: 22px; object-fit: contain;" />
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
                                ${team?.nome_completo || 'NBA Franchise'}
                            </span>
                        </div>

                        <h3 style="font-size: 15px; font-weight: 900; color: #ffffff; line-height: 1.2; margin: 0 0 4px;">
                            ${arena.nome}
                        </h3>

                        <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 10px; display: flex; align-items: center; gap: 4px;">
                            📍 ${arena.cidade}, ${arena.estado}
                        </p>

                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 6px;
                            background: #020617;
                            padding: 8px 10px;
                            border-radius: 10px;
                            margin-bottom: 12px;
                            border: 1px solid #1e293b;
                            font-size: 10px;
                        ">
                            <div>
                                <span style="color: #64748b; display: block; font-weight: 700; text-transform: uppercase; font-size: 8px;">Capacidade</span>
                                <strong style="color: #f8fafc; font-weight: 800; font-family: monospace;">${Number(arena.capacidade || 0).toLocaleString()}</strong>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-weight: 700; text-transform: uppercase; font-size: 8px;">Inauguração</span>
                                <strong style="color: #f8fafc; font-weight: 800; font-family: monospace;">${arena.ano_inauguracao || 'N/D'}</strong>
                            </div>
                        </div>

                        <div style="display: flex; gap: 6px;">
                            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
                                flex: 1;
                                background: #2563eb;
                                color: #ffffff;
                                padding: 7px 10px;
                                border-radius: 8px;
                                font-size: 10px;
                                font-weight: 800;
                                text-align: center;
                                text-decoration: none;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                gap: 4px;
                            ">
                                🗺️ Google Maps
                            </a>
                            <button id="btn-select-${arena.id}" style="
                                background: #334155;
                                color: #ffffff;
                                border: none;
                                padding: 7px 12px;
                                border-radius: 8px;
                                font-size: 10px;
                                font-weight: 800;
                                cursor: pointer;
                            ">
                                Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Associar evento do botão "Detalhes"
            marker.bindPopup(popupContent, {
                maxWidth: 280,
                className: 'custom-nba-leaflet-popup',
            });

            marker.on('popupopen', () => {
                const btn = document.getElementById(`btn-select-${arena.id}`);
                if (btn) {
                    btn.onclick = () => {
                        onSelectArena(arena);
                        const cardElem = document.getElementById(`arena-card-${arena.id}`);
                        if (cardElem) {
                            cardElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    };
                }
            });

            marker.on('click', () => {
                onSelectArena(arena);
            });

            markersRef.current.set(arena.id, marker);
        });
    }, [arenas]);

    // Efeito para centrar o mapa na arena selecionada externamente
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !selectedArena || !selectedArena.lat || !selectedArena.lng) return;

        map.flyTo([selectedArena.lat, selectedArena.lng], 13, {
            duration: 1.5,
            easeLinearity: 0.25,
        });

        const marker = markersRef.current.get(selectedArena.id);
        if (marker) {
            setTimeout(() => {
                marker.openPopup();
            }, 1200);
        }
    }, [selectedArena]);

    // Resetar Zoom para toda a América do Norte
    const handleResetZoom = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.flyTo([39.8283, -98.5795], 4, { duration: 1.2 });
    };

    return (
        <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            {/* O container DOM do Leaflet */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Menu Flutuante de Camadas / Estilo Google Maps (Top Right) */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
                    <button
                        onClick={handleResetZoom}
                        title="Ver Todos os Estádios (Reset Zoom)"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-bold"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Visão Geral EUA</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setLayerMenuOpen(!layerMenuOpen)}
                            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center space-x-1.5 text-xs font-bold shadow-md shadow-blue-900/40"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Camada: {currentLayer === 'google_streets' ? 'Google Maps' : currentLayer === 'google_hybrid' ? 'Satélite' : currentLayer === 'dark' ? 'Dark' : 'OpenStreetMap'}</span>
                        </button>

                        {/* Dropdown de Seleção de Camadas */}
                        {layerMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-[1001] space-y-1">
                                {Object.entries(TILE_LAYERS).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setCurrentLayer(key);
                                            setLayerMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                                            currentLayer === key
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <span>{config.name}</span>
                                        {currentLayer === key && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner Inferior Informativo */}
            <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-xl text-xs text-slate-400 pointer-events-none">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clica em qualquer estádio para ver detalhes e abrir diretamente no Google Maps.</span>
            </div>

            {/* Estilos CSS do Leaflet para o tema Dark */}
            <style>{`
                .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: normal !important;
                }
                .leaflet-popup-tip {
                    background: #0f172a !important;
                    border: 1px solid #334155;
                }
                .leaflet-container {
                    font-family: inherit;
                    background: #090d16;
                }
                .custom-nba-pin:hover .pin-inner {
                    transform: scale(1.18);
                }
                .leaflet-bar {
                    border: 1px solid #1e293b !important;
                    border-radius: 14px !important;
                    overflow: hidden !important;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5) !important;
                }
                .leaflet-bar a {
                    background-color: #0f172a !important;
                    color: #f8fafc !important;
                    border-bottom: 1px solid #1e293b !important;
                }
                .leaflet-bar a:hover {
                    background-color: #1e293b !important;
                    color: #38bdf8 !important;
                }
            `}</style>
        </div>
    );
}
