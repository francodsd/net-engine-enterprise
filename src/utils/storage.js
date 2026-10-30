// Manejador de almacenamiento local y descargas para NetEngine Enterprise

const STORAGE_KEY = 'net_engine_enterprise_data_v1';

// Datos iniciales por defecto si el localStorage está vacío
const defaultData = {
  projects: [
    {
      id: 'proj-1',
      name: 'Redes TESI - Lab OSPF',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          sender: 'ai',
          text: '¡Bienvenido a NetEngine Enterprise! Sube tus archivos .cfg, PDFs de requerimientos o capturas de terminal para comenzar el análisis de red.',
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      networkData: {
        vlsm: [
          { subred: 'Sistemas', req: 50, cidr: '/26', red: '192.168.10.0', rango: '192.168.10.1 - 192.168.10.62', broadcast: '192.168.10.63' },
          { subred: 'Ventas', req: 25, cidr: '/27', red: '192.168.10.64', rango: '192.168.10.65 - 192.168.10.94', broadcast: '192.168.10.95' }
        ],
        matrix: [
          [0, 10, '∞'],
          [10, 0, 5],
          ['∞', 5, 0]
        ],
        dijkstraRoute: 'Core -> Router Ventas -> Destino (Costo: 15)'
      },
      vaultFiles: [
        {
          id: 'file-1',
          name: 'router_core_config.cfg',
          type: 'cfg',
          content: 'enable\nconfigure terminal\nhostname Core-TESI\ninterface GigabitEthernet0/0\n ip address 192.168.10.1 255.255.255.192\n no shutdown\nend'
        },
        {
          id: 'file-2',
          name: 'Memoria_Tecnica_Redes.md',
          type: 'markdown',
          content: '# Memoria Técnica Enterprise\n\n## Proyecto: Redes TESI\n\n- **Topología:** OSPF Multi-área\n- **Cálculo VLSM:** Implementado correctamente sin pérdida de subredes.'
        }
      ]
    }
  ],
  activeProjectId: 'proj-1'
};

export const loadAppData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error('Error al cargar localStorage:', error);
    return defaultData;
  }
};

export const saveAppData = (appData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// Función utilitaria para forzar la descarga de un archivo físico en la PC (.cfg o .md)
export const downloadFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};