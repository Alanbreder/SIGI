# Diretrizes do Projeto SIGI (Sistema Integrado de Gestão e Inteligência)

- **Padronização Visual de Modais e Popups**: Todos os modais, formulários de criação rápida e popups do sistema DEVEM abrir no formato de **Painel Drawer Lateral à Direita** (Right Drawer), utilizando:
  - Overlay flex com alinhamento à direita: `fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200`
  - Painel com altura total e entrada deslizante pela direita: `bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300`
  - Nunca utilizar modais centralizados no meio da tela.
- **Workspaces e Entidades**: Não utilizar modais para visualização completa de entidades. Cada entidade principal (Cliente, Atendimento, Registro, Artigo, Equipamento) possui seu Workspace próprio.
- **Navegação**: O Dashboard serve apenas como ponto de entrada e navegação rápida.
- **Persistência**: O sistema utiliza Supabase (Cloud para dev/homologação e Local/Proxmox para produção).
