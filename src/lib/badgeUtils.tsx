import React from 'react';

export const BADGE_COLOR_OPTIONS = [
  { key: 'indigo', label: 'Índigo / Destaque', bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  { key: 'rose', label: 'Vermelho / Rosa', bg: 'bg-rose-50 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { key: 'amber', label: 'Amarelo / Âmbar', bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { key: 'emerald', label: 'Verde / Esmeralda', bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'sky', label: 'Azul / Sky', bg: 'bg-sky-50 dark:bg-sky-950/80', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  { key: 'slate', label: 'Cinza / Slate', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  { key: 'violet', label: 'Violeta / Púrpura', bg: 'bg-violet-50 dark:bg-violet-950/80', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { key: 'purple', label: 'Roxo', bg: 'bg-purple-50 dark:bg-purple-950/80', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
];

export function getBadgeClasses(colorKey: string) {
  const found = BADGE_COLOR_OPTIONS.find((c) => c.key === colorKey);
  if (found) {
    return `${found.bg} ${found.text} ${found.border}`;
  }
  return 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
}

export function renderBadgePill(label: string, colorKey?: string) {
  const classes = getBadgeClasses(colorKey || 'indigo');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${classes} shadow-2xs`}>
      {label}
    </span>
  );
}

export function getSystemTableBadgeStyle(
  tableName: string,
  itemName: string,
  systemTables?: any,
  defaultColorKey: string = 'slate'
): string {
  if (systemTables && systemTables[tableName]) {
    const list = systemTables[tableName];
    const found = list.find((item: any) => item.nome?.toLowerCase() === itemName?.toLowerCase());
    if (found && found.color) {
      return getBadgeClasses(found.color);
    }
  }

  // Fallback map based on standard terms
  const itemLower = itemName?.toLowerCase() || '';
  let colorKey = defaultColorKey;
  if (itemLower.includes('aberto') || itemLower.includes('ativo') || itemLower.includes('padrão') || itemLower.includes('padrao')) {
    colorKey = 'indigo';
  } else if (itemLower.includes('andamento') || itemLower.includes('méd') || itemLower.includes('med') || itemLower.includes('prospec') || itemLower.includes('especial')) {
    colorKey = 'amber';
  } else if (itemLower.includes('resolvido') || itemLower.includes('concluido') || itemLower.includes('concluído') || itemLower.includes('sucesso') || itemLower.includes('estratég') || itemLower.includes('estrateg')) {
    colorKey = 'emerald';
  } else if (itemLower.includes('urgente') || itemLower.includes('alta') || itemLower.includes('crítico') || itemLower.includes('critico') || itemLower.includes('suspenso')) {
    colorKey = 'rose';
  } else if (itemLower.includes('aguardando') || itemLower.includes('revisão') || itemLower.includes('revisao')) {
    colorKey = 'purple';
  } else if (itemLower.includes('cancelado') || itemLower.includes('inativo')) {
    colorKey = 'slate';
  }

  return getBadgeClasses(colorKey);
}

export function formatTempoEmDesenvolvimento(dataEmDev?: string, fallbackData?: string): string {
  const refDateStr = dataEmDev || fallbackData;
  if (!refDateStr) return '0 dias em dev';

  let refDate: Date;
  const brMatch = refDateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    refDate = new Date(year, month, day);
  } else {
    refDate = new Date(refDateStr);
  }

  if (isNaN(refDate.getTime())) {
    refDate = new Date();
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - refDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Iniciado hoje';
  if (diffDays === 1) return '1 dia em dev';
  return `${diffDays} dias em dev`;
}
