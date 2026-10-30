import React, { useState, useRef } from 'react';
import { askNetworkAI } from './utils/geminiService';

export default function App() {
  const [appData, setAppData] = useState({
    projects: [
      {
        id: 'proj-1',
        name: 'Redes TESI - Lab OSPF',
        status: 'Motor Multimodal Activo - Cisco IOS / Linux Ready',
        isPinned: true,
        messages: [
          {
            id: 'msg-1',
            sender: 'ai',
            text: '¡Bienvenido a NetEngine Enterprise! Puedes subir múltiples documentos (PDFs, Word, Excel, .cfg) y pegar varias capturas de pantalla al mismo tiempo para analizarlas juntas.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ],
    activeProjectId: 'proj-1',
    activeRightTab: 'math'
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]); // Arreglo para soporte de múltiples archivos e imágenes
  
  const fileInputRef = useRef(null);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Calculadora VLSM lateral
  const [vlsmInput, setVlsmInput] = useState({ baseIp: '192.168.10.0', hostsReq: 30 });
  const [vlsmResult, setVlsmResult] = useState(null);

  const activeProject = appData.projects.find(p => p.id === appData.activeProjectId) || appData.projects[0];
  const sortedProjects = [...appData.projects].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // --- GESTIÓN DE PROYECTOS ---
  const handleCreateProject = () => {
    const newId = 'proj-' + Date.now();
    const newProject = {
      id: newId,
      name: `Nuevo Lab ${appData.projects.length + 1}`,
      status: 'Sesión activa de consulta',
      isPinned: false,
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'ai',
          text: 'Sesión de análisis iniciada. ¿Qué topología o documentos vamos a revisar?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setAppData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      activeProjectId: newId
    }));
  };

  const handleTogglePin = (id, e) => {
    e.stopPropagation();
    setAppData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p)
    }));
  };

  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    if (appData.projects.length <= 1) return;
    const updatedProjects = appData.projects.filter(p => p.id !== id);
    const newActiveId = id === appData.activeProjectId ? updatedProjects[0].id : appData.activeProjectId;
    setAppData(prev => ({
      ...prev,
      projects: updatedProjects,
      activeProjectId: newActiveId
    }));
  };

  const handleStartRename = (proj, e) => {
    e.stopPropagation();
    setEditingProjectId(proj.id);
    setEditingName(proj.name);
  };

  const handleSaveRename = (id) => {
    if (!editingName.trim()) return;
    setAppData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, name: editingName.trim() } : p)
    }));
    setEditingProjectId(null);
  };

  // --- MANEJO MÚLTIPLE DE ARCHIVOS (CLIP) ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64String = uploadEvent.target.result.split(',')[1];
        const isImage = file.type.startsWith('image/');
        setAttachments(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64: base64String,
          previewUrl: isImage ? uploadEvent.target.result : null
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null; // Limpiar input para permitir re-subir el mismo archivo si es necesario
  };

  // --- MANEJO DE PEGADO DE IMÁGENES MÚLTIPLES (CTRL + V) ---
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const base64String = uploadEvent.target.result.split(',')[1];
            setAttachments(prev => [...prev, {
              id: Date.now() + Math.random(),
              name: file.name || `captura_${Date.now()}.png`,
              mimeType: file.type,
              base64: base64String,
              previewUrl: uploadEvent.target.result
            }]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // --- CÁLCULO VLSM ---
  const handleCalculateVLSM = (e) => {
    e.preventDefault();
    const req = parseInt(vlsmInput.hostsReq) || 0;
    if (req <= 0) return;
    let bits = 1;
    while (Math.pow(2, bits) - 2 < req) {
      bits++;
    }
    const cidr = 32 - bits;
    const totalHosts = Math.pow(2, bits) - 2;
    setVlsmResult({
      cidr: `/${cidr}`,
      usefulHosts: totalHosts,
      maskBlock: Math.pow(2, bits)
    });
  };

  // --- ENVÍO DE MENSAJES ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && attachments.length === 0) || isSubmitting) return;

    let userText = inputMessage;
    if (!userText.trim() && attachments.length > 0) {
      userText = "Analiza los siguientes archivos e imágenes adjuntas para este laboratorio.";
    }

    const currentAttachments = [...attachments];
    setInputMessage('');
    setAttachments([]);

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      attachments: currentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAppData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return { ...p, messages: [...p.messages, userMsg] };
        }
        return p;
      })
    }));

    setIsSubmitting(true);

    const aiReplyText = await askNetworkAI(userText, activeProject.messages, currentAttachments);

    const aiMsg = {
      id: 'msg-' + (Date.now() + 1),
      sender: 'ai',
      text: aiReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAppData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return { ...p, messages: [...p.messages, aiMsg] };
        }
        return p;
      })
    }));

    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b131a] text-slate-100 font-sans overflow-hidden">
      
      {/* ================= COLUMNA 1: SIDEBAR ================= */}
      <aside className="w-72 bg-[#090f14] border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
              <h1 className="font-bold tracking-wider text-lg text-white">NetEngine</h1>
            </div>
            <span className="text-xs px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-mono">v1.0</span>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">PROYECTOS & LABS</span>
              <button 
                onClick={handleCreateProject}
                className="text-cyan-400 hover:text-cyan-300 text-lg font-bold px-2 py-0.5 hover:bg-slate-800 rounded transition-colors"
                title="Crear nuevo chat"
              >
                +
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
              {sortedProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => setAppData(prev => ({ ...prev, activeProjectId: proj.id }))}
                  className={`group relative w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    proj.id === activeProject.id 
                      ? 'bg-cyan-950/60 border border-cyan-800/60 text-cyan-200' 
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    {proj.isPinned && <span className="text-amber-400 text-xs" title="Fijado">📌</span>}
                    {editingProjectId === proj.id ? (
                      <input 
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRename(proj.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(proj.id)}
                        autoFocus
                        className="bg-slate-900 text-white text-xs px-1 py-0.5 rounded outline-none border border-cyan-500 w-36"
                      />
                    ) : (
                      <span className="truncate">{proj.name}</span>
                    )}
                  </div>

                  <div className="hidden group-hover:flex items-center space-x-1.5 shrink-0 bg-[#090f14]/80 px-1 rounded">
                    <button onClick={(e) => handleTogglePin(proj.id, e)} className="text-slate-400 hover:text-amber-400 text-xs" title="Fijar">📌</button>
                    <button onClick={(e) => handleStartRename(proj, e)} className="text-slate-400 hover:text-cyan-400 text-xs" title="Renombrar">✏️</button>
                    {appData.projects.length > 1 && (
                      <button onClick={(e) => handleDeleteProject(proj.id, e)} className="text-slate-400 hover:text-red-400 text-xs" title="Eliminar">🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Entorno Local Activo</span>
        </div>
      </aside>

      {/* ================= COLUMNA 2: CHAT CENTRAL ================= */}
      <main className="flex-1 flex flex-col bg-[#0b131a] border-r border-slate-800">
        
        <header className="px-6 py-4 border-b border-slate-800 bg-[#0c141d] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
              <h2 className="font-semibold text-white">{activeProject.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{activeProject.status}</p>
          </div>
        </header>

        {/* Historial de mensajes con soporte para renderizar múltiples adjuntos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeProject.messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none' 
                  : 'bg-[#111b24] border border-slate-800 text-slate-200 rounded-bl-none shadow-sm whitespace-pre-wrap'
              }`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx}>
                        {att.previewUrl ? (
                          <img src={att.previewUrl} alt="Adjunto" className="rounded-lg max-h-60 object-contain border border-slate-700" />
                        ) : (
                          <div className="p-2 bg-slate-900/80 border border-slate-700 rounded text-xs text-cyan-300 font-mono flex items-center space-x-2">
                            <span>📎</span>
                            <span className="truncate">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          {isSubmitting && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
              <span>El profesor estricto está analizando los archivos y la red...</span>
            </div>
          )}
        </div>

        {/* Barra de entrada y contenedor de adjuntos múltiples */}
        <div className="p-4 bg-[#0c141d] border-t border-slate-800">
          
          {/* Bandeja previa de múltiples adjuntos */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 bg-[#111b24] border border-cyan-800/60 p-2.5 rounded-lg max-h-36 overflow-y-auto">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center bg-slate-900 border border-slate-700 p-1.5 rounded-lg relative group pr-2">
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded mr-2 border border-slate-700" />
                  ) : (
                    <span className="text-xl mr-2">📄</span>
                  )}
                  <div className="text-xs text-slate-300 mr-2 max-w-[130px]">
                    <span className="text-cyan-300 font-semibold block truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-400">Listo</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-red-400 text-sm font-bold px-1"
                    title="Remover archivo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center bg-[#111b24] border border-slate-700/60 rounded-xl px-3 py-2 focus-within:border-cyan-500 transition-colors">
            
            {/* Input con atributo multiple habilitado para documentos, ofimática y configs */}
            <input 
              type="file" 
              multiple
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.cfg,.txt,.conf,.log,image/*" 
            />

            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-cyan-400 mr-3 transition-colors"
              title="Adjuntar múltiples archivos (PDF, Word, Excel, .cfg, etc.)"
            >
              📎
            </button>

            <input 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder="Escribe un mensaje, o pega múltiples imágenes con Ctrl + V..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500"
            />

            <button 
              type="submit" 
              disabled={(!inputMessage.trim() && attachments.length === 0) || isSubmitting}
              className={`ml-2 p-2 rounded-lg transition-colors ${
                (inputMessage.trim() || attachments.length > 0) && !isSubmitting
                  ? 'bg-cyan-500 text-white hover:bg-cyan-400' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* ================= COLUMNA 3: PANELES DERECHOS ================= */}
      <aside className="w-80 bg-[#090f14] border-l border-slate-800 flex flex-col">
        <div className="flex border-b border-slate-800 text-xs">
          <button 
            onClick={() => setAppData(prev => ({ ...prev, activeRightTab: 'math' }))}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
              appData.activeRightTab === 'math' ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Panel Matemático
          </button>
          <button 
            onClick={() => setAppData(prev => ({ ...prev, activeRightTab: 'vault' }))}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
              appData.activeRightTab === 'vault' ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Workspace Vault
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {appData.activeRightTab === 'math' ? (
            <>
              <div className="bg-[#111b24] border border-cyan-800/40 rounded-lg p-3 text-xs space-y-2">
                <div className="text-cyan-400 font-bold flex items-center space-x-2">
                  <span>📌</span>
                  <span>ESTADO DEL LAB ACTIVO</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">{activeProject.name}</div>
                <div className="text-slate-400 text-[10px] leading-relaxed border-t border-slate-800 pt-1.5">
                  Mensajes intercambiados: <span className="text-white font-bold">{activeProject.messages.length}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3 flex items-center space-x-2">
                  <span>📐</span>
                  <span>CÁLCULO VLSM INTERACTIVO</span>
                </h3>
                
                <form onSubmit={handleCalculateVLSM} className="space-y-3 bg-[#111b24] border border-slate-800 rounded-lg p-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">IP Base / Red</label>
                    <input 
                      type="text" 
                      value={vlsmInput.baseIp}
                      onChange={(e) => setVlsmInput({ ...vlsmInput, baseIp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Hosts Requeridos</label>
                    <input 
                      type="number" 
                      value={vlsmInput.hostsReq}
                      onChange={(e) => setVlsmInput({ ...vlsmInput, hostsReq: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1.5 rounded transition-colors">
                    Calcular Prefijo
                  </button>
                </form>

                {vlsmResult && (
                  <div className="mt-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg p-3 text-xs space-y-1 font-mono">
                    <div className="text-cyan-300">Prefijo CIDR: <span className="font-bold text-white">{vlsmResult.cidr}</span></div>
                    <div className="text-slate-300">Hosts Útiles: <span className="text-emerald-400">{vlsmResult.usefulHosts}</span></div>
                    <div className="text-slate-400">Tamaño del Bloque: {vlsmResult.maskBlock}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider">WORKSPACE VAULT (ARCHIVOS .CFG)</h3>
              <div className="bg-[#111b24] border border-slate-800 rounded-lg p-3 text-xs space-y-3">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-mono text-cyan-300">router_core.cfg</span>
                  <button className="text-slate-400 hover:text-cyan-400">📥</button>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-mono text-cyan-300">ospf_areas.conf</span>
                  <button className="text-slate-400 hover:text-cyan-400">📥</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

    </div>
  );
}