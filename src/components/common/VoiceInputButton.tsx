import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, X } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  currentValue?: string;
  className?: string;
  tooltipLabel?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentValue = '',
  className = '',
  tooltipLabel = 'Transcrição por Voz em Tempo Real'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recognitionInstanceRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const shouldBeListeningRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');
  const currentValueRef = useRef<string>(currentValue);

  // Keep currentValueRef updated with the absolute latest text from parent
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Clean up previous instance if any
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.abort();
      } catch (e) {}
    }

    // Capture what is currently in the text area to use as baseline
    const latestVal = currentValueRef.current || '';
    baseTextRef.current = latestVal
      ? latestVal + (latestVal.endsWith(' ') || latestVal.endsWith('\n') ? '' : ' ')
      : '';

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'pt-BR';

    rec.onstart = () => {
      setIsListening(true);
      shouldBeListeningRef.current = true;
    };

    rec.onresult = (event: any) => {
      let sessionTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionTranscript += event.results[i][0].transcript;
      }
      const fullText = baseTextRef.current + sessionTranscript;
      onTranscript(fullText);
    };

    rec.onerror = (event: any) => {
      console.warn('[VoiceInput] Erro no microfone:', event.error);
      
      if (event.error === 'no-speech') {
        // Quiet silence error: not fatal, let it end and auto-restart if active
        console.log('[VoiceInput] Nenhum som detectado.');
        return;
      }

      // Any other error is fatal to this session, stop the loop to prevent infinite restarts!
      shouldBeListeningRef.current = false;
      setIsListening(false);

      if (event.error === 'not-allowed') {
        setErrorMessage('Permissão de microfone negada ou bloqueada pelo navegador.');
        setShowHelp(true);
      } else if (event.error === 'service-not-allowed') {
        setErrorMessage('O serviço de reconhecimento de voz não é permitido nesta página (comum dentro de iframes).');
        setShowHelp(true);
      } else if (event.error === 'audio-capture') {
        setErrorMessage('Nenhum microfone encontrado ou o microfone está desativado no sistema/navegador.');
        setShowHelp(true);
      } else if (event.error === 'network') {
        setErrorMessage('Erro de rede: O serviço de transcrição do seu navegador falhou ao conectar. (Aviso: Navegadores como Brave ou extensões de privacidade bloqueiam esse serviço. Use o Chrome).');
        setShowHelp(true);
      } else if (event.error === 'aborted') {
        // Aborted usually means we stopped it intentionally, no need to show error
      } else {
        setErrorMessage(`Falha na transcrição: ${event.error}`);
        setShowHelp(true);
      }
    };

    rec.onend = () => {
      // If we should be listening and didn't face a fatal error, restart with a slight delay
      if (shouldBeListeningRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current) {
            startRecognition();
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recognitionInstanceRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error('[VoiceInput] Falha ao dar start no SpeechRecognition:', err);
    }
  };

  const stopRecognition = () => {
    shouldBeListeningRef.current = false;
    setIsListening(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Seu navegador não suporta a API de Transcrição por Voz (Web Speech API). Tente utilizar Google Chrome ou Microsoft Edge.');
      setShowHelp(true);
      return;
    }

    if (isListening) {
      stopRecognition();
    } else {
      setErrorMessage(null);
      startRecognition();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Parar Transcrição por Voz' : tooltipLabel}
        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-pulse ring-2 ring-rose-400/50'
            : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-bounce shrink-0 text-white" />
            <span className="text-[11px] font-extrabold tracking-wide">Gravando... (Clique p/ Parar)</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-[11px] font-semibold">Ditado / Voz</span>
          </>
        )}
      </button>

      {/* Botão de ajuda caso haja erro */}
      {errorMessage && (
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="p-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-md transition-colors"
          title="Ver ajuda de permissão de microfone"
        >
          <AlertCircle className="w-4 h-4 animate-bounce" />
        </button>
      )}

      {/* Modal / Drawer explicativo sobre permissão de microfone */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Problema com o Microfone
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {errorMessage || 'Não foi possível acessar seu microfone.'}
            </p>

            {errorMessage?.includes('iframe') ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-2 mb-4">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  💡 Dica importante para o Preview:
                </p>
                <p className="leading-relaxed">
                  Navegadores bloqueiam o uso de microfones dentro de quadros incorporados (iframes) por segurança.
                </p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                  Para resolver isso facilmente: abra o aplicativo em uma <strong>Nova Aba</strong> clicando no botão no topo direito da tela de visualização do AI Studio.
                </p>
              </div>
            ) : errorMessage?.includes('rede') ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-2 mb-4">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  💡 Problemas comuns de rede na transcrição:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>O navegador Brave bloqueia ativamente as chamadas do Google Speech (Shields).</li>
                  <li>Extensões de privacidade (AdBlockers, Privacy Badger) podem interferir.</li>
                  <li>Conexão de internet instável ou firewalls corporativos.</li>
                </ul>
                <p className="font-semibold mt-2">
                  Solução recomendada: Use o Google Chrome limpo sem bloqueadores agressivos.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

