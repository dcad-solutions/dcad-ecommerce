// Termo de autorização de comunicações pelo WhatsApp (LGPD).
// O texto é o mesmo do cadastro. Se mudar o texto, mude também a versão: o aceite de cada cliente
// guarda a versão que ele leu (dcad_clientes.aceita_whatsapp_versao).

export const TERMO_WHATSAPP_VERSAO = 'v1.0';

export const TERMO_WHATSAPP: { titulo: string; texto: string }[] = [
  { titulo: 'Controladora', texto: 'D-CAD Dental Digital Solutions — São Luís/MA — dcadsolutions@gmail.com' },
  { titulo: 'Base legal', texto: 'consentimento livre, informado e inequívoco (LGPD Art. 7º I e Art. 8º; CDC Art. 6º III; Marco Civil da Internet Lei 12.965/2014).' },
  { titulo: 'Dados utilizados', texto: 'número de celular — exclusivamente para as comunicações descritas acima, por plataformas operadas pela D-CAD. Não compartilhado com terceiros.' },
  { titulo: 'Revogação', texto: 'a qualquer momento, sem ônus, via dcadsolutions@gmail.com (LGPD Art. 8º §5º). Ao aceitar, data/hora e versão do termo serão registradas como prova do consentimento.' },
];

/** O que o cliente recebe ao autorizar (as "comunicações descritas acima" do termo). */
export const BENEFICIOS_WHATSAPP = [
  'Status dos seus pedidos (produção, pronto, entrega)',
  'Novidades e lançamentos da D-CAD',
  'Promoções e condições exclusivas',
  'Conteúdo educativo de odontologia digital',
];

/** IP de quem fez o pedido, para o registro do consentimento. */
export function ipDoPedido(h: Headers): string | null {
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim()
    || h.get('x-real-ip')?.trim()
    || h.get('x-nf-client-connection-ip')?.trim();
  return ip ? ip.slice(0, 64) : null;
}
