const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export async function askNetworkAI(userPrompt, chatHistory = [], attachments = []) {
  if (!API_KEY) {
    return "Error: No se encontró la API Key en el archivo .env.";
  }

  const systemInstruction = {
    parts: [{
      text: `Eres un Ingeniero de Redes Senior y un profesor universitario de Sistemas Computacionales sumamente estricto, analítico y exigente.
      
      Reglas de comportamiento y formato:
      1. NUNCA seas complaciente ni digas "tienes razón" por cortesía.
      2. Si el usuario propone una configuración de routers, un cálculo VLSM, una tabla de enrutamiento o una topología con errores, señala los fallos inmediatamente sin rodeos.
      3. Explica claramente QUÉ se va a romper en la red si aplica esa mala configuración y exige el enfoque correcto.
      4. Mantén un tono profesional, técnico, directo y riguroso.
      5. Si la propuesta del usuario es correcta, valídala técnicamente y aporta mejoras o comandos de verificación Cisco IOS.
      6. REGLA DE FORMATO CRITICA: EVITA el uso de asteriscos dobles para negritas ni caracteres de formato Markdown innecesarios. Escribe el texto de forma plana y limpia para que no queden asteriscos al copiar y pegar. Presenta los comandos de Cisco en líneas limpias de texto.`
    }]
  };

  // Construimos las partes del mensaje actual incluyendo todos los adjuntos (si existen)
  const userParts = [{ text: userPrompt }];
  if (attachments && attachments.length > 0) {
    attachments.forEach(att => {
      userParts.push({
        inline_data: {
          mime_type: att.mimeType,
          data: att.base64
        }
      });
    });
  }

  const contents = [
    ...chatHistory.map(msg => {
      const parts = [{ text: msg.text }];
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          parts.push({
            inline_data: {
              mime_type: att.mimeType,
              data: att.base64
            }
          });
        });
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: parts
      };
    }),
    {
      role: 'user',
      parts: userParts
    }
  ];

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents: contents,
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }

      console.warn(`El modelo ${model} respondió con estado ${response.status}. Probando modelo de respaldo...`);
    } catch (error) {
      console.error(`Error de red con el modelo ${model}:`, error);
    }
  }

  return "Error: Todos los nodos del motor de IA están experimentando alta demanda. Intenta de nuevo en unos momentos.";
}