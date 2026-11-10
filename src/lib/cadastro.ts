// Monta o registro de dcad_clientes a partir do formulário de cadastro do Wizard.
// Roda no servidor: não confia em nada do navegador (tipos, tamanhos, campos de controle).

import { TERMO_WHATSAPP_VERSAO } from './termo-whatsapp';

/** Tipo do formulário → tipo_cliente do banco. */
const TIPOS: Record<string, 'dentista_clinica' | 'radiologia' | 'cursos'> = {
  dentista: 'dentista_clinica', dentista_clinica: 'dentista_clinica',
  clinica: 'radiologia', radiologia: 'radiologia',
  cursos: 'cursos',
};

/** Radiologia e cursos só entram depois da aprovação da equipe. */
export const precisaAprovacao = (tipo: string | null | undefined) => tipo === 'radiologia' || tipo === 'cursos' || tipo === 'clinica';

const txt = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const opc = (v: unknown, max = 200) => txt(v, max) || null;
const digitos = (v: unknown, max = 20) => txt(v, 60).replace(/\D/g, '').slice(0, max);

const CAMPOS_ENDERECO = ['rua', 'numero', 'bairro', 'complemento', 'cidade', 'estado', 'cep'] as const;
function endereco(v: unknown) {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const e = Object.fromEntries(CAMPOS_ENDERECO.map(k => [k, txt(o[k], k === 'estado' ? 2 : 120)]));
  return Object.values(e).some(Boolean) ? e : null;
}

export interface Consentimento { em: string; ip: string | null }

/**
 * Valida o formulário e devolve o registro (sem id). O aceite do WhatsApp só é gravado com celular
 * e "tem WhatsApp" marcados; data, IP e versão do termo vêm do servidor.
 */
export function montarCadastro(corpo: Record<string, unknown>, consentimento: Consentimento) {
  const email = txt(corpo.email, 254).toLowerCase();
  const nome = txt(corpo.nome, 120);
  const celular = digitos(corpo.celular, 13);
  const cro = txt(corpo.cro, 30);
  const tipo = TIPOS[txt(corpo.tipo, 30)];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'E-mail inválido.' } as const;
  if (!nome || !cro) return { erro: 'Preencha nome e CRO.' } as const;
  if (celular.length < 10) return { erro: 'Celular inválido.' } as const;
  if (!tipo) return { erro: 'Tipo de cadastro inválido.' } as const;

  const temWhatsapp = corpo.temWhatsapp === true;
  const aceita = temWhatsapp && corpo.aceitaWhatsapp === true;
  const end = endereco(corpo.endereco);
  const docCnpj = corpo.docType === 'cnpj';

  return {
    registro: {
      email, nome, celular, cro,
      tipo_cliente: tipo,
      especialidade: opc(corpo.especialidade, 80),
      nome_clinica: opc(corpo.clinica, 120),
      cnpj: docCnpj ? (digitos(corpo.cnpj, 14) || null) : null,
      cpf: docCnpj ? null : (digitos(corpo.cpf, 11) || null),
      nome_fantasia: opc(corpo.razaoSocial, 160),
      tipo_pessoa: docCnpj ? 'juridica' : 'fisica',
      endereco: end,
      endereco_entrega: corpo.entregaIgual === false ? endereco(corpo.enderecoEntrega) : end,
      // Mesmo comportamento de antes: quem depende de aprovação já mandou todos os dados
      cadastro_completo: precisaAprovacao(tipo),
      origem: 'portal',
      tem_whatsapp: temWhatsapp,
      aceita_whatsapp: aceita,
      aceita_whatsapp_em: aceita ? consentimento.em : null,
      aceita_whatsapp_versao: aceita ? TERMO_WHATSAPP_VERSAO : null,
      aceita_whatsapp_ip: aceita ? consentimento.ip : null,
    },
  } as const;
}
