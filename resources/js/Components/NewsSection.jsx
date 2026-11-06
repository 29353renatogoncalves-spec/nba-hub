import React from 'react';
import { Newspaper, Calendar, Eye, ArrowRight } from 'lucide-react';

export default function NewsSection({ news = [] }) {
    if (!news || news.length === 0) return null;

    return (
        <section id="noticias" className="mb-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center">
                        <Newspaper className="w-7 h-7 mr-3 text-emerald-400" />
                        Portal de Notícias & Editorial
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Crónicas de jogos, transferências e novidades oficiais da temporada.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <article
                        key={item.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col group"
                    >
                        {/* Imagem de Capa */}
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                            <img
                                src={item.imagem_capa}
                                alt={item.titulo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.categoria && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm shadow">
                                    {item.categoria.nome}
                                </span>
                            )}
                            {item.destaque_hero && (
                                <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                                    Destaque
                                </span>
                            )}
                        </div>

                        {/* Conteúdo */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-black text-base text-white group-hover:text-blue-400 transition leading-snug line-clamp-2">
                                    {item.titulo}
                                </h3>
                                {item.subtitulo && (
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                        {item.subtitulo}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center">
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    {item.leituras} leituras
                                </span>
                                <span className="text-blue-400 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                                    Ler Artigo <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
