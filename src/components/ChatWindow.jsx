import React, { useState } from 'react';
import { Send, Paperclip, Bot, User, Terminal, FileText, Image as ImageIcon } from 'lucide-react';

export default function ChatWindow({ project, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
        Selecciona o crea un proyecto para iniciar el chat.
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    onSendMessage(inputText, selectedFile);
    setInputText('');
    setSelectedFile(null);
  };

  const handleSimulateAttachment = (type) => {
    const dummyNames = {
      cfg: 'router_edge_config.cfg',
      pdf: 'Requerimientos_VLSM_TESI.pdf',
      image: 'error_terminal_ospf.png'
    };
    setSelectedFile(dummyNames[type]);
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark text-slate-200">
      {/* Header del Chat */}
      <div className="p-4 bg-brand-panel border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-brand-success animate-pulse"></div>
          <div>
            <h2 className="font-bold text-sm text-white">{project.name}</h2>
            <p className="text-xs text-slate-400">Motor Multimodal Activo - Cisco IOS / Linux Ready</p>
          </div>
        </div>
      </div>

      {/* Mensajes del Chat con scroll propio */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {project.messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' : 'bg-brand-border text-slate-300'}`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[75%] rounded-xl p-3.5 space-y-2 text-sm ${isAI ? 'bg-brand-panel border border-brand-border text-slate-200' : 'bg-brand-accent text-white'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                
                {msg.attachment && (
                  <div className={`flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs font-mono ${isAI ? 'bg-brand-dark/60 text-brand-accent' : 'bg-black/20 text-white'}`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{msg.attachment}</span>
                  </div>
                )}

                <div className={`text-[10px] text-right font-mono ${isAI ? 'text-slate-500' : 'text-white/70'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Adjuntos Simulado y Formulario de Envío */}
      <div className="p-4 bg-brand-panel border-t border-brand-border space-y-3">
        {selectedFile && (
          <div className="flex items-center justify-between bg-brand-dark px-3 py-1.5 rounded-lg border border-brand-accent/40 text-xs text-brand-accent">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Adjunto listo: <strong>{selectedFile}</strong></span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white font-bold px-1">×</button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          {/* Botones rápidos para simular subida de archivos técnicos */}
          <div className="flex items-center space-x-1 bg-brand-dark px-2 py-1.5 rounded-lg border border-brand-border">
            <button type="button" onClick={() => handleSimulateAttachment('cfg')} title="Adjuntar .cfg" className="p-1 hover:text-brand-accent text-slate-400 transition-colors">
              <Terminal className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleSimulateAttachment('pdf')} title="Adjuntar PDF de Requerimientos" className="p-1 hover:text-brand-warning text-slate-400 transition-colors">
              <FileText className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleSimulateAttachment('image')} title="Adjuntar Captura de Error" className="p-1 hover:text-brand-success text-slate-400 transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Escribe un comando, problema de red o solicita un ajuste VLSM..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-brand-dark border border-brand-border rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-accent"
          />

          <button
            type="submit"
            className="bg-brand-accent hover:bg-brand-accentHover text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-brand-accent/20"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}