import React, { useState } from 'react';
import {
  Search,
  Loader2,
  Building2,
  FileText,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Receipt,
  BadgePercent,
  Calendar,
  Building,
  RefreshCw,
  Info
} from 'lucide-react';

interface InscricaoEstadual {
  inscricao_estadual: string;
  uf: string;
  ativo: boolean;
  atualizado_em?: string;
  estado?: {
    sigla: string;
    nome: string;
  };
}

interface Socio {
  nome: string;
  qualificacao: string;
  data_entrada?: string;
  faixa_etaria?: string;
  pais?: string;
}

interface CnaeSecundario {
  codigo: string | number;
  descricao: string;
}

interface CNPJFullData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  data_situacao_cadastral?: string;
  motivo_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  porte: string;
  capital_social: number;
  natureza_juridica: string;
  cnae_principal: { codigo: string | number; descricao: string };
  cnaes_secundarios: CnaeSecundario[];
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  qsa: Socio[];
  simples: {
    optante: boolean;
    data_opcao?: string;
    data_exclusao?: string;
  };
  mei: {
    optante: boolean;
    data_opcao?: string;
    data_exclusao?: string;
  };
  inscricoes_estaduais: InscricaoEstadual[];
  fonte_dados: string[];
}

export const ConsultaFiscalView: React.FC = () => {
  const [cnpjInput, setCnpjInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CNPJFullData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchCnae, setSearchCnae] = useState('');

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConsultar = async () => {
    const cnpjClean = cnpjInput.replace(/\D/g, '');
    if (cnpjClean.length !== 14) {
      setError('O CNPJ deve possuir exatamente 14 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const fontes: string[] = [];

    try {
      // Executa requisições paralelas para múltiplas fontes públicas sem necessidade de chave
      const [brasilApiRes, cnpjsWsRes, minhaReceitaRes] = await Promise.allSettled([
        fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`).then((r) => {
          if (!r.ok) throw new Error(`BrasilAPI HTTP ${r.status}`);
          return r.json();
        }),
        fetch(`https://publica.cnpj.ws/cnpj/${cnpjClean}`).then((r) => {
          if (!r.ok) throw new Error(`CNPJ.ws HTTP ${r.status}`);
          return r.json();
        }),
        fetch(`https://minhareceita.org/${cnpjClean}`).then((r) => {
          if (!r.ok) throw new Error(`Minha Receita HTTP ${r.status}`);
          return r.json();
        }),
      ]);

      let bData: any = null;
      let wsData: any = null;
      let mrData: any = null;

      if (brasilApiRes.status === 'fulfilled') {
        bData = brasilApiRes.value;
        fontes.push('BrasilAPI');
      }
      if (cnpjsWsRes.status === 'fulfilled') {
        wsData = cnpjsWsRes.value;
        fontes.push('CNPJ.ws (Inscrições Estaduais)');
      }
      if (minhaReceitaRes.status === 'fulfilled') {
        mrData = minhaReceitaRes.value;
        fontes.push('Minha Receita');
      }

      if (!bData && !wsData && !mrData) {
        throw new Error('Não foi possível encontrar dados para este CNPJ nas fontes públicas. Verifique o número digitado.');
      }

      // Normalização e fusão inteligente dos dados obtidos
      const razao_social =
        wsData?.razao_social || bData?.razao_social || mrData?.razao_social || 'Não informada';
      const nome_fantasia =
        wsData?.estabelecimento?.nome_fantasia ||
        bData?.nome_fantasia ||
        mrData?.nome_fantasia ||
        wsData?.razao_social ||
        'Não informado (Igual à Razão)';

      // Situação Cadastral
      let situacao_cadastral = 'ATIVA';
      let data_situacao = '';
      if (wsData?.estabelecimento?.situacao_cadastral) {
        situacao_cadastral = wsData.estabelecimento.situacao_cadastral;
        data_situacao = wsData.estabelecimento.data_situacao_cadastral || '';
      } else if (bData?.descricao_situacao_cadastral) {
        situacao_cadastral = bData.descricao_situacao_cadastral;
        data_situacao = bData.data_situacao_cadastral || '';
      } else if (mrData?.descricao_situacao_cadastral) {
        situacao_cadastral = mrData.descricao_situacao_cadastral;
        data_situacao = mrData.data_situacao_cadastral || '';
      }

      // Endereço
      const logradouro =
        wsData?.estabelecimento?.tipo_logradouro
          ? `${wsData.estabelecimento.tipo_logradouro} ${wsData.estabelecimento.logradouro}`
          : bData?.logradouro || mrData?.logradouro || '';
      const numero = wsData?.estabelecimento?.numero || bData?.numero || mrData?.numero || 'S/N';
      const complemento =
        wsData?.estabelecimento?.complemento || bData?.complemento || mrData?.complemento || '';
      const bairro = wsData?.estabelecimento?.bairro || bData?.bairro || mrData?.bairro || '';
      const cep = wsData?.estabelecimento?.cep || bData?.cep || mrData?.cep || '';
      const municipio =
        wsData?.estabelecimento?.cidade?.nome || bData?.municipio || mrData?.municipio || '';
      const uf = wsData?.estabelecimento?.estado?.sigla || bData?.uf || mrData?.uf || '';

      // Contatos
      const ddd1 = wsData?.estabelecimento?.ddd1 || bData?.ddd_telefone_1?.substring(0, 2) || '';
      const tel1 = wsData?.estabelecimento?.telefone1 || bData?.ddd_telefone_1 || mrData?.ddd_telefone_1 || '';
      const telefoneFormatted = ddd1 && !tel1.startsWith(ddd1) ? `(${ddd1}) ${tel1}` : tel1;
      const email = wsData?.estabelecimento?.email || bData?.email || mrData?.email || '';

      // Capital e Porte
      const capital_social =
        parseFloat(wsData?.capital_social) ||
        parseFloat(bData?.capital_social) ||
        parseFloat(mrData?.capital_social) ||
        0;
      const porte =
        wsData?.porte?.descricao || bData?.descricao_porte || mrData?.porte || 'Não informado';
      const natureza_juridica =
        wsData?.natureza_juridica?.descricao ||
        bData?.natureza_juridica ||
        mrData?.natureza_juridica ||
        '';

      // Data inicio
      const data_inicio_atividade =
        wsData?.estabelecimento?.data_inicio_atividade ||
        bData?.data_inicio_atividade ||
        mrData?.data_inicio_atividade ||
        '';

      // CNAEs
      let cnae_principal = { codigo: '', descricao: 'Não informado' };
      if (wsData?.estabelecimento?.atividade_principal) {
        cnae_principal = {
          codigo: wsData.estabelecimento.atividade_principal.subclasse || wsData.estabelecimento.atividade_principal.id,
          descricao: wsData.estabelecimento.atividade_principal.descricao,
        };
      } else if (bData?.cnae_fiscal) {
        cnae_principal = {
          codigo: bData.cnae_fiscal,
          descricao: bData.cnae_fiscal_descricao || '',
        };
      } else if (mrData?.cnae_fiscal) {
        cnae_principal = {
          codigo: mrData.cnae_fiscal,
          descricao: mrData.cnae_fiscal_descricao || '',
        };
      }

      let cnaes_secundarios: CnaeSecundario[] = [];
      if (wsData?.estabelecimento?.atividades_secundarias) {
        cnaes_secundarios = wsData.estabelecimento.atividades_secundarias.map((a: any) => ({
          codigo: a.subclasse || a.id,
          descricao: a.descricao,
        }));
      } else if (bData?.cnaes_secundarios) {
        cnaes_secundarios = bData.cnaes_secundarios.map((a: any) => ({
          codigo: a.codigo,
          descricao: a.descricao,
        }));
      } else if (mrData?.cnaes_secundarios) {
        cnaes_secundarios = mrData.cnaes_secundarios.map((a: any) => ({
          codigo: a.codigo,
          descricao: a.descricao,
        }));
      }

      // Inscrições Estaduais (Extraídas prioritariamente do CNPJ.ws)
      let inscricoes_estaduais: InscricaoEstadual[] = [];
      if (wsData?.estabelecimento?.inscricoes_estaduais) {
        inscricoes_estaduais = wsData.estabelecimento.inscricoes_estaduais.map((ie: any) => ({
          inscricao_estadual: ie.inscricao_estadual,
          uf: ie.estado?.sigla || ie.uf || uf,
          ativo: ie.ativo ?? true,
          atualizado_em: ie.atualizado_em,
        }));
      } else if (bData?.estabelecimento?.inscricoes_estaduais) {
        inscricoes_estaduais = bData.estabelecimento.inscricoes_estaduais;
      }

      // Simples e MEI
      const simples = {
        optante: Boolean(
          wsData?.simples?.optante ?? bData?.opcao_pelo_simples ?? mrData?.opcao_pelo_simples
        ),
        data_opcao:
          wsData?.simples?.data_opcao || bData?.data_opcao_pelo_simples || mrData?.data_opcao_pelo_simples,
        data_exclusao:
          wsData?.simples?.data_exclusao || bData?.data_exclusao_do_simples || mrData?.data_exclusao_do_simples,
      };

      const mei = {
        optante: Boolean(wsData?.simei?.optante ?? bData?.opcao_pelo_mei ?? mrData?.opcao_pelo_mei),
        data_opcao: wsData?.simei?.data_opcao || bData?.data_opcao_pelo_mei,
      };

      // QSA (Sócios)
      let qsa: Socio[] = [];
      if (wsData?.socios) {
        qsa = wsData.socios.map((s: any) => ({
          nome: s.nome,
          qualificacao: s.qualificacao_socio?.descricao || 'Sócio / Administrador',
          data_entrada: s.data_entrada,
          faixa_etaria: s.faixa_etaria?.descricao,
          pais: s.pais?.nome,
        }));
      } else if (bData?.qsa) {
        qsa = bData.qsa.map((s: any) => ({
          nome: s.nome,
          qualificacao: s.qualificacao_socio || s.qual || 'Sócio',
          data_entrada: s.data_entrada_sociedade,
          pais: s.pais,
        }));
      } else if (mrData?.qsa) {
        qsa = mrData.qsa.map((s: any) => ({
          nome: s.nome,
          qualificacao: s.qualificacao_socio || 'Sócio',
          data_entrada: s.data_entrada_sociedade,
        }));
      }

      const cnpjFormatted = cnpjClean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

      const fullRecord: CNPJFullData = {
        cnpj: cnpjFormatted,
        razao_social,
        nome_fantasia,
        situacao_cadastral,
        data_situacao_cadastral: data_situacao,
        data_inicio_atividade,
        porte,
        capital_social,
        natureza_juridica,
        cnae_principal,
        cnaes_secundarios,
        logradouro,
        numero,
        complemento,
        bairro,
        cep: String(cep),
        municipio,
        uf,
        telefone1: telefoneFormatted,
        email,
        qsa,
        simples,
        mei,
        inscricoes_estaduais,
        fonte_dados: fontes,
      };

      setData(fullRecord);
    } catch (e: any) {
      console.error('Erro na consulta fiscal:', e);
      setError(e.message || 'Erro ao consultar CNPJ nas fontes governamentais públicas.');
    } finally {
      setLoading(false);
    }
  };

  const isAtiva = data?.situacao_cadastral?.toUpperCase() === 'ATIVA';
  const hasActiveIE = data?.inscricoes_estaduais?.some((ie) => ie.ativo);
  const hasIE = (data?.inscricoes_estaduais?.length || 0) > 0;

  // Links de Sintegra/Sefaz por Estado
  const sintegraLinks: Record<string, string> = {
    AC: 'http://sefaznet.ac.gov.br/sefazonline/servlet/hpfsincon',
    AL: 'http://www.sefaz.al.gov.br/asp/sintegra/sintegra.asp?estado=AL',
    AP: 'http://www.sefaz.ap.gov.br/sate/seg/SEGf_AcessarFuncao.jsp?cdFuncao=CAD_011',
    AM: 'http://www.sefaz.am.gov.br/sintegra/sintegra0.asp',
    BA: 'https://portal.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp',
    CE: 'https://servicos.sefaz.ce.gov.br/internet/Sintegra/Sintegra.Asp?estado=CE',
    DF: 'https://ww1.receita.fazenda.df.gov.br/icms/sintegra-consulta',
    ES: 'http://www.sintegra.es.gov.br/',
    GO: 'http://appasp.sefaz.go.gov.br/Sintegra/Consulta/default.asp',
    MA: 'http://aplicacoes.ma.gov.br/sintegra/jsp/consultaSintegra/consultaSintegraFiltro.jsf',
    MT: 'https://www.sefaz.mt.gov.br/cadastro/emissaocartao/emissaocartaocontribuinteacessodireto',
    MS: 'http://www1.sefaz.ms.gov.br/Cadastro/sintegra/cadastromsCCI.asp',
    MG: 'http://consultasintegra.fazenda.mg.gov.br',
    PA: 'http://app.sefa.pa.gov.br/Sintegra/',
    PB: 'https://www4.sefaz.pb.gov.br/sintegra',
    PR: 'http://www.sintegra.fazenda.pr.gov.br/sintegra/',
    PE: 'http://www.sintegra.sefaz.pe.gov.br',
    PI: 'http://web.sintegra.sefaz.pi.gov.br',
    RJ: 'https://sucief-sincad-web.fazenda.rj.gov.br/sincad-web/index.jsf',
    RN: 'http://www.set.rn.gov.br/uvt/consultacontribuinte.aspx',
    RS: 'https://www.sefaz.rs.gov.br/consultas/contribuinte',
    RO: 'http://www.sefin.ro.gov.br/sint_consul.asp',
    RR: 'https://portalapp.sefaz.rr.gov.br/siate/servlet/wp_siate_consultasintegra',
    SC: 'https://sat.sef.sc.gov.br/tax.NET/Sat.Cadastro.Web/ComprovanteIE/Consulta.aspx',
    SP: 'https://www.cadesp.fazenda.sp.gov.br/Pages/Cadastro/Consultas/ConsultaPublica/ConsultaPublica.aspx',
    SE: 'https://security.sefaz.se.gov.br/SIC/sintegra/index.jsp',
    TO: 'http://sintegra.sefaz.to.gov.br',
    SVRS: 'https://dfe-portal.svrs.rs.gov.br/Nfe/Ccc',
  };

  const filteredCnaesSecundarios = data?.cnaes_secundarios.filter(
    (c) =>
      c.codigo.toString().toLowerCase().includes(searchCnae.toLowerCase()) ||
      c.descricao.toLowerCase().includes(searchCnae.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* Box Principal de Pesquisa de CNPJ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Consultar CNPJ - Dados Cadastrais, Fiscais e Inscrição Estadual (IE)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Obtenha informações unificadas da Receita Federal, Sintegra, Simples Nacional, MEI e Inscrições Estaduais.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={cnpjInput}
              onChange={(e) => setCnpjInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
              placeholder="Digite o CNPJ (Ex: 00.000.000/0001-00 ou apenas números)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          </div>

          <button
            type="button"
            onClick={handleConsultar}
            disabled={loading || !cnpjInput.trim()}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando APIs...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consultar CNPJ</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Resultados da Consulta */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Card com Status & Badges */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {data.razao_social}
                  </span>
                  <button
                    onClick={() => handleCopy(data.razao_social, 'razao')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Copiar Razão Social"
                  >
                    {copiedField === 'razao' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Nome Fantasia: <strong className="text-slate-700 dark:text-slate-300">{data.nome_fantasia}</strong></span>
                  <span>•</span>
                  <span>CNPJ: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{data.cnpj}</strong></span>
                  <button
                    onClick={() => handleCopy(data.cnpj.replace(/\D/g, ''), 'cnpj')}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                    title="Copiar CNPJ limpo"
                  >
                    {copiedField === 'cnpj' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </p>
              </div>

              {/* Status Indicator & NF-e Credential Badge */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isAtiva ? (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Situação: {data.situacao_cadastral}</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2 text-xs font-black">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Situação: {data.situacao_cadastral}</span>
                  </div>
                )}

                {/* Badge de Habilitação / Credenciamento NF-e */}
                {isAtiva && hasActiveIE ? (
                  <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-2xl flex items-center gap-2 text-xs font-black" title="Empresa com Situação Cadastral Ativa e Inscrição Estadual (IE) Ativa para Emissão de NF-e no SINTEGRA/SEFAZ">
                    <FileCheck className="w-4 h-4 text-indigo-500" />
                    <span>Emissão NF-e: HABILITADO (IE ATIVA)</span>
                  </div>
                ) : isAtiva && hasIE && !hasActiveIE ? (
                  <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2 text-xs font-black" title="Inscrição Estadual (IE) consta como inativa ou suspensa na SEFAZ">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Emissão NF-e: SUSPENSO / IE INATIVA</span>
                  </div>
                ) : isAtiva ? (
                  <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center gap-2 text-xs font-black" title="Sem IE estadual vinculada no cadastro público federal. Pode ser prestadora de serviço (NFS-e) ou isenta">
                    <Info className="w-4 h-4 text-amber-500" />
                    <span>Emissão NF-e: CONSULTAR SEFAZ / NFS-e</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center gap-2 text-xs font-black">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>Emissão NF-e: DESHABILITADO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges de Resumo */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" /> Porte: {data.porte}
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Abertura: {data.data_inicio_atividade || 'N/I'}
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-500" /> Capital Social: R$ {data.capital_social.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>

              <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${data.simples.optante ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <BadgePercent className="w-3.5 h-3.5" /> Simples Nacional: {data.simples.optante ? 'OPTANTE' : 'NÃO OPTANTE'}
              </span>

              <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${data.mei.optante ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <ShieldCheck className="w-3.5 h-3.5" /> MEI: {data.mei.optante ? 'SIM' : 'NÃO'}
              </span>
            </div>

            {/* Banner de Fontes Utilizadas */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Fontes consultadas em tempo real: <strong className="text-slate-600 dark:text-slate-400">{data.fonte_dados.join(', ')}</strong>
              </span>
              <span>UF da Matriz/Filial: <strong className="text-slate-600 dark:text-slate-400">{data.uf}</strong></span>
            </div>
          </div>

          {/* Grid de 2 colunas para detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco 1: Inscrições Estaduais (IE - SEFAZ) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Inscrições Estaduais (IE) & Habilitação SEFAZ
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {data.inscricoes_estaduais.length} encontrada(s)
                </span>
              </div>

              {data.inscricoes_estaduais.length > 0 ? (
                <div className="space-y-2.5">
                  {data.inscricoes_estaduais.map((ie, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">UF {ie.uf}:</span>
                          <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                            {ie.inscricao_estadual}
                          </span>
                          <button
                            onClick={() => handleCopy(ie.inscricao_estadual, `ie_${idx}`)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Copiar IE"
                          >
                            {copiedField === `ie_${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {ie.atualizado_em && (
                          <span className="text-[10px] text-slate-400 block">
                            Atualizado em: {new Date(ie.atualizado_em).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black ${
                          ie.ativo
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {ie.ativo ? 'ATIVA' : 'INATIVA'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Nenhuma IE pública anexada no registro federal.</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    A Inscrição Estadual pode ser isenta ou exigir consulta direta na SEFAZ do estado de origem ({data.uf}). Utilize os links diretos abaixo para verificar no SINTEGRA/CCC.
                  </p>
                </div>
              )}

              {/* Botões para consultar Sintegra do Estado e SVRS (CCC) */}
              <div className="flex flex-col sm:flex-row gap-2">
                {sintegraLinks[data.uf] && (
                  <a
                    href={sintegraLinks[data.uf]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>SINTEGRA/SEFAZ ({data.uf})</span>
                  </a>
                )}
                <a
                  href={sintegraLinks.SVRS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Consulta SVRS (CCC)</span>
                </a>
              </div>
            </div>

            {/* Bloco 2: Endereço & Localização */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Endereço & Localização
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Logradouro:</strong> {data.logradouro}, Nº {data.numero} {data.complemento && `(${data.complemento})`}
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Bairro:</strong> {data.bairro || 'N/I'}
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Município/UF:</strong> {data.municipio} / {data.uf}
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium font-mono">
                  <strong>CEP:</strong> {data.cep}
                </p>

                <div className="pt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.logradouro}, ${data.numero}, ${data.municipio} - ${data.uf}, ${data.cep}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ver no Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                  Contatos Oficiais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{data.telefone1 || 'Não informado'}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate" title={data.email}>{data.email || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: CNAEs e Atividades Econômicas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 rounded-xl">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Atividades Econômicas (CNAE Principal e Secundários)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Total de {1 + data.cnaes_secundarios.length} CNAE(s)
                </span>
              </div>

              {/* CNAE Principal */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Atividade Principal (CNAE Fiscal)
                </span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  <span className="font-mono px-2 py-0.5 bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded-md mr-2">
                    {data.cnae_principal.codigo}
                  </span>
                  {data.cnae_principal.descricao}
                </p>
              </div>

              {/* CNAEs Secundários */}
              {data.cnaes_secundarios.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Atividades Secundárias ({data.cnaes_secundarios.length}):
                    </span>
                    <input
                      type="text"
                      value={searchCnae}
                      onChange={(e) => setSearchCnae(e.target.value)}
                      placeholder="Filtrar CNAEs secundários..."
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none w-48"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {filteredCnaesSecundarios?.map((cnae, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center gap-3"
                      >
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded shrink-0">
                          {cnae.codigo}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {cnae.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 4: Quadro de Sócios e Administradores (QSA) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Quadro de Sócios e Administradores (QSA)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {data.qsa.length} integrante(s)
                </span>
              </div>

              {data.qsa.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-2 font-bold">Nome do Sócio / Dirigente</th>
                        <th className="pb-2 font-bold">Qualificação / Cargo</th>
                        <th className="pb-2 font-bold">Data de Entrada</th>
                        <th className="pb-2 font-bold">Faixa Etária / País</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {data.qsa.map((socio, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 font-bold text-slate-900 dark:text-white">{socio.nome}</td>
                          <td className="py-2.5 text-indigo-600 dark:text-indigo-400 font-bold">{socio.qualificacao}</td>
                          <td className="py-2.5 text-slate-500">{socio.data_entrada || 'N/I'}</td>
                          <td className="py-2.5 text-slate-500">{socio.faixa_etaria || socio.pais || 'Brasil'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Nenhum sócio informado no registro público (Empresa Individual ou registro simplificado).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seção Fixa: Painel de Links Rápidos para Consultas Estaduais (SINTEGRA / SEFAZ / SVRS) */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Atalhos Oficiais SINTEGRA / SEFAZ por Estado (UF) e SVRS (CCC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acesse diretamente o portal do SINTEGRA, SEFAZ ou Consulta Centralizada SVRS para verificar comprovantes de Inscrição Estadual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {Object.entries(sintegraLinks).map(([uf, url]) => {
            const isSvrs = uf === 'SVRS';
            const isCurrentUf = data?.uf === uf;
            return (
              <a
                key={uf}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={isSvrs ? 'Portal SVRS - Consulta Centralizada de Contribuinte (CCC)' : `Sintegra / SEFAZ ${uf}`}
                className={`p-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isSvrs
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-extrabold shadow-2xs'
                    : isCurrentUf
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600'
                }`}
              >
                <span>{uf}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

