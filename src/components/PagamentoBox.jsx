"use client";
import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, Copy, CreditCard, FileText, RefreshCw, Clock, AlertTriangle } from "lucide-react";

// Caixa de pagamento do pedido: Pix (QR Code + copia e cola), boleto (linha digitável, PDF e Pix do boleto)
// ou cartão (link do checkout InfinitePay). Confere a situação sozinha enquanto estiver aberta.

// Escuro fixo (checkout) ou pelos tokens do tema do portal (Meus Pedidos, retorno do pagamento)
const ESCURO = { bg: "#161616", bg2: "#1E1E1E", borda: "rgba(255,255,255,0.08)", texto: "#F0F0F0", sec: "#9A9A9A" };
const TEMA = { bg: "var(--dcad-card)", bg2: "var(--dcad-bg)", borda: "var(--dcad-border)", texto: "var(--dcad-text)", sec: "var(--dcad-text-sec)" };
const FIXAS = { red: "#E52229", green: "#22C55E", yellow: "#EAB308" };
let K = { ...ESCURO, ...FIXAS };
const brl = v => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = iso => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
const horaBR = iso => (iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

function Copiar({ texto, rotulo }) {
  const [ok, setOk] = useState(false);
  const ref = useRef(null);
  async function copiar() {
    try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 2500); }
    catch { ref.current?.select(); }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", minWidth: 0 }}>
      <textarea ref={ref} readOnly value={texto} rows={3} onFocus={e => e.target.select()} aria-label={rotulo}
        style={{ width: "100%", boxSizing: "border-box", resize: "none", background: K.bg2, border: `1px solid ${K.borda}`, borderRadius: 8, color: K.texto, fontSize: 12, padding: 10, fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }} />
      <button type="button" onClick={copiar}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, borderRadius: 10, border: `1px solid ${ok ? K.green : K.borda}`, background: ok ? "rgba(34,197,94,0.12)" : K.bg2, color: ok ? K.green : K.texto, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        {ok ? <CheckCircle size={16} /> : <Copy size={16} />} {ok ? "Copiado" : rotulo}
      </button>
    </div>
  );
}

/**
 * @param {{ osId: string, inicial?: any, erroInicial?: string | null, forma?: string | null, onPago?: () => void, temaDoPortal?: boolean }} props
 */
export default function PagamentoBox({ osId, inicial = null, erroInicial = null, forma: formaInicial = null, onPago, temaDoPortal = false }) {
  K = { ...(temaDoPortal ? TEMA : ESCURO), ...FIXAS };
  const [pag, setPag] = useState(inicial);
  const [os, setOs] = useState(null);
  const [erro, setErro] = useState(erroInicial);
  const [gerando, setGerando] = useState(false);
  const pagoAvisado = useRef(false);

  const forma = pag?.metodo || os?.forma || formaInicial;
  const pago = pag?.status === "pago" || os?.pagamento_status === "pago";

  async function consultar() {
    try {
      const r = await fetch(`/api/pagamentos?os=${osId}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) return;
      setOs(j.os);
      if (j.pagamento) setPag(j.pagamento);
    } catch { /* rede instável: tenta na próxima */ }
  }

  useEffect(() => {
    consultar();
    const t = setInterval(() => { if (!document.hidden) consultar(); }, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [osId]);

  useEffect(() => {
    if (pago && !pagoAvisado.current) { pagoAvisado.current = true; onPago?.(); }
  }, [pago, onPago]);

  async function gerar() {
    setGerando(true); setErro(null);
    try {
      const r = await fetch(`/api/pagamentos?os=${osId}`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não foi possível gerar o pagamento.");
      setPag(j.pagamento);
    } catch (e) { setErro(e.message); }
    finally { setGerando(false); }
  }

  const caixa = { background: K.bg, border: `1px solid ${K.borda}`, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" };
  const teste = pag?.ambiente === "sandbox";

  if (pago) {
    return (
      <div style={{ ...caixa, borderColor: "rgba(34,197,94,0.4)" }}>
        <CheckCircle size={36} color={K.green} />
        <div style={{ fontSize: 16, fontWeight: 800, color: K.texto }}>Pagamento confirmado</div>
        <div style={{ fontSize: 13, color: K.sec }}>Seu caso já está na fila de produção da D-CAD. Você também recebe a confirmação por e-mail.</div>
      </div>
    );
  }

  const encerrado = pag && ["expirado", "cancelado", "falhou"].includes(pag.status);
  if (os?.status === "cancelado") {
    return (
      <div style={caixa}>
        <AlertTriangle size={30} color={K.yellow} />
        <div style={{ fontSize: 14, fontWeight: 700, color: K.texto }}>Pedido cancelado</div>
        <div style={{ fontSize: 13, color: K.sec }}>O prazo para pagamento terminou. Faça um novo pedido quando quiser — os dados do caso continuam salvos.</div>
      </div>
    );
  }

  if (!pag || encerrado) {
    return (
      <div style={caixa}>
        <div style={{ fontSize: 14, fontWeight: 700, color: K.texto }}>{encerrado ? "A cobrança anterior não vale mais" : "Pagamento ainda não gerado"}</div>
        {erro && <div role="alert" style={{ fontSize: 13, color: "#FCA5A5" }}>{erro}</div>}
        <button type="button" onClick={gerar} disabled={gerando}
          style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: K.red, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: gerando ? 0.6 : 1 }}>
          <RefreshCw size={16} /> {gerando ? "Gerando…" : "Gerar pagamento"}
        </button>
      </div>
    );
  }

  return (
    <div style={caixa}>
      {teste && <div style={{ fontSize: 11, color: "#B45309", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 6, padding: "4px 10px" }}>Cobrança de teste (sandbox do banco) — não pague.</div>}

      {forma === "pix" && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, color: K.texto }}>Pague com Pix · {brl(pag.valor)}</div>
          {pag.pix_qrcode && <img src={pag.pix_qrcode} alt="QR Code Pix" width={220} height={220} style={{ background: "#fff", borderRadius: 10, padding: 8, maxWidth: "100%", height: "auto" }} />}
          {pag.pix_copia_cola && <Copiar texto={pag.pix_copia_cola} rotulo="Copiar código Pix" />}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: K.sec }}>
            <Clock size={13} /> Válido até {horaBR(pag.expira_em)} · a confirmação aparece aqui sozinha
          </div>
        </>
      )}

      {forma === "boleto" && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, color: K.texto }}>Boleto · {brl(pag.valor)} · vence {dataBR(pag.vencimento)}</div>
          {pag.linha_digitavel ? <Copiar texto={pag.linha_digitavel} rotulo="Copiar linha digitável" /> : <div style={{ fontSize: 13, color: K.sec }}>O banco está emitindo o boleto. A linha digitável aparece aqui em instantes.</div>}
          <a href={`/api/pagamentos/boleto?id=${pag.id}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, width: "100%", borderRadius: 10, border: `1px solid ${K.borda}`, background: K.bg2, color: K.texto, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            <FileText size={16} /> Abrir boleto (PDF)
          </a>
          {pag.pix_copia_cola && (
            <details style={{ width: "100%" }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: K.sec, minHeight: 32 }}>Prefere pagar este boleto por Pix?</summary>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 10 }}>
                {pag.pix_qrcode && <img src={pag.pix_qrcode} alt="QR Code Pix do boleto" width={200} height={200} style={{ background: "#fff", borderRadius: 10, padding: 8, maxWidth: "100%", height: "auto" }} />}
                <Copiar texto={pag.pix_copia_cola} rotulo="Copiar código Pix" />
              </div>
            </details>
          )}
        </>
      )}

      {forma === "cartao" && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, color: K.texto }}>Cartão de crédito · {brl(pag.valor)}</div>
          <div style={{ fontSize: 13, color: K.sec }}>O pagamento é feito no ambiente seguro da InfinitePay. Ao terminar, você volta para cá.</div>
          <a href={pag.link} rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", borderRadius: 10, background: K.red, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            <CreditCard size={18} /> Pagar com cartão
          </a>
          <div style={{ fontSize: 12, color: K.sec }}>Link válido até {horaBR(pag.expira_em)}</div>
        </>
      )}
    </div>
  );
}
