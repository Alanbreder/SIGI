import React from 'react';
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Copy
} from 'lucide-react';

interface DocumentPreviewRendererProps {
  content: string;
}

export const DocumentPreviewRenderer: React.FC<DocumentPreviewRendererProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="p-8 text-center text-slate-400 font-medium italic">
        Nenhum conteúdo documentado para este artigo.
      </div>
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';

  const flushTable = (keyIndex: number) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(2);

    elements.push(
      <div key={`table-${keyIndex}`} className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-indigo-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
              {headerRow.map((col, idx) => (
                <th key={idx} className="p-3 font-extrabold">{col.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3 text-slate-700 dark:text-slate-300 font-medium">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushCodeBlock = (keyIndex: number) => {
    const codeText = codeBlockLines.join('\n');
    elements.push(
      <div key={`code-${keyIndex}`} className="my-4 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-100 relative group shadow-md">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400 mb-2 pb-2 border-b border-slate-800">
          <span>💻 {codeLanguage || 'Comando / Script'}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(codeText)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Copiar</span>
          </button>
        </div>
        <pre className="overflow-x-auto leading-relaxed text-emerald-400 whitespace-pre-wrap">{codeText}</pre>
      </div>
    );
    codeBlockLines = [];
    inCodeBlock = false;
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(index);
      } else {
        if (inTable) flushTable(index);
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.trim().split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-lg font-black text-slate-900 dark:text-white mt-5 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          {line.replace('# ', '')}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-indigo-500" />
          {line.replace('## ', '')}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-3 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <div key={index} className="my-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 rounded-r-2xl text-xs leading-relaxed font-medium flex items-start gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>{line.replace('> ', '')}</div>
        </div>
      );
      return;
    }

    if (line.trim().startsWith('- ')) {
      elements.push(
        <div key={index} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 my-1 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
          <span>{line.trim().replace('- ', '')}</span>
        </div>
      );
      return;
    }

    if (line.trim().startsWith('![')) {
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, alt, url] = match;
        elements.push(
          <div key={index} className="my-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 shadow-2xs">
            <img src={url} alt={alt} className="w-full max-h-72 object-cover rounded-xl" />
            <p className="text-[11px] text-center font-medium text-slate-500 mt-2">{alt}</p>
          </div>
        );
        return;
      }
    }

    if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    elements.push(
      <p key={index} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {line}
      </p>
    );
  });

  if (inTable) flushTable(lines.length);
  if (inCodeBlock) flushCodeBlock(lines.length);

  return <div className="space-y-1">{elements}</div>;
};
