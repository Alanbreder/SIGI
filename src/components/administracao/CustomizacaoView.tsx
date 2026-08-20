import React, { useState, useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Upload,
  Check,
  RotateCcw,
  Save,
  Type,
  Sparkles,
  Info,
  Building,
  CheckCircle2,
  Trash2,
  Eye,
  PhoneCall,
  Sliders,
  Paintbrush,
  Layout,
  PanelLeft,
  Menu,
  Layers
} from 'lucide-react';
import { SystemCustomization, defaultCustomization } from '../../types';

interface CustomizacaoViewProps {
  customization: SystemCustomization;
  onSaveCustomization: (newConfig: SystemCustomization) => void;
  onShowToast?: (title: string, message: string) => void;
}

const colorPresets: { id: SystemCustomization['corBase']; label: string; hex: string; bgClass: string; ringClass: string }[] = [
  { id: 'indigo', label: 'Índigo Padrão', hex: '#4f46e5', bgClass: 'bg-indigo-600', ringClass: 'ring-indigo-500' },
  { id: 'emerald', label: 'Esmeralda', hex: '#059669', bgClass: 'bg-emerald-600', ringClass: 'ring-emerald-500' },
  { id: 'sky', label: 'Azul Oceano', hex: '#0284c7', bgClass: 'bg-sky-600', ringClass: 'ring-sky-500' },
  { id: 'violet', label: 'Violeta / Roxo', hex: '#7c3aed', bgClass: 'bg-violet-600', ringClass: 'ring-violet-500' },
  { id: 'rose', label: 'Rosa Carmim', hex: '#e11d48', bgClass: 'bg-rose-600', ringClass: 'ring-rose-500' },
  { id: 'amber', label: 'Âmbar / Laranja', hex: '#d97706', bgClass: 'bg-amber-600', ringClass: 'ring-amber-500' },
  { id: 'slate', label: 'Grafite / Slate', hex: '#475569', bgClass: 'bg-slate-700', ringClass: 'ring-slate-500' },
  { id: 'custom', label: 'Personalizado', hex: '#2563eb', bgClass: 'bg-blue-600', ringClass: 'ring-blue-500' },
];

const fullThemePresets: {
  id: string;
  name: string;
  desc: string;
  badge: string;
  badgeBg: string;
  config: Partial<SystemCustomization>;
}[] = [
  {
    id: 'sleek-slate',
    name: 'Padrão Slate Limpo',
    desc: 'Layout corporativo e equilibrado com cabeçalho e menu em tom neutro.',
    badge: 'Padrão',
    badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    config: {
      topbarEstilo: 'default',
      sidebarEstilo: 'default',
      fundoEstilo: 'default',
      corBase: 'indigo',
    }
  },
  {
    id: 'dark-navy',
    name: 'Navy Corporativo',
    desc: 'Cabeçalho e Menu em azul marinho escuro (#0f172a / #1e293b) com acento Sky Blue.',
    badge: 'Popular',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    config: {
      topbarEstilo: 'dark-navy',
      topbarCustomHex: '#0f172a',
      sidebarEstilo: 'dark-navy',
      sidebarCustomHex: '#1e293b',
      fundoEstilo: 'cool-zinc',
      corBase: 'sky',
    }
  },
  {
    id: 'dark-master',
    name: 'Escuro Profundo (Dark Mode)',
    desc: 'Tema escuro total para ambiente de baixa luminosidade e máximo contraste.',
    badge: 'Escuro',
    badgeBg: 'bg-slate-800 text-slate-100',
    config: {
      topbarEstilo: 'dark-navy',
      topbarCustomHex: '#090d16',
      sidebarEstilo: 'primary-accent',
      sidebarCustomHex: '#0f172a',
      fundoEstilo: 'dark-pure',
      fundoCustomHex: '#020617',
      corBase: 'emerald',
    }
  },
  {
    id: 'violet-luxury',
    name: 'Púrpura Imperial',
    desc: 'Cabeçalho e menu em tom violeta nobre com fundo suave.',
    badge: 'Elegante',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    config: {
      topbarEstilo: 'custom',
      topbarCustomHex: '#2e1065',
      sidebarEstilo: 'custom',
      sidebarCustomHex: '#3b0764',
      fundoEstilo: 'soft-tint',
      corBase: 'violet',
    }
  },
  {
    id: 'emerald-business',
    name: 'Verde Esmeralda',
    desc: 'Estilo corporativo sofisticado em tons esmeralda e verde.',
    badge: 'Negócios',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    config: {
      topbarEstilo: 'custom',
      topbarCustomHex: '#064e3b',
      sidebarEstilo: 'custom',
      sidebarCustomHex: '#022c22',
      fundoEstilo: 'soft-tint',
      corBase: 'emerald',
    }
  },
  {
    id: 'warm-amber',
    name: 'Acolhedor Âmbar / Warm',
    desc: 'Combinação aquecida para leitura confortável e visual suave.',
    badge: 'Warm',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    config: {
      topbarEstilo: 'custom',
      topbarCustomHex: '#451a03',
      sidebarEstilo: 'custom',
      sidebarCustomHex: '#78350f',
      fundoEstilo: 'warm-cream',
      corBase: 'amber',
    }
  }
];

const topbarPresets: { id: SystemCustomization['topbarEstilo']; label: string; desc: string; previewClass: string }[] = [
  { id: 'default', label: 'Padrão Slate Limpo', desc: 'Fundo branco em modo claro e slate-900 no escuro', previewClass: 'bg-white dark:bg-slate-900 border border-slate-200' },
  { id: 'dark-navy', label: 'Azul Marinho Escuro', desc: 'Fundo azul marinho (#0f172a) corporativo', previewClass: 'bg-slate-900 text-white' },
  { id: 'primary-gradient', label: 'Gradiente Destaque', desc: 'Gradiente elegante do tom primário ao escuro', previewClass: 'bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white' },
  { id: 'clean-white', label: 'Branco Puro', desc: 'Fundo limpo em branco puro (#ffffff)', previewClass: 'bg-white text-slate-900 border border-slate-200' },
  { id: 'custom', label: 'Personalizado Hex', desc: 'Defina a cor exata do cabeçalho via seletor Hex', previewClass: 'bg-indigo-900 text-white' }
];

const sidebarPresets: { id: SystemCustomization['sidebarEstilo']; label: string; desc: string; previewClass: string }[] = [
  { id: 'default', label: 'Padrão Slate Limpo', desc: 'Menu lateral limpo e discreto', previewClass: 'bg-white dark:bg-slate-900 text-slate-800 border border-slate-200' },
  { id: 'dark-navy', label: 'Azul Marinho Escuro', desc: 'Menu lateral em tom escuro corporativo (#1e293b)', previewClass: 'bg-slate-900 text-slate-100' },
  { id: 'primary-accent', label: 'Preto & Destaque', desc: 'Menu preto profundo (#020617) de alto contraste', previewClass: 'bg-slate-950 text-indigo-300' },
  { id: 'clean-white', label: 'Branco Puro', desc: 'Menu lateral em branco puro com divisórias sutis', previewClass: 'bg-white text-slate-800 border border-slate-200' },
  { id: 'custom', label: 'Personalizado Hex', desc: 'Defina a cor exata do menu lateral via seletor Hex', previewClass: 'bg-indigo-900 text-white' }
];

const bgPresets: { id: SystemCustomization['fundoEstilo']; label: string; desc: string; sampleBg: string; darkSampleBg: string }[] = [
  {
    id: 'default',
    label: 'Padrão Slate Suave',
    desc: 'Fundo limpo e corporativo em tom neutro leve.',
    sampleBg: 'bg-slate-50 border-slate-200',
    darkSampleBg: 'dark:bg-slate-950 dark:border-slate-800'
  },
  {
    id: 'soft-tint',
    label: 'Tom Suave da Cor Primária',
    desc: 'Fundo sutilmente matizado com a cor escolhida.',
    sampleBg: 'bg-indigo-50/50 border-indigo-200',
    darkSampleBg: 'dark:bg-slate-950 dark:border-indigo-950'
  },
  {
    id: 'warm-cream',
    label: 'Creme Acolhedor / Warm',
    desc: 'Fundo suave e aquecido para leitura confortável.',
    sampleBg: 'bg-amber-50/50 border-amber-200',
    darkSampleBg: 'dark:bg-slate-950 dark:border-amber-950/40'
  },
  {
    id: 'cool-zinc',
    label: 'Zinco Frio / Moderno',
    desc: 'Fundo em tom cinza frio de alto contraste.',
    sampleBg: 'bg-zinc-100/80 border-zinc-200',
    darkSampleBg: 'dark:bg-zinc-950 dark:border-zinc-800'
  },
  {
    id: 'dark-pure',
    label: 'Preto / Escuro Profundo',
    desc: 'Fundo escuro profundo para contraste máximo.',
    sampleBg: 'bg-slate-900 border-slate-700',
    darkSampleBg: 'dark:bg-black dark:border-slate-800'
  },
  {
    id: 'custom',
    label: 'Cor Personalizada Hex',
    desc: 'Defina a cor de fundo exata via seletor Hex.',
    sampleBg: 'bg-slate-200 border-slate-300',
    darkSampleBg: 'dark:bg-slate-900 dark:border-slate-700'
  }
];

export const CustomizacaoView: React.FC<CustomizacaoViewProps> = ({
  customization,
  onSaveCustomization,
  onShowToast,
}) => {
  const [formState, setFormState] = useState<SystemCustomization>({
    ...defaultCustomization,
    ...customization,
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (field: keyof SystemCustomization, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast('Aviso de Tamanho', 'A imagem do logotipo deve ser menor que 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormState((prev) => ({
            ...prev,
            logoType: 'image',
            logoImageUrl: result,
          }));
          if (onShowToast) onShowToast('Logotipo Carregado', 'A imagem do logotipo foi inserida na pré-visualização.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomization(formState);
    setIsSavedSuccess(true);
    if (onShowToast) {
      onShowToast('Customização Salva', 'As alterações na identidade visual e cor base foram aplicadas com sucesso!');
    }
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar as configurações visuais padrões do sistema?')) {
      setFormState(defaultCustomization);
      onSaveCustomization(defaultCustomization);
      if (onShowToast) {
        onShowToast('Restaurado', 'A identidade visual foi restaurada para o padrão inicial.');
      }
    }
  };

  const getCurrentHex = () => {
    if (formState.corBase === 'custom') {
      return formState.customHexColor || '#4f46e5';
    }
    const preset = colorPresets.find((p) => p.id === formState.corBase);
    return preset ? preset.hex : '#4f46e5';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Informative Banner explaining Light Mode constraint */}
      <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex gap-4">
        <div className="p-2.5 bg-blue-100 dark:bg-indigo-950/80 text-blue-600 dark:text-indigo-400 rounded-2xl h-fit shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-blue-900 dark:text-white uppercase tracking-wider mb-1">
            Garantia de Legibilidade & Contraste WCAG
          </h4>
          <p className="text-xs text-blue-800 dark:text-slate-400 leading-relaxed font-medium">
            Por razões de legibilidade e acessibilidade (WCAG AA), as customizações de cores do cabeçalho, menu lateral, cores de acento e plano de fundo são aplicadas <strong>exclusivamente ao Modo Escuro (Dark Mode)</strong>. No Modo Claro (Light Mode), o sistema utiliza sempre o tema claro padrão com contraste máximo de fontes, ícones e fundos. O logotipo e nome do produto configurados abaixo se aplicam a ambos os modos.
          </p>
        </div>
      </div>

      {/* Real-time Preview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Pré-visualização do Topo em Tempo Real
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Veja exatamente como o logotipo e nome ficarão no cabeçalho do sistema.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Preview Ativo
          </span>
        </div>

        {/* Replicated Header Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {formState.logoType === 'image' && formState.logoImageUrl ? (
              <div className="h-10 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-2xs">
                <img
                  src={formState.logoImageUrl}
                  alt="Logo Preview"
                  className="max-h-full max-w-[150px] object-contain"
                />
              </div>
            ) : (
              <div
                style={{ backgroundColor: getCurrentHex() }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white font-black text-xs tracking-wider transition-colors"
              >
                {formState.logoText || 'SIGI'}
              </div>
            )}

            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                {formState.nomeSistema || 'SIGI'}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest line-clamp-1">
                {formState.subtituloSistema || 'Sistema Integrado de Gestão e Inteligência'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span
              style={{ backgroundColor: `${getCurrentHex()}20`, color: getCurrentHex(), borderColor: `${getCurrentHex()}40` }}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Exemplo de Botão
            </span>
            <button
              type="button"
              style={{ backgroundColor: getCurrentHex() }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-xs transition-opacity hover:opacity-90"
            >
              Ação Principal
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Identidade e Nome */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Identidade do Sistema & Nome do Produto
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure os títulos que aparecem no topo, menu lateral e relatórios do sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Nome Principal do Sistema</span>
                <span className="text-[10px] text-slate-400 font-normal">Ex: SIP, SIGI, Sistema ERP</span>
              </label>
              <input
                type="text"
                value={formState.nomeSistema}
                onChange={(e) => handleTextChange('nomeSistema', e.target.value)}
                placeholder="Ex: SIGI"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Sigla / Texto do Logotipo em Texto</span>
                <span className="text-[10px] text-slate-400 font-normal">Max 5 caracteres</span>
              </label>
              <input
                type="text"
                value={formState.logoText || ''}
                onChange={(e) => handleTextChange('logoText', e.target.value.toUpperCase())}
                placeholder="Ex: SIGI"
                maxLength={6}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtítulo / Descrição da Marca
              </label>
              <input
                type="text"
                value={formState.subtituloSistema}
                onChange={(e) => handleTextChange('subtituloSistema', e.target.value)}
                placeholder="Ex: Sistema Integrado de Gestão e Inteligência"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logotipo e Imagem */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Logotipo Visual (Marca da Empresa)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha entre exibir a sigla estilizada em texto ou enviar a imagem oficial do seu logotipo.
              </p>
            </div>
          </div>

          {/* Logo Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTextChange('logoType', 'text')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                formState.logoType === 'text'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                style={{ backgroundColor: getCurrentHex() }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
              >
                {formState.logoText || 'SIGI'}
              </div>
              <div>
                <span className="block text-xs font-bold">Sigla & Ícone em Texto</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Exibe o quadrado colorido com a sigla da empresa.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTextChange('logoType', 'image')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                formState.logoType === 'image'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold">Imagem Personalizada do Logotipo</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Upload de imagem oficial em PNG, SVG ou JPG.
                </span>
              </div>
            </button>
          </div>

          {/* Logo Upload & URL Box (when image option selected) */}
          {formState.logoType === 'image' && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Fazer Upload da Imagem</span>
                </button>

                <span className="text-xs text-slate-400">ou insira a URL da imagem abaixo:</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={formState.logoImageUrl || ''}
                  onChange={(e) => handleTextChange('logoImageUrl', e.target.value)}
                  placeholder="https://exemplo.com.br/minha-logo.png"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                />

                {formState.logoImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleTextChange('logoImageUrl', '')}
                    className="p-2.5 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Remover logotipo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {formState.logoImageUrl && (
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500">Preview:</span>
                  <div className="h-8 max-w-[160px] flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded">
                    <img src={formState.logoImageUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Temas Completos do Sistema (1-Clique) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Temas Completos do Sistema (Combinações Prontas)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione um tema pré-configurado para alterar a cor do cabeçalho, menu lateral, fundo e destaques em 1 clique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fullThemePresets.map((theme) => {
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setFormState((prev) => ({ ...prev, ...theme.config }));
                    if (onShowToast) {
                      onShowToast('Tema Selecionado', `O tema "${theme.name}" foi aplicado ao formulário.`);
                    }
                  }}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 text-left transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {theme.name}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${theme.badgeBg}`}>
                        {theme.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {theme.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      Aplicar este tema &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Customização do Cabeçalho (TopBar / Header) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cor do Cabeçalho Superior (TopBar)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize a cor da barra superior onde fica a pesquisa, botão de perfil e notificações.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topbarPresets.map((preset) => {
              const isSelected = formState.topbarEstilo === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleTextChange('topbarEstilo', preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {preset.desc}
                  </p>

                  <div className={`h-6 w-full rounded-lg text-[10px] font-bold px-2 flex items-center justify-between ${preset.previewClass}`}>
                    <span>Cabeçalho</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hex Customizado para Cabeçalho */}
          {formState.topbarEstilo === 'custom' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Escolha a Cor Hexadecimal Personalizada do Cabeçalho:</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.topbarCustomHex || '#ffffff'}
                  onChange={(e) => handleTextChange('topbarCustomHex', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={formState.topbarCustomHex || '#ffffff'}
                  onChange={(e) => handleTextChange('topbarCustomHex', e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-36 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Customização do Menu Lateral (SideBar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <PanelLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cor do Menu Lateral de Navegação (SideBar)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize o fundo e o estilo visual do menu de navegação à esquerda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sidebarPresets.map((preset) => {
              const isSelected = formState.sidebarEstilo === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleTextChange('sidebarEstilo', preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {preset.desc}
                  </p>

                  <div className={`h-6 w-full rounded-lg text-[10px] font-bold px-2 flex items-center justify-between ${preset.previewClass}`}>
                    <span>Menu Lateral</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hex Customizado para Menu Lateral */}
          {formState.sidebarEstilo === 'custom' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Escolha a Cor Hexadecimal Personalizada do Menu Lateral:</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.sidebarCustomHex || '#ffffff'}
                  onChange={(e) => handleTextChange('sidebarCustomHex', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={formState.sidebarCustomHex || '#ffffff'}
                  onChange={(e) => handleTextChange('sidebarCustomHex', e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-36 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Customização da Cor Geral de Fundo do Sistema */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cor Geral de Fundo do Sistema (Background Geral)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize a cor de fundo utilizada em todas as telas, workspaces e painéis do sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {bgPresets.map((preset) => {
              const isSelected = formState.fundoEstilo === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleTextChange('fundoEstilo', preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {preset.desc}
                  </p>

                  <div className={`h-6 w-full rounded-lg border text-[10px] font-bold px-2 flex items-center justify-between ${preset.sampleBg} ${preset.darkSampleBg}`}>
                    <span className="text-slate-500">Amostra</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Seletor de cor Hex personalizada para o fundo */}
          {formState.fundoEstilo === 'custom' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Escolha a Cor Hexadecimal Personalizada do Fundo:</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.fundoCustomHex || '#f8fafc'}
                  onChange={(e) => handleTextChange('fundoCustomHex', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={formState.fundoCustomHex || '#f8fafc'}
                  onChange={(e) => handleTextChange('fundoCustomHex', e.target.value)}
                  placeholder="#F8FAFC"
                  className="w-36 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Cor Base Geral / Tema de Destaque Primário */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cor de Destaque Primário (Botões & Acentos)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione a cor utilizada para botões principais, seleções ativas e detalhes visuais.
              </p>
            </div>
          </div>

          {/* Color Preset Swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colorPresets.map((preset) => {
              const isSelected = formState.corBase === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleTextChange('corBase', preset.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 relative ${
                    isSelected
                      ? `border-slate-900 dark:border-white ring-2 ${preset.ringClass} bg-slate-50 dark:bg-slate-800/80 font-bold shadow-xs`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl shrink-0 shadow-xs flex items-center justify-center ${preset.bgClass}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                  <span className="text-xs truncate">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Picker Input */}
          {formState.corBase === 'custom' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Escolha a Cor Hexadecimal Personalizada de Destaque:</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.customHexColor || '#4f46e5'}
                  onChange={(e) => handleTextChange('customHexColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={formState.customHexColor || '#4f46e5'}
                  onChange={(e) => handleTextChange('customHexColor', e.target.value)}
                  placeholder="#4F46E5"
                  className="w-36 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Textos de Rodapé & Suporte */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Rodapé & Contato de Suporte
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informações exibidas no rodapé das impressões de relatórios e comunicados do sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Texto do Rodapé / Direitos Reservados
              </label>
              <input
                type="text"
                value={formState.rodapeTexto || ''}
                onChange={(e) => handleTextChange('rodapeTexto', e.target.value)}
                placeholder="Ex: SIGI © 2026 - Todos os direitos reservados"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Informação de Contato do Suporte Técnico
              </label>
              <input
                type="text"
                value={formState.suporteContato || ''}
                onChange={(e) => handleTextChange('suporteContato', e.target.value)}
                placeholder="Ex: Suporte Técnico: (22) 99999-8888 | suporte@empresa.com.br"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 8: Alertas e Informativos do Dashboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Alertas e Informativos do Dashboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure os limites de dias para os alertas de monitoramento de clientes no Dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dias para Alerta (Ativação | Retenção)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formState.diasAlertaMonitoramento}
                  onChange={(e) => handleTextChange('diasAlertaMonitoramento', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  min="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Dias</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                Clientes em classificação "Ativação | Retenção" por mais tempo que este limite serão listados como alerta no Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Configurações Padrões</span>
          </button>

          <div className="flex items-center gap-3">
            {isSavedSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Alterações salvas!
              </span>
            )}

            <button
              type="submit"
              style={{ backgroundColor: getCurrentHex() }}
              className="px-6 py-3 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Customização</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
