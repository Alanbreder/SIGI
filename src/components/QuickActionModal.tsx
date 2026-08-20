import React from 'react';
import { RecentActivity, Cliente, AtendimentoItem, SystemOptionsConfig, UserAccount, SystemTablesData, AtendimentoFixoItem, RegistroItem } from '../types';
import { AtendimentoFormDrawer } from './drawers/AtendimentoFormDrawer';
import { RegistroFormDrawer } from './drawers/RegistroFormDrawer';
import { ClienteFormDrawer } from './drawers/ClienteFormDrawer';
import { AtendimentoFixoFormDrawer } from './drawers/AtendimentoFixoFormDrawer';

export type QuickActionType = 'atendimento' | 'registro' | 'cliente' | 'atendimento_fixo' | null;

interface QuickActionModalProps {
  actionType: QuickActionType;
  onClose: () => void;
  onSuccess: (newActivity: RecentActivity, category: 'atendimentos' | 'registros' | 'clientes' | 'atendimentos_fixos', createdItem?: any) => void;
  allClients?: Cliente[];
  onOpenWorkspaceAtendimento?: (atendimento: AtendimentoItem) => void;
  onShowToast?: (title: string, message: string) => void;
  systemOptions?: SystemOptionsConfig;
  systemUsers?: UserAccount[];
  currentUserName?: string;
  systemTables?: SystemTablesData;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  actionType,
  onClose,
  onSuccess,
  allClients = [],
  onOpenWorkspaceAtendimento,
  systemUsers,
  currentUserName,
  onShowToast,
  systemTables
}) => {
  if (!actionType) return null;

  if (actionType === 'atendimento') {
    return (
      <AtendimentoFormDrawer
        isOpen={true}
        onClose={onClose}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={systemUsers}
        currentUserName={currentUserName}
        onShowToast={onShowToast}
        onSave={(newAtd: AtendimentoItem) => {
          const newActivity: RecentActivity = {
            id: newAtd.id,
            type: 'atendimento',
            title: `Atendimento ${newAtd.codigo}: ${newAtd.clienteNome}`,
            description: newAtd.assunto,
            timestamp: 'Agora mesmo',
          };

          onSuccess(newActivity, 'atendimentos', newAtd);

          if (onOpenWorkspaceAtendimento) {
            onOpenWorkspaceAtendimento(newAtd);
          }
        }}
      />
    );
  }

  if (actionType === 'registro') {
    return (
      <RegistroFormDrawer
        isOpen={true}
        onClose={onClose}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={systemUsers}
        onShowToast={onShowToast}
        onSave={(newReg: RegistroItem) => {
          const newActivity: RecentActivity = {
            id: newReg.id,
            type: 'registro',
            title: `Registro ${newReg.codigo} (${newReg.tipo}): ${newReg.titulo}`,
            description: newReg.descricao || newReg.titulo,
            timestamp: 'Agora mesmo',
          };

          onSuccess(newActivity, 'registros', newReg);
        }}
      />
    );
  }

  if (actionType === 'cliente') {
    return (
      <ClienteFormDrawer
        isOpen={true}
        onClose={onClose}
        systemTables={systemTables}
        onShowToast={onShowToast}
        onSave={(newClient: Cliente) => {
          const newActivity: RecentActivity = {
            id: newClient.id,
            type: 'cliente',
            title: `Cliente Cadastrado: ${newClient.razaoSocial}`,
            description: `Novo cadastro da empresa ${newClient.razaoSocial} realizado com sucesso.`,
            timestamp: 'Agora mesmo',
          };
          onSuccess(newActivity, 'clientes', newClient);
        }}
      />
    );
  }

  if (actionType === 'atendimento_fixo') {
    return (
      <AtendimentoFixoFormDrawer
        isOpen={true}
        onClose={onClose}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={systemUsers}
        currentUserName={currentUserName}
        onShowToast={onShowToast}
        onSave={(newAtdFixo: AtendimentoFixoItem) => {
          const newActivity: RecentActivity = {
            id: newAtdFixo.id,
            type: 'atendimento',
            title: `Atendimento Fixo ${newAtdFixo.codigo}: ${newAtdFixo.clienteNome}`,
            description: newAtdFixo.periodoManutencao,
            timestamp: 'Agora mesmo',
          };
          onSuccess(newActivity, 'atendimentos_fixos', newAtdFixo);
        }}
      />
    );
  }

  return null;
};
