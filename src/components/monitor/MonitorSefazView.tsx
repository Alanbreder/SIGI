import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Server, CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw, BarChart2, ShieldAlert, Maximize2, Minimize2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';

const UF_LIST = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  'SVAN', 'SVRS', 'SVC-AN', 'SVC-RS'
];

interface SefazStateStatus {
  estado: string;
  autorizacao: 'Online' | 'Offline' | 'Instabilidade';
  retornoAutorizacao: 'Online' | 'Offline' | 'Instabilidade';
  inutilizacao: 'Online' | 'Offline' | 'Instabilidade';
  consultaProtocolo: 'Online' | 'Offline' | 'Instabilidade';
  statusServico: 'Online' | 'Offline' | 'Instabilidade';
  contingencia: boolean;
  tempoMedio: number;
  ultimaAtualizacao: string;
}

const generateMockData = (): SefazStateStatus[] => {
  return UF_LIST.map((estado) => {
    const randomStatus = () => {
      const rand = Math.random();
      if (rand > 0.98) return 'Offline';
      if (rand > 0.90) return 'Instabilidade';
      return 'Online';
    };

    return {
      estado,
      autorizacao: randomStatus(),
      retornoAutorizacao: randomStatus(),
      inutilizacao: randomStatus(),
      consultaProtocolo: randomStatus(),
      statusServico: randomStatus(),
      contingencia: Math.random() > 0.95,
      tempoMedio: Math.floor(Math.random() * (Math.random() > 0.8 ? 800 : 250)) + 50,
      ultimaAtualizacao: new Date().toLocaleTimeString('pt-BR'),
    };
  });
};

const generateStateTimeline = (state: string, docType: string) => {
  const data = [];
  const now = new Date();
  // 40 data points (every minute)
  for(let i=40; i>=0; i--) {
      const t = new Date(now.getTime() - i * 60000); 
      let val = Math.random();
      
      let status = 'normal';
      let tempo = Math.floor(Math.random() * 1800) + 100;
      let step = 1;

      if (state === 'SP' || state === 'MG' || state === 'RS') {
         if (val > 0.6) {
             status = 'lento';
             tempo = Math.floor(Math.random() * 3000) + 2000;
             step = 2;
         }
         if (val > 0.85) {
             status = 'muito_lento';
             tempo = Math.floor(Math.random() * 20000) + 5000;
             step = 3;
         }
      } else {
         if (val > 0.9) {
             status = 'lento';
             tempo = Math.floor(Math.random() * 3000) + 2000;
             step = 2;
         }
      }
      
      // Random timeout/error
      if (Math.random() > 0.97) {
         status = 'timeout';
         tempo = 35000;
         step = 4;
      } else if (Math.random() > 0.99) {
         status = 'erro';
         tempo = 0;
         step = 5;
      }

      data.push({
          time: t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tempo,
          status,
          step
      });
  }
  return data;
};

const getAuthorizer = (uf: string, docType: 'NFe' | 'NFCe' | 'MDFe') => {
  if (docType === 'NFe') {
    const svrs = ['AC', 'AL', 'AP', 'DF', 'ES', 'PB', 'PI', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'TO'];
    if (svrs.includes(uf)) return 'SVRS (Sefaz Virtual RS)';
    if (uf === 'MA') return 'SVAN (Sefaz Virtual Nac.)';
    return `Sefaz ${uf}`;
  } else if (docType === 'NFCe') {
    const svrs = ['AC', 'AL', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MS', 'PA', 'PB', 'PE', 'PI', 'RJ', 'RN', 'RO', 'RR', 'SE', 'TO'];
    if (svrs.includes(uf)) return 'SVRS (Sefaz Virtual RS)';
    return `Sefaz ${uf}`;
  } else {
    // MDFe
    const svrs = ['AC', 'AL', 'AP', 'DF', 'ES', 'PB', 'PI', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'TO', 'BA', 'CE', 'GO', 'MA', 'MS', 'PA', 'PE', 'PR'];
    if (svrs.includes(uf)) return 'SVRS (Sefaz Virtual RS)';
    return `Sefaz ${uf}`;
  }
};

const StateTimelineChart = ({ uf, docType }: { uf: string, docType: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch delay when changing states
    const timer = setTimeout(() => {
      setData(generateStateTimeline(uf, docType));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [uf, docType]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
          <p className="font-bold mb-1">{label}</p>
          <p>Estado: {uf}</p>
          <p>Servidor: {getAuthorizer(uf, docType as 'NFe' | 'NFCe' | 'MDFe')}</p>
          <p>Documento: {docType}</p>
          <p>Tempo de Resposta: {data.tempo}ms</p>
          <p className="mt-1">
            Status: 
            <span className={`ml-1 px-1.5 py-0.5 rounded font-bold uppercase
              ${data.status === 'normal' ? 'bg-emerald-500/20 text-emerald-400' : ''}
              ${data.status === 'lento' ? 'bg-amber-500/20 text-amber-400' : ''}
              ${data.status === 'muito_lento' ? 'bg-orange-500/20 text-orange-400' : ''}
              ${data.status === 'timeout' ? 'bg-red-500/20 text-red-400' : ''}
              ${data.status === 'erro' ? 'bg-slate-500/20 text-slate-300' : ''}
            `}>
              {data.status.replace('_', ' ')}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-[#2a3040] h-[500px] flex flex-col mt-6">
       <div className="flex items-center justify-between mb-6">
         <div>
           <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Desempenho {docType} - <span className="text-emerald-600 dark:text-emerald-400">{uf}</span>
           </h3>
           <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Autorizador: <strong className="text-slate-900 dark:text-slate-300">{getAuthorizer(uf, docType as 'NFe' | 'NFCe' | 'MDFe')}</strong></p>
         </div>
         <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div>Normal</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500"></div>Lento</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-orange-500"></div>Muito Lento</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div>Timeout</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-500"></div>Erro</div>
         </div>
       </div>
       <div className="flex-1 relative">
         {isLoading ? (
           <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
           </div>
         ) : (
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }} barCategoryGap="20%">
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
               <XAxis 
                 dataKey="time" 
                 axisLine={{ stroke: '#334155' }} 
                 tickLine={false} 
                 tick={{ fontSize: 10, fill: '#64748b' }} 
                 dy={10} 
                 angle={-45}
                 textAnchor="end"
               />
               <YAxis 
                 domain={[0, 5]}
                 ticks={[1, 2, 3, 4, 5]}
                 tickFormatter={(val) => {
                   if (val === 1) return 'Normal <= 2s';
                   if (val === 2) return 'Lento <= 5s';
                   if (val === 3) return 'Muito lento <= 30s';
                   if (val === 4) return 'Timeout > 30s';
                   if (val === 5) return 'Erro';
                   return '';
                 }}
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 11, fill: '#94a3b8' }} 
                 width={110}
               />
               <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
               <Bar dataKey="step" radius={[2, 2, 0, 0]}>
                 {data.map((entry, index) => {
                    let color = '#10b981'; // emerald-500 (normal)
                    if (entry.status === 'lento') color = '#f59e0b'; // amber-500
                    else if (entry.status === 'muito_lento') color = '#f97316'; // orange-500
                    else if (entry.status === 'timeout') color = '#ef4444'; // red-500
                    else if (entry.status === 'erro') color = '#64748b'; // slate-500
                    return <Cell key={`cell-${index}`} fill={color} />;
                 })}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         )}
       </div>
    </div>
  )
}


export const MonitorSefazView: React.FC<{ isFullScreen: boolean; setIsFullScreen: (val: boolean) => void }> = ({ isFullScreen, setIsFullScreen }) => {
  const [data, setData] = useState<SefazStateStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [docType, setDocType] = useState<'NFe' | 'NFCe' | 'MDFe'>('NFe');
  const [selectedUF, setSelectedUF] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: keyof SefazStateStatus, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof SefazStateStatus) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulating network delay for fetching data from an API
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const newData = generateMockData();
      setData(newData);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.error('Erro ao buscar status da SEFAZ:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'Offline':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case 'Instabilidade':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const generalStatus = useMemo(() => {
    if (data.length === 0) return 'Online';
    const allStatuses = data.flatMap(d => [d.autorizacao, d.retornoAutorizacao, d.inutilizacao, d.consultaProtocolo, d.statusServico]);
    const offlineCount = allStatuses.filter(s => s === 'Offline').length;
    const instavelCount = allStatuses.filter(s => s === 'Instabilidade').length;

    if (offlineCount > 5) return 'Offline';
    if (instavelCount > 5 || offlineCount > 0) return 'Instabilidade';
    return 'Online';
  }, [data]);

  const topSlowestStates = useMemo(() => {
    return [...data].sort((a, b) => b.tempoMedio - a.tempoMedio).slice(0, 5);
  }, [data]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Monitor SEFAZ Real-Time
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Disponibilidade, latência e estabilidade dos Webservices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Sincronizado via API</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              {lastUpdate || '--:--:--'}
            </div>
          </div>
          
          <button 
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 font-medium text-xs md:text-sm shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-xs"
            title={isFullScreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Controls & Filters */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
              <button
                onClick={() => setDocType('NFe')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  docType === 'NFe' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                NFe
              </button>
              <button
                onClick={() => setDocType('NFCe')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  docType === 'NFCe' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                NFCe
              </button>
              <button
                onClick={() => setDocType('MDFe')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  docType === 'MDFe' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                MDFe
              </button>
            </div>
            
            <button
              onClick={() => setSelectedUF(null)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                selectedUF === null 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Visão Geral Brasil
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {UF_LIST.map(uf => (
              <button
                key={uf}
                onClick={() => setSelectedUF(uf)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                  selectedUF === uf
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-600'
                }`}
              >
                {uf}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          
          {selectedUF ? (
            <StateTimelineChart uf={selectedUF} docType={docType} />
          ) : (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Últimas Notícias */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Últimas Notícias</p>
                    <div className="space-y-3">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                           <strong className="block text-slate-900 dark:text-white">Manutenção programada SEFAZ-SP</strong>
                           07/08 13:30
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                           <strong className="block text-slate-900 dark:text-white">Instabilidade NFe em MG resolvida</strong>
                           07/08 12:45
                        </div>
                    </div>
                </div>

                {/* Monitor RJ */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Status SEFAZ-RJ</p>
                    <div className="grid grid-cols-3 gap-2">
                       {['NFe', 'NFCe', 'MDFe'].map(doc => {
                           const rjData = data.find(d => d.estado === 'RJ');
                           const isOffline = rjData?.autorizacao === 'Offline';
                           return (
                               <div key={doc} className={`flex flex-col items-center p-2 rounded-lg border ${isOffline ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10'}`}>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{doc}</span>
                                   {isOffline ? <XCircle className="h-4 w-4 text-rose-500 mt-1" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" />}
                               </div>
                           )
                       })}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                      <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Servidores Parados</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {data.filter(d => d.autorizacao === 'Offline').length}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">UFs</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                    {data.filter(d => d.autorizacao === 'Offline').map(d => d.estado).join(', ') || 'Nenhuma UF offline'}
                  </p>
                </div>
              </div>

              {/* Grid de Serviços Tabela */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Status Detalhado por UF - {docType}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Acompanhamento de cada componente do sistema autorizador.
                    </p>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('estado')}>Autorizador</th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('contingencia')}>Contingência</th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('autorizacao')}>Autorização</th>
                          <th className="px-6 py-4 text-center">Retorno Aut.</th>
                          <th className="px-6 py-4 text-center">Inutilização</th>
                          <th className="px-6 py-4 text-center">Consulta Prot.</th>
                          <th className="px-6 py-4 text-center">Status Serv.</th>
                          <th className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => handleSort('tempoMedio')}>Tempo Médio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                        {sortedData.map((item) => (
                          <tr key={item.estado} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                              {item.estado}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.contingencia ? (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 uppercase">
                                  Ativa
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Normal</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center" title={item.autorizacao}>
                                {getStatusIcon(item.autorizacao)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center" title={item.retornoAutorizacao}>
                                {getStatusIcon(item.retornoAutorizacao)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center" title={item.inutilizacao}>
                                {getStatusIcon(item.inutilizacao)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center" title={item.consultaProtocolo}>
                                {getStatusIcon(item.consultaProtocolo)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center" title={item.statusServico}>
                                {getStatusIcon(item.statusServico)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              <div className="flex items-center justify-end gap-2">
                                {item.tempoMedio > 500 && <BarChart2 className="h-4 w-4 text-rose-500" />}
                                <span className={
                                  item.tempoMedio > 500 ? 'text-rose-600 dark:text-rose-400 font-bold' : 
                                  item.tempoMedio > 200 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-emerald-600 dark:text-emerald-400'
                                }>
                                  {item.tempoMedio} ms
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
