import React from 'react';
import { FolderArchive, Download, FileCode, FileText } from 'lucide-react';

export default function VaultWorkspace({ files, onDownload }) {
  if (!files || files.length === 0) {
    return (
      <div className="h-full flex flex-col bg-brand-panel text-slate-400 p-4">
        <div className="flex-1 flex items-center justify-center text-xs text-center">
          No hay entregables o archivos generados en este proyecto aún.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-brand-panel text-slate-200 p-4 space-y-4 overflow-y-auto">
      <div className="text-xs text-slate-400">
        Archivos de configuración y entregables técnicos listos para descarga local.
      </div>
      <div className="space-y-3">
        {files.map((file) => {
          const isCfg = file.type === 'cfg';
          return (
            <div key={file.id} className="bg-brand-dark/60 border border-brand-border rounded-lg p-3 space-y-2 hover:border-brand-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  {isCfg ? <FileCode className="w-4 h-4 text-brand-accent" /> : <FileText className="w-4 h-4 text-brand-warning" />}
                  <span className="text-xs font-mono font-medium text-slate-200 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => onDownload(file.name, file.content, isCfg ? 'text/plain' : 'text/markdown')}
                  className="p-1.5 bg-brand-accent/20 hover:bg-brand-accent text-brand-accent hover:text-white rounded transition-colors"
                  title="Descargar archivo físico"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-brand-dark p-2 rounded text-[11px] font-mono text-slate-400 max-h-24 overflow-y-auto border border-brand-border/40">
                {file.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}