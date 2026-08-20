import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { EquipmentCustomFieldDef } from '../../types';
import { BADGE_COLOR_OPTIONS, renderBadgePill } from '../../lib/badgeUtils';

interface DynamicFieldsFormProps {
  fields?: EquipmentCustomFieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
  title?: string;
}

export const DynamicFieldsForm: React.FC<DynamicFieldsFormProps> = ({
  fields = [],
  values,
  onChange,
  readOnly = false,
  title
}) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!fields || fields.length === 0) return null;

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {title || 'Campos Dinâmicos do Cadastro'}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {fields.map((field) => {
          const fieldKey = field.key || field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
          const currentValue = values[fieldKey] !== undefined ? values[fieldKey] : '';
          const fieldType = field.type || 'text';

          if (readOnly) {
            return (
              <div key={fieldKey} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                  {field.label}
                </span>
                {fieldType === 'badge' ? (
                  <div>
                    {currentValue ? (
                      renderBadgePill(
                        currentValue,
                        field.badgeColors?.[currentValue] || 'indigo'
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">Não informado</span>
                    )}
                  </div>
                ) : fieldType === 'password' ? (
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>
                      {showPasswords[fieldKey] ? currentValue || '••••••••' : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(fieldKey)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      {showPasswords[fieldKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {currentValue !== '' && currentValue !== undefined ? String(currentValue) : 'Não informado'}
                  </span>
                )}
              </div>
            );
          }

          // Editable Mode
          return (
            <div key={fieldKey} className={fieldType === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>

              {/* FIELD TYPE: BADGE */}
              {fieldType === 'badge' ? (
                <div className="space-y-1.5">
                  <select
                    value={currentValue}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="">Selecione a opção...</option>
                    {(field.options && field.options.length > 0
                      ? field.options
                      : ['Alta', 'Média', 'Baixa']
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {currentValue && (
                    <div className="pt-0.5">
                      {renderBadgePill(
                        currentValue,
                        field.badgeColors?.[currentValue] || 'indigo'
                      )}
                    </div>
                  )}
                </div>
              ) : fieldType === 'select' ? (
                /* FIELD TYPE: SELECT */
                <select
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : fieldType === 'password' ? (
                /* FIELD TYPE: PASSWORD */
                <div className="relative">
                  <input
                    type={showPasswords[fieldKey] ? 'text' : 'password'}
                    placeholder={field.placeholder || '••••••••'}
                    value={currentValue}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(fieldKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-indigo-600"
                  >
                    {showPasswords[fieldKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : fieldType === 'textarea' ? (
                /* FIELD TYPE: TEXTAREA */
                <textarea
                  rows={2}
                  placeholder={field.placeholder || 'Preencha este campo...'}
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              ) : fieldType === 'boolean' ? (
                /* FIELD TYPE: BOOLEAN */
                <select
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              ) : fieldType === 'number' ? (
                /* FIELD TYPE: NUMBER */
                <input
                  type="number"
                  placeholder={field.placeholder || '0'}
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              ) : fieldType === 'date' ? (
                /* FIELD TYPE: DATE */
                <input
                  type="date"
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              ) : (
                /* FIELD TYPE: TEXT (DEFAULT) */
                <input
                  type="text"
                  placeholder={field.placeholder || 'Preencha...'}
                  value={currentValue}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
