import React, { useState } from 'react';
import { FolderPlus, Folder, Trash2, Network, Cpu } from 'lucide-react';

export default function SidebarProjects({ projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject }) {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setIsCreating(false);
  };

  return (
    <div className="h-full flex flex-col bg-brand-panel border-r border-brand-border text-slate-200">
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-6 h-6 text-brand-accent" />
          <span className="font-bold text-lg tracking-wide text-white">NetEngine</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-brand-accent/20 text-brand-accent font-mono">v1.0</span>
      </div>

      {/* Sección de Proyectos / Chats */}
      <div className="p-3 flex items-center justify-between border-b border-brand-border/50">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Proyectos & Labs</span>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 hover:bg-brand-border rounded text-brand-accent transition-colors"
          title="Nuevo Proyecto"
        >
          <FolderPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Input para crear nuevo proyecto */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-3 bg-brand-dark/50 border-b border-brand-border">
          <input
            type="text"
            placeholder="Nombre del proyecto..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full bg-brand-dark border border-brand-border rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-brand-accent mb-2"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-brand-accent hover:bg-brand-accentHover text-white rounded font-medium transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      )}

      {/* Lista de Proyectos con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                isActive 
                  ? 'bg-brand-accent/15 border border-brand-accent/40 text-white' 
                  : 'hover:bg-brand-border/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Folder className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-accent' : 'text-slate-500'}`} />
                <span className="text-sm font-medium truncate">{proj.name}</span>
              </div>
              
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(proj.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-brand-danger text-slate-500 transition-opacity"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-brand-border bg-brand-dark/30 flex items-center space-x-2 text-xs text-slate-500">
        <Cpu className="w-4 h-4 text-brand-success" />
        <span>Entorno Local Activo</span>
      </div>
    </div>
  );
}