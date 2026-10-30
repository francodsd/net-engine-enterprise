import React from 'react';
import { Table, Network, GitCommit, ArrowRight } from 'lucide-react';

export default function MathVisualizer({ networkData }) {
  if (!networkData) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-500 text-sm">
        No hay datos de red activos para este proyecto.
      </div>
    );
  }

  const { vlsm = [], matrix = [], dijkstraRoute = '' } = networkData;

  return (
    <div className="h-full flex flex-col bg-brand-panel border-r border-brand-border text-slate-200 overflow-y-auto p-4 space-y-6">
      {/* Header del Panel */}
      <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
        <Network className="w-5 h-5 text-brand-accent" />
        <h2 className="font-bold text-base text-white">Panel Matemático & Redes</h2>
      </div>

      {/* 1. Tabla VLSM en Vivo */}
      <div className="bg-brand-dark/50 border border-brand-border rounded-lg p-3 space-y-3">
        <div className="flex items-center space-x-2 text-brand-accent">
          <Table className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Cálculo VLSM en Vivo</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-400">
                <th className="pb-2">Subred</th>
                <th className="pb-2">Req</th>
                <th className="pb-2">CIDR</th>
                <th className="pb-2">Red</th>
                <th className="pb-2">Rango Usable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono text-[11px]">
              {vlsm.map((item, index) => (
                <tr key={index} className="hover:bg-brand-border/20">
                  <td className="py-2 font-sans font-medium text-slate-200">{item.subred}</td>
                  <td className="py-2 text-slate-400">{item.req}</td>
                  <td className="py-2 text-brand-accent">{item.cidr}</td>
                  <td className="py-2 text-slate-300">{item.red}</td>
                  <td className="py-2 text-slate-400">{item.rango}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Matriz de Adyacencia */}
      <div className="bg-brand-dark/50 border border-brand-border rounded-lg p-3 space-y-3">
        <div className="flex items-center space-x-2 text-brand-success">
          <GitCommit className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Matriz de Adyacencia (Grafo)</span>
        </div>
        
        <div className="bg-brand-dark p-3 rounded border border-brand-border/60 font-mono text-xs overflow-x-auto">
          <div className="flex flex-col items-center justify-center space-y-1">
            {matrix.map((row, rIdx) => (
              <div key={rIdx} className="flex space-x-3">
                {row.map((val, cIdx) => (
                  <span key={cIdx} className={`w-8 text-center py-1 rounded ${val === 0 ? 'bg-brand-accent/20 text-brand-accent font-bold' : val === '∞' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Representación matricial de costos y enlaces físicos directos entre nodos.</p>
      </div>

      {/* 3. Algoritmo de Dijkstra */}
      <div className="bg-brand-dark/50 border border-brand-border rounded-lg p-3 space-y-2">
        <div className="flex items-center space-x-2 text-brand-warning">
          <ArrowRight className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Ruta Óptima (Dijkstra)</span>
        </div>
        <div className="p-2.5 bg-brand-dark rounded border border-brand-border/60 font-mono text-xs text-slate-300">
          {dijkstraRoute || 'Calculando ruta óptima basada en costos...'}
        </div>
      </div>
    </div>
  );
}