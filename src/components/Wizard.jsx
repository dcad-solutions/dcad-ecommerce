import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Eye, EyeOff, Check, User, Users, Archive, FolderOpen, MessageCircle, ShoppingCart, ClipboardList, CheckCircle, Clock, CreditCard, Zap, Calendar, Building2, GraduationCap, Stethoscope, Sparkles, Activity, Bone, Leaf, Microscope, Printer, Lightbulb, Package, Tag, Wrench, Ruler, FileText, AlertTriangle, Plus, Trash2, ChevronLeft, X as XIcon, Undo2, MapPin, Hash, BadgePercent, Image, Pencil } from "lucide-react";
import { fetchCatalog } from "@/lib/catalog";

// ── Catálogo local (fallback) ─────────────────────────────────────────────────
// Usado quando o Supabase não está disponível ou o usuário não está autenticado.
// Em produção, os dados vêm do Supabase via useCatalog hook.

const DCAD_LOGO="data:image/png;base64,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";

const C={
  red:"#E52229",dark:"#0F0F0F",dark2:"#1A1A1A",dark3:"#242424",dark4:"#333",
  border:"rgba(255,255,255,0.08)",border2:"rgba(255,255,255,0.14)",
  text:"#FFF",textSec:"#B8B8B8",textMut:"#767676",textFaint:"#888",
  green:"#22C55E",greenBg:"rgba(34,197,94,0.08)",
  yellow:"#EAB308",neutral:"#767676",teal:"#0D9488",
  // Radius tokens
  r:{sm:8,md:12,lg:16},
  // Spacing tokens (4dp rhythm)
  sp:{xs:4,sm:8,md:16,lg:24,xl:32},
};
const fmt=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

/* ── Date of birth helpers ───────────────────────────────────────────── */
function maskDob(raw){
  const d=raw.replace(/\D/g,"").slice(0,8);
  if(d.length<=2)return d;
  if(d.length<=4)return `${d.slice(0,2)}/${d.slice(2)}`;
  return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
}
function parseDob(masked){
  const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(masked||"");
  if(!m)return null;
  const [_,dd,mm,yyyy]=m;
  const day=parseInt(dd,10),month=parseInt(mm,10),year=parseInt(yyyy,10);
  if(month<1||month>12||day<1||day>31)return null;
  const date=new Date(year,month-1,day);
  if(date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day)return null;
  if(date>new Date())return null;
  return date;
}
function calcAge(masked){
  const dob=parseDob(masked);
  if(!dob)return null;
  const today=new Date();
  let years=today.getFullYear()-dob.getFullYear();
  let months=today.getMonth()-dob.getMonth();
  if(today.getDate()<dob.getDate())months--;
  if(months<0){years--;months+=12;}
  if(years<0)return null;
  if(years===0)return `${months} ${months===1?"mês":"meses"}`;
  return `${years} ano${years===1?"":"s"}`;
}

const CATALOG=[
  {id:"implanto",name:"Implantodontia",color:"#E52229",icon:"ti-tooth",desc:"Cirurgia guiada de implantes",
   services:[
    // ── Cirurgia Guiada Unitária ─────────────────────────────────────────────
    {id:"cg1",type:"cirurgia_guiada_unitaria",groupLabel:"Cirurgia Guiada Unitária",name:"Cirurgia Guiada — 1 implante",desc:"Unitária · planejamento + guia impressa",
     fullDesc:"Guia cirúrgico para instalação de 1 implante com posicionamento tridimensional ideal. Desenvolvido a partir de tomografia e escaneamento intraoral, garantindo precisão submilimétrica.",
     exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],
     includes:["Vídeo de planejamento para aprovação","Guia impresso com resina biocompatível e autoclavável com anilhas do sistema escolhido","Relatório cirúrgico em PDF"],
     price:390,days:7,built:true,videoUrl:null,
     usesOdontogram:true,maxTeeth:1,usesArch:false,usesBrand:true,usesKit:true,offersUpsell:true,offersSlicedFile:true,
     planOnly:{name:"Planejamento Cirurgia Guiada — 1 implante",desc:"Arquivo digital do guia (STL)",
       fullDesc:"Planejamento digital completo para 1 implante. Entrega do arquivo STL do guia para impressão pelo cliente.",
       price:220,days:5,exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],offersSlicedFile:true}},
    // ── Cirurgia Guiada Parcial — preço por quantidade exata ────────────────
    {id:"cgparc",type:"cirurgia_guiada_parcial",groupLabel:"Cirurgia Guiada Parcial",name:"Cirurgia Guiada Parcial",desc:"2 a 8 implantes · preço por quantidade",
     fullDesc:"Guia cirúrgico para instalação de 2 a 8 implantes. Selecione os dentes no odontograma — o valor é calculado automaticamente pela quantidade por arcada.",
     exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],
     includes:["Vídeo de planejamento para aprovação","Guia impresso com resina biocompatível e autoclavável com anilhas do sistema escolhido","Relatório cirúrgico em PDF"],
     /* Preço por quantidade exata de implantes — ajustar após validação comercial */
     priceByQty:{2:480,3:560,4:640,5:720,6:800,7:880,8:960},
     price:480,days:7,built:false,videoUrl:null,maxTeeth:8,
     usesOdontogram:true,usesArch:false,usesBrand:true,usesKit:true,offersUpsell:true,offersSlicedFile:true,
     planOnly:{name:"Planejamento Cirurgia Guiada Parcial",desc:"Arquivo digital dos guias (STL)",
       priceByQty:{2:270,3:320,4:380,5:430,6:480,7:530,8:580},
       price:270,days:5,exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],offersSlicedFile:true}},
    // ── Protocolos edêntulos ─────────────────────────────────────────────────
    {id:"proto_total",type:"protocolo",groupLabel:"Protocolo",name:"Protocolo Edêntulo Total",desc:"Arcada total · Reabilitação Completa",
     fullDesc:"Planejamento Completo para Reabilitação de Arcada Total com implantes. Seleção de arcada superior, inferior ou ambas.",
     exams:["Modelo digital das arcadas (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],
     includes:["A definir — itens inclusos serão atualizados em breve"],
     price:1100,days:10,built:false,videoUrl:null,
     usesOdontogram:false,usesArch:true,archAffectsPrice:true,usesBrand:true,usesKit:true,offersUpsell:true,offersSlicedFile:true,
     planOnly:{name:"Planejamento Protocolo Edêntulo Total",desc:"Arquivo digital do protocolo (STL)",price:700,days:7,exams:["Modelo digital das arcadas (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],offersSlicedFile:true}},
    {id:"proto_parc",type:"protocolo",groupLabel:"Protocolo",name:"Protocolo Edêntulo Parcial",desc:"Arcada parcial · Sem Só Planejamento",
     fullDesc:"Planejamento para Reabilitação de Arcada Parcialmente edêntula com implantes. Disponível apenas como Planejamento + Impressão.",
     exams:["Modelo digital das arcadas (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],
     includes:["A definir — itens inclusos serão atualizados em breve"],
     price:950,days:10,built:false,videoUrl:null,
     usesOdontogram:false,usesArch:true,archAffectsPrice:true,usesBrand:true,usesKit:true,offersUpsell:true,offersSlicedFile:false,
     planOnly:null},
    // ── Stackable Guide ──────────────────────────────────────────────────────
    {id:"stackable",type:"protocolo",groupLabel:"Protocolo",name:"Stackable Guide / Guias Empilháveis",desc:"Protocolo Especial · Por Arcada",
     fullDesc:"Guia Cirúrgico Empilhável para Casos Protocolares Complexos. Sem opção de Só Planejamento. Seleção por arcada.",
     exams:["Modelo digital das arcadas (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM)","Marca e modelo do implante + kit cirúrgico a ser utilizado"],
     includes:["A definir — itens inclusos serão atualizados em breve"],
     price:1300,days:12,built:false,videoUrl:null,
     usesOdontogram:false,usesArch:true,archAffectsPrice:true,usesBrand:true,usesKit:true,offersUpsell:false,offersSlicedFile:false,
     planOnly:null},
   ]},
  {id:"estetica",name:"Estética Dental",color:"#EA580C",icon:"ti-sparkles",desc:"Planejamento digital do sorriso",
   services:[
     {id:"dsd2d",name:"Simulação 2D",desc:"Apresentação motivacional",fullDesc:"Apresentação visual do novo sorriso a partir de fotografias clínicas.",exams:["Protocolo fotográfico (JPEG)"],price:250,days:5,built:false,videoUrl:null,planOnly:{name:"Simulação 2D — Arquivo Digital",desc:"Arquivo de apresentação · sem impressão",fullDesc:"Arquivo digital da simulação do sorriso 2D para uso em apresentações. Sem impressão ou mockup físico.",price:180,days:3,exams:["Protocolo fotográfico (JPEG)"]}},
     {id:"dsd3d",name:"DSD 3D — até 6 dentes",desc:"Enceramento + mockup",fullDesc:"Enceramento diagnóstico digital 3D com até 6 dentes anteriores.",exams:["Protocolo fotográfico (JPEG)","STL dos modelos"],price:466.27,days:7,built:false,videoUrl:null},
   ]},
  {id:"reab",name:"Reabilitação Oral",color:"#16A34A",icon:"ti-dental",desc:"Planejamento funcional 3D",
   services:[
     {id:"func3d",name:"Planejamento Funcional 3D",desc:"2 arcadas · articulador virtual",fullDesc:"Enceramento diagnóstico com análise oclusal e articulador virtual, até 28 dentes.",exams:["Protocolo fotográfico (JPEG)","STL dos modelos com registro em MIH e/ou RC"],price:1321.50,days:10,built:false,videoUrl:null,planOnly:{name:"Enceramento Digital Funcional 3D",desc:"2 arcadas · arquivo STL do enceramento",fullDesc:"Enceramento diagnóstico digital com articulador virtual. Entrega do arquivo STL do enceramento para impressão pelo cliente.",price:900,days:7,exams:["Protocolo fotográfico (JPEG)","STL dos modelos com registro em MIH e/ou RC"]}},
   ]},
  {id:"dtm",name:"DTM",color:"#CA8A04",icon:"ti-shield",desc:"Placa oclusal digital",
   services:[
     {id:"placa",name:"Placa Oclusal Impressa",desc:"Resina rígida biocompatível",fullDesc:"Placa rígida planejada em articulador virtual com contatos oclusais uniformes.",exams:["STL dos modelos com registro em RC (JIG)"],price:360.37,days:7,built:false,videoUrl:null,planOnly:{name:"Projeto Placa Oclusal Digital",desc:"Arquivo STL para impressão própria",fullDesc:"Projeto digital da placa oclusal em articulador virtual. Entrega do arquivo STL para impressão pelo cliente.",price:200,days:5,exams:["STL dos modelos com registro em RC (JIG)"]}},
   ]},
  {id:"perio",name:"Periodontia",color:C.textSec,icon:"ti-plant",desc:"Perioguide",
   services:[
     {id:"perioguide",name:"Perioguide",desc:"Guia + planejamento periodontal",fullDesc:"Guia cirúrgico periodontal com definição milimétrica do nível de gengivectomia por dente.",exams:["Protocolo fotográfico (JPEG)","STL ou PLY dos modelos","Tomografia computadorizada da arcada (arquivo DICOM) da arcada de interesse (com afastador labial)"],price:650.88,days:7,built:false,videoUrl:null,planOnly:{name:"Projeto Perioguide Digital",desc:"Arquivo STL do guia periodontal",fullDesc:"Planejamento digital do guia periodontal com entrega do arquivo STL para impressão pelo cliente.",price:400,days:5,exams:["Protocolo fotográfico (JPEG)","STL ou PLY dos modelos","Tomografia computadorizada da arcada (arquivo DICOM) da arcada de interesse (com afastador labial)"]}},
   ]},
  {id:"endo",name:"Endodontia",color:"#2563EB",icon:"ti-microscope",desc:"Guia de acesso endodôntico",
   services:[
     {id:"endo_uni",name:"Endo Access Unirradicular",desc:"Canais calcificados",fullDesc:"Guia de acesso endodôntico para dentes unirradiculares com canais calcificados.",exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM) da arcada de interesse","Kit Endo Access DSP"],price:599.57,days:7,built:false,videoUrl:null,planOnly:{name:"Projeto Endo Access Unirradicular Digital",desc:"Arquivo STL do guia endodôntico",fullDesc:"Planejamento digital do guia de acesso endodôntico. Entrega do arquivo STL para impressão pelo cliente.",price:350,days:5,exams:["Modelo digital da arcada (arquivo STL)","Tomografia computadorizada da arcada (arquivo DICOM) da arcada de interesse","Kit Endo Access DSP"]}},
   ]},
  {id:"imp3d",name:"Impressão 3D",color:"#0D9488",icon:"ti-3d-cube-sphere",desc:"Modelos e biomodelos",
   services:[
     {id:"mod_normal",name:"Modelo base normal",desc:"Adulto ou infantil",fullDesc:"Modelo de estudo para arcada adulto ou infantil, simples ou articulado.",exams:["STL dos modelos"],price:80,days:3,built:false,videoUrl:null},
   ]},
  {id:"consult",name:"Consultoria",color:"#DC2626",icon:"ti-bulb",desc:"Suporte especializado",
   services:[
     {id:"consult_online",name:"Consultoria Online",desc:"Por hora",fullDesc:"Suporte especializado por videoconferência para discussão de casos clínicos.",exams:["Imagens e exames do caso"],price:200,days:3,built:false,videoUrl:null},
   ]},
];

// ── Hook: carrega catálogo do Supabase com fallback para CATALOG estático ─────
function useCatalog() {
  const [catalog, setCatalog] = useState(CATALOG);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchCatalog()
      .then((data) => {
        if (data && data.length > 0) {
          // Mescla dados dinâmicos com campos do CATALOG estático que não vêm do Supabase
          // (priceByQty, IMPLANT_TABLE, etc. permanecem no Wizard)
          const merged = data.map((dynSpec) => {
            const staticSpec = CATALOG.find((s) => s.id === dynSpec.id);
            if (!staticSpec) return dynSpec;
            return {
              ...staticSpec,
              ...dynSpec,
              services: dynSpec.services.map((dynSvc) => {
                const staticSvc = staticSpec.services.find((s) => s.type === dynSvc.type || s.id === dynSvc.id);
                if (!staticSvc) return dynSvc;
                return {
                  ...staticSvc,
                  // Campos que vêm do Supabase sobrescrevem o estático:
                  name:     dynSvc.name     || staticSvc.name,
                  desc:     dynSvc.desc     || staticSvc.desc,
                  fullDesc: dynSvc.fullDesc || staticSvc.fullDesc,
                  exams:    dynSvc.exams?.length ? dynSvc.exams    : staticSvc.exams,
                  includes: dynSvc.includes?.length ? dynSvc.includes : staticSvc.includes,
                  imagens:  dynSvc.imagens?.length  ? dynSvc.imagens  : (staticSvc.imagens || []),
                  days:     dynSvc.days     || staticSvc.days,
                  // Preço vem do Supabase apenas se autenticado (RLS); caso null usa estático
                  price:    dynSvc.price    ?? staticSvc.price,
                  planOnly: dynSvc.planOnly
                    ? {
                        ...staticSvc.planOnly,
                        ...dynSvc.planOnly,
                        price: dynSvc.planOnly.price ?? staticSvc.planOnly?.price,
                        days:  dynSvc.planOnly.days  ?? staticSvc.planOnly?.days,
                      }
                    : staticSvc.planOnly,
                };
              }),
            };
          });
          setCatalog(merged);
        }
      })
      .catch(() => { /* fallback silencioso para CATALOG estático */ })
      .finally(() => setLoading(false));
  }, []);

  return { catalog, loading };
}

// ── Specialty image map (Next.js public folder) ──
const SPEC_IMGS={
  implanto:"/especialidades/implantodontia.jpg",
  estetica:"/especialidades/estetica.jpg",
  reab:"/especialidades/reabilitacao.jpg",
  dtm:"/especialidades/dtm.jpg",
  perio:"/especialidades/periodontia.jpg",
  endo:"/especialidades/endodontia.jpg",
  imp3d:"/especialidades/impressao3d.jpg",
  consult:"/especialidades/consultoria.jpg",
};


const SPEC_FILES={
  implanto:["Modelo digital da arcada (arquivo STL) (escaneamento intraoral)","DICOM da arcada (tomografia)","Dados do kit cirúrgico"],
  estetica:["Protocolo fotográfico (JPEG)","STL dos modelos (escaneamento)"],
  reab:["Protocolo fotográfico (JPEG)","Modelos digitais (STL) com registro em MIH/RC"],
  dtm:["Modelos digitais (STL) com registro em RC (JIG)"],
  perio:["Protocolo fotográfico (JPEG)","STL ou PLY dos modelos","DICOM com afastador labial"],
  endo:["STL do modelo digital","DICOM da arcada","Dados do kit a utilizar"],
  imp3d:["STL dos modelos ou arquivo 3D para impressão"],
  consult:["Protocolo fotográfico (JPEG)","STL dos modelos (opcional)"],
  ortho:["STL dos modelos (escaneamento)"],
};
// ── Specialty icon map (Lucide) ──
function SpecIcon({id,size=16,color="currentColor"}){
  const icons={
    implanto:<Stethoscope size={size} color={color}/>,
    estetica:<Sparkles size={size} color={color}/>,
    reab:<Activity size={size} color={color}/>,
    dtm:<Bone size={size} color={color}/>,
    perio:<Leaf size={size} color={color}/>,
    endo:<Microscope size={size} color={color}/>,
    imp3d:<Printer size={size} color={color}/>,
    consult:<Lightbulb size={size} color={color}/>,
    ortho:<Ruler size={size} color={color}/>,
  };
  return icons[id]||<Stethoscope size={size} color={color}/>;
}

const IMPLANT_TABLE={
  NEODENT:[
    {model:"HELIX GM Ø 3.5 / Ø 3.75",kit:"EASYGUIDE ESTREITO"},
    {model:"HELIX GM Ø 4.0 / Ø 4.3 / Ø 5.0",kit:"EASYGUIDE REGULAR"},
    {model:"HELIX GM NARROW Ø 2.9",kit:"EASYGUIDE NARROW"},
    {model:"HELIX GM Ø 3.5 – Ø 6.0 (séries GM)",kit:"GRAND MORSE NGS"},
    {model:"DRIVE GM Ø 3.5 / Ø 4.3 / Ø 5.0",kit:"GRAND MORSE NGS"},
    {model:"TITAMAX CM Ø 3.5 – Ø 4.3",kit:"CONE MORSE NGS"},
    {model:"TITAMAX CM EX Ø 3.5 – Ø 4.3",kit:"CONE MORSE NGS"},
    {model:"ALVIM CM Ø 3.5 – Ø 4.3",kit:"CONE MORSE NGS"},
    {model:"DRIVE CM Ø 3.5 – Ø 4.3",kit:"CONE MORSE NGS"},
    {model:"FACILITY Ø 2.9",kit:"CONE MORSE NGS"},
  ],
  SIN:[
    {model:"STRONG SW CM Ø 3.5 / Ø 3.8 / Ø 4.5 / Ø 5.0",kit:"STRONG SW"},
    {model:"STRONG SW HE Ø 4.1 / Ø 4.5 / Ø 5.0",kit:"STRONG SW"},
    {model:"EPIKUT CM Ø 3.5 / Ø 3.8 / Ø 4.5",kit:"EPIKUT"},
    {model:"UNITITE PRIME CM Ø 3.5 / Ø 4.3 / Ø 5.0",kit:"UNITITE"},
    {model:"UNITITE COMPACT CM Ø 4.0 / Ø 5.0 / Ø 6.0",kit:"UNITITE"},
  ],
  PLENUM:[
    {model:"SLIM (SL) Ø 3.0",kit:"PLENUM GUIDE"},
    {model:"REGULAR (RE) Ø 3.5 – Ø 6.0",kit:"PLENUM GUIDE"},
  ],
  STRAUMANN:[
    {model:"BLC / BLX",kit:"STRAUMANN GUIDED SURGERY"},
    {model:"TLC / TLX",kit:"STRAUMANN GUIDED SURGERY"},
    {model:"BLC / BLX",kit:"STRAUMANN iExcel"},
    {model:"TLC / TLX",kit:"STRAUMANN iExcel"},
  ],
  "TITANIUM FIX":[{model:"B-fix Profile Ø 3.0 / Ø 3.5 / Ø 4.0",kit:"GUIDE FIX"}],
  INTRAOSS:[
    {model:"MAX CM ADVANCED Ø 3.5 / Ø 4.3",kit:"INTRAGUIDE"},
    {model:"GRAND OSS ADVANCED Ø 3.5 / Ø 4.3",kit:"INTRAGUIDE"},
  ],
  KOPP:[
    {model:"Cone Morse Screw Platinum Ø 3.5",kit:"SMART GUIDE"},
    {model:"Cone Morse Screw Slim Ø 3.0",kit:"SMART GUIDE"},
  ],
  IMPLACIL:[
    {model:"MAESTRO CM AR Ø 3.5 / Ø 4.0",kit:"IMPLAGUIDE"},
    {model:"DUE CONE CM AR Ø 3.5 / Ø 4.0",kit:"IMPLAGUIDE"},
  ],
};
const BRANDS=Object.keys(IMPLANT_TABLE);
const P={preplan:150,unit:388.98,strauAdd:110,provCaptura:100,provAdesiva:120,cicatriz:80,slicedFile:50,dsd3dProto:700}; // dsd3dProto = placeholder
// ── URL do manual de orientações sobre exames (substituir pelo link real) ──
const EXAMS_MANUAL_URL="https://drive.google.com/placeholder-manual-exames";
// ── Urgency tiers — percentage fee over service value + delivery time factor ──
// Valores de referência (ajustar conforme necessidade): Expresso +20% / Urgente +40%
const URGENCY_TIERS=[
  {id:"normal",label:"Prazo normal",feePercent:0,planFactor:1},
  {id:"expresso",label:"Expresso",feePercent:0.20,planFactor:0.5},
  {id:"urgente",label:"Urgente",feePercent:0.40,planFactor:0.25},
];
// Prazo de impressão+entrega: fixo, NÃO afetado pela urgência
const PRINT_DAYS=2; // dias úteis após aprovação do cliente
const urgencyPlanDays=(baseDays,tier)=>Math.max(1,Math.round(baseDays*tier.planFactor));
const SUP=[[18,17,16,15,14,13,12,11],[21,22,23,24,25,26,27,28]];
const SUP_ALL=[...SUP[0],...SUP[1]];
const arcade=n=>SUP_ALL.includes(n)?"sup":"inf";
const WIZARD_STEPS_BASE=    ["Pré-planejamento","Dentes",     "Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Prazo","Informações do Caso"];
const WIZARD_STEPS_PLAN=    ["Pré-planejamento","Dentes",     "Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Arquivo p/ Impressão","Prazo","Informações do Caso"];
const WIZARD_STEPS_PARC=    ["Pré-planejamento","Dentes","Serviço Complementar","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Prazo","Informações do Caso"];
const WIZARD_STEPS_PARC_PL= ["Pré-planejamento","Dentes","Serviço Complementar","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Arquivo p/ Impressão","Prazo","Informações do Caso"];
const WIZARD_STEPS_PROTO=       ["Pré-planejamento","Arcada","Tipo de Caso","Serviço Complementar","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Prazo","Informações do Caso"];
const WIZARD_STEPS_PROTO_PL=    ["Pré-planejamento","Arcada","Tipo de Caso","Serviço Complementar","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Serviços Adicionais","Arquivo p/ Impressão","Prazo","Informações do Caso"];
const WIZARD_STEPS_STACKABLE=   ["Pré-planejamento","Arcada","Tipo de Caso","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Prazo","Informações do Caso"];
const WIZARD_STEPS_STACKABLE_PL=["Pré-planejamento","Arcada","Tipo de Caso","Marca do Implante","Kit Cirúrgico","Modelo do Implante","Arquivo p/ Impressão","Prazo","Informações do Caso"];

const PREPLAN_RULES=`Consiste em realizar uma análise prévia dos exames para identificar a viabilidade de execução do serviço. Prazo: 7 dias corridos a contar do envio do Pré-planejamento pela D-CAD.

• Positiva: o serviço segue para planejamento e o valor do pré-planejamento será abatido do(s) serviço(s) principal(is).

• Negativa: será cobrado somente o pré-planejamento e o caso será arquivado.

• Sem retorno: será cobrado somente o pré-planejamento. Em caso de resposta positiva após 7 dias, o serviço será cobrado em valor total sem abatimento.

Serviço opcional.`;

const SPECIALTIES_LIST=["Clínico Geral","Implantodontia","Dentística Restauradora","Endodontia","Periodontia","Ortodontia","Prótese Dentária","Cirurgia e Traumatologia","Odontopediatria","Radiologia","Outro"];

export default function App() {
  const [screen,setScreen]=useState("auth");
  const [screenVisible,setScreenVisible]=useState(true);
  const [pendingScreen,setPendingScreen]=useState(null);
  const [authTab,setAuthTab]=useState("login");
  const [forgotPw,setForgotPw]=useState(false);
  const [forgotEmail,setForgotEmail]=useState("");
  const [forgotSent,setForgotSent]=useState(false);
  const [dentist,setDentist]=useState(null);
  const [profileComplete,setProfileComplete]=useState(false);
  const [profile,setProfile]=useState({docType:"cpf",cpf:"",cnpj:"",razaoSocial:"",rua:"",numero:"",bairro:"",complemento:"",cidade:"",estado:"",cep:"",entregaIgual:true,entRua:"",entNumero:"",entBairro:"",entComplemento:"",entCidade:"",entEstado:"",entCep:""});
  // Impressoras 3D cadastradas pelo cliente — múltiplas, relacionadas por tipo de serviço
  const [printers,setPrinters]=useState([]); // [{id,apelido,marca,modelo,resina_marca,resina_modelo,camada,exposicao,serviceTypes[]}]
  const [printerModal,setPrinterModal]=useState(null); // null | 'new' | {printer object being edited}
  const [printerForm,setPrinterForm]=useState({apelido:"",marca:"",modelo:"",resina_marca:"",resina_modelo:"",camada:"",exposicao:"",serviceTypes:[]});
  const [loginForm,setLoginForm]=useState({email:"",senha:""});
  const [regForm,setRegForm]=useState({tipo:"dentista",nome:"",cro:"",especialidade:"",clinica:"",whatsapp:"",email:"",senha:"",confirmaSenha:"",docType:"cnpj",cpf:"",cnpj:"",razaoSocial:"",rua:"",numero:"",bairro:"",complemento:"",cidade:"",estado:"",cep:"",entregaIgual:true,entRua:"",entNumero:"",entBairro:"",entComplemento:"",entCidade:"",entEstado:"",entCep:""});
  const [patient,setPatient]=useState(null);
  const [patForm,setPatForm]=useState({nome:"",nasc:""});
  const [patSearch,setPatSearch]=useState("");
  const [cepLoading,setCepLoading]=useState(null);
  const [isDesktop,setIsDesktop]=useState(false);
  const [isTablet,setIsTablet]=useState(false); // 640-1023px
  const [savedPatients,setSavedPatients]=useState([
    {id:"p1",nome:"Maria das Graças Almeida",nasc:"14/03/1984"},
    {id:"p2",nome:"José Carlos Alves",nasc:"02/07/1968"},
    {id:"p3",nome:"Ana Paula Costa",nasc:"21/11/1991"},
    {id:"p4",nome:"Roberto Ferreira Silva",nasc:"09/05/1965"},
  ]);
  const [specialty,setSpecialty]=useState(null);
  const [serviceType,setServiceType]=useState(null);  // 'print' | 'planOnly'
  const [selectedGroup,setSelectedGroup]=useState(null); // grupo selecionado no protocolo
  const [showDisclaimer,setShowDisclaimer]=useState(false);
  const [service,setService]=useState(null);
  const [showRules,setShowRules]=useState(false);
  const [showPreplanConfirm,setShowPreplanConfirm]=useState(false);
  const [showProtoWarning,setShowProtoWarning]=useState(false);
  const [videoModal,setVideoModal]=useState(null);
  const [toast,setToast]=useState("");
  const [A,setA]=useState({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});
  const [freight,setFreight]=useState({method:null,value:0,prazo:"",loading:false,simulated:false});
  const [freightOptions,setFreightOptions]=useState(null);
  const [cepDestino,setCepDestino]=useState("");
  const [services,setServices]=useState([]);
  const [couponDiscount,setCouponDiscount]=useState(0); // absolute value off
  const [pendingCarts,setPendingCarts]=useState([]);
  const [pendingPayments,setPendingPayments]=useState([]); // orders where checkout was opened but payment not yet confirmed
  const [undoService,setUndoService]=useState(null);
  const [confirmDeleteId,setConfirmDeleteId]=useState(null);
  const [showStackableInfo,setShowStackableInfo]=useState(false);
  const [loadingBtn,setLoadingBtn]=useState(false);
  // Tutorial de onboarding
  const [showTutorial,setShowTutorial]=useState(false);
  const [tutorialStep,setTutorialStep]=useState(0);
  const [tutorialNeverShow,setTutorialNeverShow]=useState(()=>{try{return localStorage.getItem("dcad_tutorial_done")==="1";}catch{return false;}});
  const [tutorialScrollStep,setTutorialScrollStep]=useState(0);
  const tutorialShownRef=React.useRef(false); // prevents loop: shown only once per session
  function setTutorialNeverShowAndSave(val){setTutorialNeverShow(val);try{if(val)localStorage.setItem("dcad_tutorial_done","1");else localStorage.removeItem("dcad_tutorial_done");}catch{}}
  const TUTORIAL_VIDEO_URL=""; // Cole aqui a URL do vídeo (YouTube embed ou MP4)
  // Serviços frequentes (localStorage)
  const [frequentServices,setFrequentServices]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("dcad_freq")||"[]");}catch{return[];}
  });
  // Carrossel de novidades — sempre visível
  const [carouselIdx,setCarouselIdx]=useState(0);
  const [carouselPaused,setCarouselPaused]=useState(false);
  const [editingId,setEditingId]=useState(null); // id of service being edited
  const [editingOriginal,setEditingOriginal]=useState(null); // original service snapshot for cancel
  const [showPass,setShowPass]=useState(false);
  const [lastConfig,setLastConfig]=useState({}); // {[specialtyId]: {brand,kit,model}} // {service, timer} // carts awaiting payment
  const [mockOrders]=useState([
    {id:"001",patient:"Maria das Graças",service:"Cirurgia Guiada Unitária",specialty:"Implantodontia",total:388.98,status:"planning",date:"20/06/2026",filesSubmitted:false},
    {id:"002",patient:"José Alves",service:"DSD 3D — até 6 dentes",specialty:"Estética Dental",total:466.27,status:"shipped",date:"18/06/2026",filesSubmitted:true},
    {id:"003",patient:"Ana Costa",service:"Placa Oclusal Impressa",specialty:"DTM",total:360.37,status:"pending_payment",date:"24/06/2026",filesSubmitted:false},
  ]);
  const set=(k,v)=>setA(a=>({...a,[k]:v}));

  // ── Catálogo dinâmico (Supabase) com fallback para CATALOG estático ─────
  const { catalog, loading: catalogLoading } = useCatalog();

  // Mostrar tutorial no primeiro login
  useEffect(()=>{
    if(screen==="dashboard"&&dentist){
      try{
        if(!tutorialShownRef.current){
          const seen=localStorage.getItem("dcad_tutorial_done")==="1";
          if(!seen){tutorialShownRef.current=true;setTimeout(()=>{setScreen("tutorial");},400);}
          else{tutorialShownRef.current=true;}
        }
      }catch{}
    }
  },[screen,dentist]);

  // Carrossel — avançar automaticamente a cada 4s
  const ANNOUNCEMENTS=[
    {
      id:"implanto-v1",
      title:"Implantodontia v1.0 — Completo!",
      body:"Cirurgia Guiada Unitária, Parcial, Protocolos Edêntulos e Stackable Guide disponíveis agora.",
      badge:"Novo",
      badgeColor:C.red,
      bg:"linear-gradient(135deg, rgba(229,34,41,0.15) 0%, rgba(229,34,41,0.08) 100%)",
      borderColor:"rgba(229,34,41,0.3)",
      link:"",
      linkLabel:"",
      imageUrl:"",
    },
    {
      id:"prazo-entrega",
      title:"Prazo reduzido para guias cirúrgicos",
      body:"Agora entregamos guias cirúrgicos em até 5 dias úteis para todo o Brasil. Peça com urgência em até 48h.",
      badge:"Info",
      badgeColor:C.red,
      bg:"linear-gradient(135deg, rgba(229,34,41,0.12) 0%, rgba(13,148,136,0.06) 100%)",
      borderColor:"rgba(229,34,41,0.22)",
      link:"https://wa.me/5598985425982",
      linkLabel:"Falar com a equipe →",
      imageUrl:"",
    },
  ];
  useEffect(()=>{
    if(carouselPaused||ANNOUNCEMENTS.length<=1) return;
    const t=setInterval(()=>setCarouselIdx(i=>(i+1)%ANNOUNCEMENTS.length),4000);
    return()=>clearInterval(t);
  },[carouselPaused]);

  // Registrar serviço frequente ao adicionar ao carrinho
  function trackFrequentService(sv){
    setFrequentServices(prev=>{
      const updated=[...prev];
      const idx=updated.findIndex(f=>f.id===sv.id);
      if(idx>=0) updated[idx]={...updated[idx],count:(updated[idx].count||0)+1};
      else updated.push({id:sv.id,name:sv.name,specialty:sv.specialty,price:sv.price,specialtyColor:specialty?.color,count:1});
      const sorted=updated.sort((a,b)=>(b.count||0)-(a.count||0)).slice(0,5);
      try{localStorage.setItem("dcad_freq",JSON.stringify(sorted));}catch{}
      return sorted;
    });
  }

  function toggleTooth(n){
    setA(a=>{
      if(a.teeth.includes(n)) return {...a,teeth:a.teeth.filter(t=>t!==n)};
      const arc=arcade(n);
      const teethInArc=a.teeth.filter(t=>arcade(t)===arc).length;
      const maxPerArc=service?.priceByQty?8:(service?.exactQty||service?.maxTeeth||1);
      if(teethInArc>=maxPerArc) return a;
      return {...a,teeth:[...a.teeth,n]};
    });
  }
  const kitsFor=b=>b?[...new Set((IMPLANT_TABLE[b]||[]).map(r=>r.kit))]:[];
  const modelsFor=(b,k)=>b&&k?(IMPLANT_TABLE[b]||[]).filter(r=>r.kit===k).map(r=>r.model).filter(Boolean):[];

  // ── Discount: must be defined BEFORE calcTotal ─────────────────────────
  const accountType=dentist?.accountType||"dentista";
  const accountStatus=dentist?.accountStatus||"active";
  const discount=accountStatus==="active"&&(accountType==="clinica"||accountType==="cursos")?0.15:0;
  const applyDiscount=v=>parseFloat((v*(1-discount)).toFixed(2));

  function calcTotal(sv){
    const nTeeth=sv.teeth?.length||0;
    const supCount=(sv.teeth||[]).filter(t=>SUP_ALL.includes(t)).length;
    const infCount=(sv.teeth||[]).filter(t=>!SUP_ALL.includes(t)).length;
    const archCount=(sv.arch?.sup?1:0)+(sv.arch?.inf?1:0)||1;

    // ── Regras de precificação do catálogo ─────────────────────────────────
    const pr=service?.pricing||{};
    const baseMode=pr.baseMode||(service?.priceByQty?'per_qty':service?.usesArch&&service?.archAffectsPrice?'per_arch':'fixed');
    const pbyq=baseMode==='per_qty'?(pr.priceByQty||service?.priceByQty||(serviceType==="planOnly"&&service?.planOnly?.priceByQty)||null):null;

    let t=0;
    if(pbyq){
      if(supCount>=2)t+=pbyq[Math.min(supCount,8)]||0;
      if(infCount>=2)t+=pbyq[Math.min(infCount,8)]||0;
      if(t===0)t=pbyq[2]||service?.price||0;
    } else if(baseMode==='per_arch'){
      t=(service?.price||0)*archCount;
    } else {
      t=service?.price||P.unit;
      if(supCount>0&&infCount>0)t*=2;
    }

    // ── Taxas por marca ────────────────────────────────────────────────────
    const brandFees=pr.brandFees||service?.brandFees||{STRAUMANN:P.strauAdd};
    const guias=pbyq?((supCount>=2?1:0)+(infCount>=2?1:0)||1):baseMode==='per_arch'?archCount:(supCount>0&&infCount>0?2:1);
    if(sv.brand&&brandFees[sv.brand])t+=brandFees[sv.brand]*guias;

    // ── Adicionais configurados no catálogo ────────────────────────────────
    const addons=pr.addons||[];
    addons.forEach(addon=>{
      if(!addon.key||!addon.value)return;
      const comp=sv.comps?.[addon.key];
      if(Array.isArray(comp)&&comp.length>0){
        t+=addon.value*(addon.perUnit?comp.length:1);
      } else if(typeof comp==='number'&&comp>0){
        t+=addon.value*(addon.perUnit?comp:1);
      } else if(comp===true){
        t+=addon.value;
      }
    });

    // ── Fallback para adicionais hardcoded (legado) ────────────────────────
    if(!addons.length){
      if(sv.comps?.captura?.length)t+=P.provCaptura*sv.comps.captura.length;
      if(sv.comps?.adesiva?.length)t+=P.provAdesiva*sv.comps.adesiva.length;
      if(sv.comps?.cicatriz?.length)t+=P.cicatriz*sv.comps.cicatriz.length;
      if(sv.comps?.proto_captura)t+=350*sv.comps.proto_captura;
      if(sv.dsd3dAddon)t+=P.dsd3dProto;
    }

    // ── Urgência ───────────────────────────────────────────────────────────
    const urgRules=pr.urgency||{};
    const uTier=URGENCY_TIERS.find(u=>u.id===sv.urgency)||URGENCY_TIERS[0];
    const urgFee=(urgRules[sv.urgency]!=null?(urgRules[sv.urgency]/100):uTier.feePercent)||0;
    if(urgFee>0)t+=t*urgFee;

    // ── Arquivo p/ impressão ───────────────────────────────────────────────
    if(sv.slicedFile&&serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile){
      const slicedStep=service?.steps?.find(s=>s.type==='file'||s.k==='sliced');
      t+=(slicedStep?.data?.price||P.slicedFile);
    }

    return parseFloat((t*(1-discount)).toFixed(2));
  }
  /* ── Correios freight calculation ──────────────────────────────────────
     * In production: call Correios REST API (OAuth2 token required)
     * POST https://api.correios.com.br/preco/v1/nacional/{contrato}
     * Headers: Authorization: Bearer {token}
     * Body: { cepOrigem, cepDestino, peso, comprimento, altura, largura }
     * ─────────────────────────────────────────────────────────────────── */
  async function calcularFrete(cepInput) {
    setFreight(f=>({...f,loading:true,method:null,value:0}));
    setFreightOptions(null);
    await new Promise(r=>setTimeout(r,1200)); // simulate API latency
    // TODO: replace with real Correios API call
    const base=Math.random()*8+14; // PAC: R$14-22
    const options={
      pac:{prazo:"5 a 8 dias úteis",valor:parseFloat(base.toFixed(2)),codigo:"03298"},
      sedex:{prazo:"1 a 2 dias úteis",valor:parseFloat((base*2.1).toFixed(2)),codigo:"03220"},
    };
    setFreightOptions(options);
    setFreight(f=>({...f,loading:false,simulated:true}));
  }

  async function buscarCEP(cep, onSuccess, fieldKey){
    const nums = cep.replace(/\D/g,"");
    if(nums.length!==8){setToast("CEP inválido. Digite 8 dígitos.");return;}
    setCepLoading(fieldKey);
    try{
      const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
      const data = await res.json();
      if(data.erro){setToast("CEP não encontrado. Verifique e tente novamente.");}
      else{onSuccess(data);setToast("");}
    }catch(e){
      setToast("Erro ao buscar CEP. Verifique sua conexão.");
    }finally{
      setCepLoading(null);
    }
  }

  function finalize(){
    const freightVal=serviceType==="print"?freight.value:0;
    const svcName=service?.name||(specialty?.name+" — Serviço");
    const svc={id:editingId||Date.now(),specialty:specialty?.name,name:svcName+(A.teeth.length>1?" (2 dentes)":""),teeth:[...A.teeth],arch:{...A.arch},implantQty:A.implantQty,dsd3dAddon:A.dsd3dAddon,brand:A.brand,kit:A.kit,model:A.model||(A.modelText||"Não especificado"),comps:{...A.comps},observacoes:A.observacoes,urgency:A.urgency,slicedFile:A.slicedFile,printerId:A.printerId||null,serviceType,freight:freightVal>0?{...freight}:null,total:calcTotal(A)+freightVal};
    setServices(s=>[...s,svc]);
    if(service){trackFrequentService({...service,specialty:specialty?.name,specialtyColor:specialty?.color});}
    setEditingId(null);
    setEditingOriginal(null);
    if(specialty?.id && A.brand){
      setLastConfig(prev=>({...prev,[specialty.id]:{brand:A.brand,kit:A.kit,model:A.model,modelText:A.modelText}}));
    }
    setScreen("resumo");
  }
  function registerPendingPayment({orderId,checkoutUrl,amount,servicesList}){
    const list=servicesList&&servicesList.length?servicesList:services;
    setPendingPayments(pp=>[{id:orderId,checkoutUrl,patientNome:patient?.nome||"Não informado",servicesSummary:list.map(s=>s.name).join(", ")||"Pré-planejamento",total:amount,date:new Date().toLocaleDateString("pt-BR")},...pp]);
    setServices([]);
  }
  function addNew(){
    setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});
    setFreight({method:null,value:0,prazo:"",loading:false,simulated:false});
    setFreightOptions(null);
    setCepDestino("");
    setSpecialty(null);setService(null);setScreen("dashboard");
  }
  function resetAll(){
    setDentist(null);setPatient(null);setServices([]);addNew();setScreen("auth");
  }

  const isProto=!!service?.usesArch;
  const isStackable=service?.id==="stackable";
  const isParcial=service?.id==="cgparc";
  const hasPlanSliced=serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile;
  const WIZARD_STEPS=(()=>{
    let base;
    if(isStackable)    base=hasPlanSliced?WIZARD_STEPS_STACKABLE_PL:WIZARD_STEPS_STACKABLE;
    else if(isProto)   base=hasPlanSliced?WIZARD_STEPS_PROTO_PL:WIZARD_STEPS_PROTO;
    else if(isParcial){
      const anteriorSup=[11,12,13,21,22,23];
      const parcialHasCompl=A.teeth.some(t=>anteriorSup.includes(t));
      base=parcialHasCompl?(hasPlanSliced?WIZARD_STEPS_PARC_PL:WIZARD_STEPS_PARC):(hasPlanSliced?WIZARD_STEPS_PLAN:WIZARD_STEPS_BASE);
    }
    else               base=hasPlanSliced?WIZARD_STEPS_PLAN:WIZARD_STEPS_BASE;
    return serviceType==="print"?[...base,"Frete","Pagamento"]:[...base,"Pagamento"];
  })();
  const stepNum=(()=>{
    if(screen==="resumo") return WIZARD_STEPS.length-1;
    if(screen==="slicedFile") return WIZARD_STEPS.indexOf("Arquivo p/ Impressão");
    if(screen==="implantQty") return WIZARD_STEPS.indexOf("Tipo de Caso");
    if(screen==="protoCompl") return WIZARD_STEPS.indexOf("Serviço Complementar");
    if(typeof screen==="number"){
      const slicedOffset=hasPlanSliced?1:0;
      if(screen<=1) return screen;
      if(isStackable){
        // Array: Pré-plan(0) Arcada(1) TipoCaso(2) Marca(3) Kit(4) Modelo(5) Prazo(6) Info(7) [Arquivo(7)] Frete(8) Pagamento
        const prazIdx=WIZARD_STEPS.indexOf("Prazo");
        if(screen===5) return prazIdx; // tela informativa Adicionais → badge Prazo
        if(screen<=4) return screen+1; // Marca=3, Kit=4, Modelo=5 → +1 por TipoCaso
        if(screen===6) return prazIdx; // Prazo
        if(screen===7) return prazIdx+1+slicedOffset; // Informações
        if(screen===8) return prazIdx+2+slicedOffset; // Frete
        return WIZARD_STEPS.length-1; // Pagamento
      } else if(isProto){
        if(screen<=5) return screen+2;
        return screen+2+slicedOffset;
      } else if(isParcial){
        // Parcial: ServCompl só inserido se dentes anteriores superiores foram selecionados
        const anteriorSup=[11,12,13,21,22,23];
        const parcialHasCompl=A.teeth.some(t=>anteriorSup.includes(t));
        const parcialOffset=parcialHasCompl?1:0;
        if(screen<=5) return screen+parcialOffset;
        return screen+parcialOffset+slicedOffset;
      } else {
        if(screen<=5) return screen;
        return screen+slicedOffset;
      }
    }
    return -1;
  })();  const doubleGuide=A.teeth.length===2;
  const totalAllBase=services.reduce((s,sv)=>s+sv.total,0);
  const totalAll=Math.max(0,parseFloat((totalAllBase-couponDiscount).toFixed(2)));
  const FRETE_GRATIS_MIN=1000;
  // Screen transition fade
  useEffect(()=>{
    if(pendingScreen===null) return;
    setScreenVisible(false);
    const t=setTimeout(()=>{
      setScreen(pendingScreen);
      setPendingScreen(null);
      setScreenVisible(true);
    },120);
    return ()=>clearTimeout(t);
  },[pendingScreen]);

  // Wrap setScreen for animation
  const goTo=(s)=>{
    if(s===screen){return;}
    // Skip animation for same-screen updates
    const noAnim=["auth","dashboard"].includes(s)||["auth","dashboard"].includes(screen);
    if(noAnim){setScreen(s);return;}
    setPendingScreen(s);
  };

  useEffect(()=>{
    const check=()=>{setIsDesktop(window.innerWidth>=1024);setIsTablet(window.innerWidth>=640&&window.innerWidth<1024);};
    check();
    window.addEventListener("resize",check);
    return ()=>window.removeEventListener("resize",check);
  },[]);
  const deliveryCity=(profile?.entregaIgual===false?profile.entCidade:profile?.cidade)||"";
  const cepNums=cepDestino.replace(/\D/g,"");
  const isSaoLuisByCEP=cepNums.length>=3&&/^650/.test(cepNums);
  const isSaoLuisByCity=/s[aã]o[\s-]*lu[ií]s/i.test(deliveryCity);
  const isSaoLuis=isSaoLuisByCEP||isSaoLuisByCity;
  const freteGratis=calcTotal(A)>=FRETE_GRATIS_MIN||isSaoLuis;

  const W={width:"100%",boxSizing:"border-box",padding:isDesktop?"28px 40px":"24px 16px"};

  return (
    <div style={{minHeight:"100vh",background:C.dark,fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:C.text,position:"relative"}}>

      {/* ── FLOATING SUBTOTAL BAR (mobile) ── */}
      {!isDesktop&&specialty&&service&&screen!=="resumo"&&screen!=="checkout"&&screen!=="auth"&&screen!=="dashboard"&&calcTotal(A)>0&&(
        <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(17,17,17,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:C.textSec}}>{service?.name}</span>
          <span style={{fontSize:15,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
        </div>
      )}

      {/* ── GLOBAL FOCUS RING ── */}
      <style>{`
*:focus-visible{outline:2px solid #E52229 !important;outline-offset:3px;border-radius:4px;}
button,a,[role="button"]{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
button:active{opacity:.82;transform:scale(.98);}
input,textarea,select{touch-action:manipulation;}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
@keyframes spin{to{transform:rotate(360deg);}}
    `}</style>

      {/* ── DISCLAIMER MODAL — standalone ── */}
      {showDisclaimer&&(
        <div onClick={()=>setShowDisclaimer(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(255,165,0,0.4)",borderRadius:12,padding:24,maxWidth:480,width:"100%"}}>
            <div style={{fontSize:26,marginBottom:12}}><AlertTriangle size={26} color={C.yellow}/></div>
            <div style={{fontSize:15,fontWeight:800,marginBottom:10}}>Atenção — Impressão pelo cliente</div>
            <div style={{fontSize:13,color:"#FCD34D",lineHeight:1.7,marginBottom:16}}>
              A D-CAD não se responsabiliza por falhas de impressão, erros de calibração ou quaisquer outros fatores relacionados ao processo de impressão 3D realizado pelo cliente.
            </div>
            <div style={{fontSize:12,color:C.textSec,lineHeight:1.6,marginBottom:20}}>
              Ao continuar, você confirma que está ciente desta condição e que a D-CAD entregará apenas os arquivos digitais do planejamento.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowDisclaimer(false)} style={{flex:1,padding:"11px 0",background:C.dark3,border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,cursor:"pointer"}}>
                Voltar
              </button>
              <button onClick={()=>{setShowDisclaimer(false);setServiceType("planOnly");setScreen("services");}} style={{flex:1,padding:"11px 0",background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,color:"#FCD34D",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Entendido — continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINTER MODAL ── */}
      {printerModal&&(
        <div onClick={()=>setPrinterModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:65,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(13,148,136,0.4)",borderRadius:12,padding:24,maxWidth:480,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:800}}>{printerModal==="new"?"Nova impressora":"Editar impressora"}</div>
              <button onClick={()=>setPrinterModal(null)} style={{background:"none",border:"none",color:C.textSec,cursor:"pointer"}}><XIcon size={18}/></button>
            </div>
            {/* Campos */}
            {[["apelido","Apelido / Nome interno","Ex: Impressora guias"],["marca","Marca da impressora *","Ex: Creality, Phrozen, Anycubic"],["modelo","Modelo *","Ex: Halot One, Sonic Mini 8K"],["resina_marca","Marca da resina *","Ex: Saremco, Keystone, SprintRay"],["resina_modelo","Modelo da resina *","Ex: Guide Clear, Model Resin Pro"]].map(([k,label,ph])=>(
              <div key={k} style={{marginBottom:12}}>
                <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>{label.toUpperCase()}</label>
                <input value={printerForm[k]} onChange={e=>setPrinterForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                  style={{width:"100%",background:C.dark3,border:`1px solid ${printerForm[k]?"rgba(13,148,136,0.4)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ALTURA DE CAMADA (mm) *</label>
                <input value={printerForm.camada} onChange={e=>setPrinterForm(f=>({...f,camada:e.target.value}))} placeholder="Ex: 0.05" type="number" step="0.01" min="0.01"
                  style={{width:"100%",background:C.dark3,border:`1px solid ${printerForm.camada?"rgba(13,148,136,0.4)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>TEMPO DE EXPOSIÇÃO (s) *</label>
                <input value={printerForm.exposicao} onChange={e=>setPrinterForm(f=>({...f,exposicao:e.target.value}))} placeholder="Ex: 8" type="number" step="0.5" min="0.5"
                  style={{width:"100%",background:C.dark3,border:`1px solid ${printerForm.exposicao?"rgba(13,148,136,0.4)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:8,letterSpacing:.5}}>TIPOS DE SERVIÇO ONDE USAR ESTA IMPRESSORA</label>
              {["Guia Cirúrgico","Placa Oclusal","Modelo de Estudo","Perioguide","Guia Endodôntico","Outros"].map(st=>{
                const sel=printerForm.serviceTypes.includes(st);
                return(
                  <button key={st} onClick={()=>setPrinterForm(f=>({...f,serviceTypes:sel?f.serviceTypes.filter(x=>x!==st):[...f.serviceTypes,st]}))}
                    style={{display:"inline-flex",alignItems:"center",gap:8,background:sel?"rgba(13,148,136,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${sel?"rgba(13,148,136,0.4)":C.border}`,borderRadius:16,padding:"5px 12px",cursor:"pointer",color:sel?"#0D9488":C.textSec,fontSize:12,fontWeight:sel?700:400,marginRight:6,marginBottom:6}}>
                    {sel&&<Check size={11}/>} {st}
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setPrinterModal(null)} style={{flex:1,padding:"11px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,cursor:"pointer"}}>Cancelar</button>
              <button disabled={!printerForm.marca||!printerForm.modelo||!printerForm.resina_marca||!printerForm.resina_modelo||!printerForm.camada||!printerForm.exposicao}
                onClick={()=>{
                  const saved={...printerForm,id:printerModal==="new"?"pr"+Date.now():printerModal.id};
                  setPrinters(ps=>printerModal==="new"?[...ps,saved]:ps.map(p=>p.id===saved.id?saved:p));
                  setPrinterModal(null);
                }}
                style={{flex:2,padding:"11px 0",background:"rgba(13,148,136,0.15)",border:"1px solid rgba(13,148,136,0.4)",borderRadius:12,color:"#0D9488",fontSize:13,fontWeight:700,cursor:"pointer",opacity:(!printerForm.marca||!printerForm.modelo||!printerForm.resina_marca||!printerForm.resina_modelo||!printerForm.camada||!printerForm.exposicao)?0.4:1}}>
                {printerModal==="new"?"Salvar impressora":"Atualizar impressora"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDeleteId&&(
        <div onClick={()=>setConfirmDeleteId(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:70,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(229,34,41,0.35)",borderRadius:16,padding:28,maxWidth:400,width:"100%"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:12,background:"rgba(229,34,41,0.1)",border:"1px solid rgba(229,34,41,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Trash2 size={26} color={C.red}/>
              </div>
            </div>
            <div style={{fontSize:16,fontWeight:800,textAlign:"center",marginBottom:8,color:"#fff"}}>Remover serviço</div>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,textAlign:"center",marginBottom:24}}>
              Tem certeza que deseja remover este serviço do pedido? Esta ação não poderá ser desfeita.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDeleteId(null)}
                style={{flex:1,padding:"13px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                Cancelar
              </button>
              <button onClick={()=>{
                  if(confirmDeleteId==="preplan"){setA(a=>({...a,preplan:null}));}
                  else{setServices(s=>s.filter(x=>x.id!==confirmDeleteId));}
                  setConfirmDeleteId(null);
                }}
                style={{flex:1,padding:"13px 0",background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.4)",borderRadius:12,color:C.red,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}

      {showStackableInfo&&(
        <div onClick={()=>{setShowStackableInfo(false);setScreen(7);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:70,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(229,34,41,0.28)",borderRadius:16,padding:28,maxWidth:420,width:"100%"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:12,background:"rgba(229,34,41,0.10)",border:"1px solid rgba(229,34,41,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Wrench size={26} color={C.textSec}/>
              </div>
            </div>
            <div style={{fontSize:16,fontWeight:800,textAlign:"center",marginBottom:8}}>Stackable Guide / Guias Empilháveis</div>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,textAlign:"center",marginBottom:16}}>Serviço alterado. O Stackable Guide já inclui todos os adicionais do protocolo.</div>
            <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,padding:"12px 14px",marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:8,letterSpacing:.5}}>✓ INCLUSO NO SERVIÇO</div>
              {["Guia cirúrgico empilhável (inferior + superior)","Prótese Protocolo Provisória para Captura","Relatório cirúrgico em PDF","Vídeo de planejamento para aprovação"].map((item,i)=>(
                <div key={i} style={{fontSize:12,color:C.text,display:"flex",alignItems:"flex-start",gap:8,marginBottom:5}}>
                  <span style={{color:C.textSec,flexShrink:0}}>✓</span>{item}
                </div>
              ))}
            </div>
            <button onClick={()=>{setShowStackableInfo(false);setScreen(7);}}
              style={{width:"100%",padding:"13px 0",background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.35)",borderRadius:12,color:C.textSec,fontSize:14,fontWeight:700,cursor:"pointer"}}>
              Continuar → Informações do caso
            </button>
          </div>
        </div>
      )}
      {/* ── PROTOCOLO WARNING MODAL (sem DSD 3D) ── */}
      {showProtoWarning&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:70,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.4)",borderRadius:16,padding:28,maxWidth:460,width:"100%"}}>
            {/* Ícone */}
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:12,background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <AlertTriangle size={26} color={C.yellow}/>
              </div>
            </div>
            {/* Título */}
            <div style={{fontSize:16,fontWeight:800,textAlign:"center",marginBottom:12,color:"#fff"}}>
              Atenção — Referência Protética
            </div>
            {/* Texto específico por serviço */}
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.75,textAlign:"center",marginBottom:20,padding:"0 4px"}}>
              {service?.id==="proto_total"
                ?"O posicionamento dos implantes levará em consideração a prótese atual do paciente como referência protética."
                :service?.id==="proto_parc"
                  ?"O posicionamento dos implantes levará em consideração os dentes remanescentes e a disponibilidade óssea, sem considerar a posição dos dentes da futura prótese."
                  :"O posicionamento dos implantes terá como referência a disponibilidade óssea e um enceramento diagnóstico genérico, sem considerar características anatômicas e estéticas do paciente."}
            </div>
            {/* Botões */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={()=>{setShowProtoWarning(false);setScreen(2);}}
                style={{width:"100%",padding:"13px 0",background:"rgba(234,179,8,0.12)",border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,color:C.yellow,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Entendido — continuar sem o planejamento
              </button>
              <button onClick={()=>{setShowProtoWarning(false);setA(a=>({...a,dsd3dAddon:true}));}}
                style={{width:"100%",padding:"13px 0",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:12,color:C.green,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                Adicionar o Planejamento Digital do Sorriso 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRE-PLANNING CONFIRMATION MODAL ── */}
      {showPreplanConfirm&&(
        <div onClick={()=>setShowPreplanConfirm(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,padding:24,maxWidth:500,width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Search size={26} color={C.yellow}/></div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:12,textAlign:"center"}}>Regras do Pré-planejamento</div>
            <pre style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:"0 0 14px 0",background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,padding:"12px 14px"}}>{PREPLAN_RULES}</pre>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:20}}>
              Ao confirmar, você concorda com as regras acima e será direcionado para preencher as informações do caso — etapa obrigatória para o pré-planejamento.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowPreplanConfirm(false)} style={{flex:1,padding:"11px 0",background:C.dark3,border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,cursor:"pointer"}}>
                Voltar
              </button>
              <button onClick={()=>{setShowPreplanConfirm(false);set("preplan","sim");setScreen(7);}} style={{flex:1,padding:"11px 0",background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,color:"#FCD34D",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Entendido — confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {(showRules||videoModal)&&(
        <div onClick={()=>{setShowRules(false);setVideoModal(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.82)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          {showRules&&(
            <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:24,maxWidth:500,width:"100%",maxHeight:"70vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:15,fontWeight:800}}>Regras do Pré-planejamento</span>
                <button onClick={()=>setShowRules(false)} style={{background:"none",border:"none",color:C.textSec,fontSize:22,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
              </div>
              <pre style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{PREPLAN_RULES}</pre>
              <button onClick={()=>setShowRules(false)} style={{marginTop:16,width:"100%",padding:11,background:C.red,border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Fechar</button>
            </div>
          )}
          {videoModal&&(
            <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:520,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div><div style={{fontWeight:800,fontSize:14}}>{videoModal.title}</div><div style={{fontSize:13,color:C.textSec}}>Vídeo explicativo</div></div>
                <button onClick={()=>setVideoModal(null)} style={{background:"none",border:"none",color:C.textSec,fontSize:22,cursor:"pointer",padding:0}}>×</button>
              </div>
              <div style={{padding:"32px 20px",textAlign:"center"}}>
                <div style={{fontSize:38,marginBottom:10}}></div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Vídeo em breve</div>
                <div style={{fontSize:13,color:C.textSec,lineHeight:1.6}}>O vídeo explicativo deste serviço está sendo produzido.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TOAST ── */}
      {/* ── WHATSAPP FLOATING HELP BUTTON ── */}
      {dentist&&screen!=="auth"&&screen!=="dashboard"&&(
        <a href={`https://wa.me/5598985425982?text=${encodeURIComponent(`Olá! Sou ${dentist.nome} (${dentist.cro}). Preciso de ajuda com: ${specialty?specialty.name+' — ':''} ${service?service.name:''}`)}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Ajuda via WhatsApp"
          style={{position:"fixed",bottom:24,right:24,zIndex:150,width:48,height:48,borderRadius:16,background:"#22C55E",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(34,197,94,0.4)",textDecoration:"none",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <MessageCircle size={22} color="#fff"/>
        </a>
      )}

      {undoService&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:200,background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>
          <Trash2 size={14} color={C.textSec}/>
          <span style={{fontSize:13,color:C.textSec}}>Serviço removido</span>
          <button onClick={()=>{setServices(s=>[...s,undoService.service]);clearTimeout(undoService.timer);setUndoService(null);}}
            style={{display:"flex",alignItems:"center",gap:5,background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.25)",borderRadius:8,padding:"5px 10px",color:C.textSec,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            <Undo2 size={12}/> Desfazer
          </button>
          <button onClick={()=>{clearTimeout(undoService.timer);setUndoService(null);}} aria-label="Fechar" style={{background:"none",border:"none",color:C.textSec,cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
            <XIcon size={14}/>
          </button>
        </div>
      )}
      {toast&&(
        <div role="alert" aria-live="polite" aria-atomic="true"
          onClick={()=>setToast("")}
          style={{position:"fixed",bottom:"max(24px,env(safe-area-inset-bottom,24px))",left:"50%",transform:"translateX(-50%)",background:C.dark3,border:`1px solid ${C.border2}`,color:C.text,padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:600,zIndex:100,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",maxWidth:"calc(100vw - 32px)",textAlign:"center"}}>
          {toast} <span aria-hidden="true" style={{opacity:.5,marginLeft:6}}>×</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:C.dark2,borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src={DCAD_LOGO} alt="D-CAD Dental Digital Solutions" style={{height:28,width:"auto",display:"block"}}/>
          <span style={{fontWeight:600,fontSize:12,color:C.textSec,marginLeft:2}}>Portal</span>
          {/* Botão voltar ao dashboard — visível em qualquer tela exceto auth/dashboard/pending */}
          {dentist&&screen!=="auth"&&screen!=="dashboard"&&screen!=="pending"&&(
            <button onClick={()=>setScreen("dashboard")}
              style={{display:"flex",alignItems:"center",gap:5,background:"none",border:`1px solid ${C.border}`,color:C.textSec,fontSize:13,padding:"4px 10px",borderRadius:8,cursor:"pointer",marginLeft:4}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Dashboard
            </button>
          )}
        </div>
        {dentist&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {patient&&<span style={{fontSize:12,color:C.textSec}}>Paciente: <b style={{color:C.text}}>{patient.nome}</b></span>}
            {discount>0&&<span style={{fontSize:12,fontWeight:700,background:"rgba(34,197,94,0.15)",color:C.green,padding:"3px 9px",borderRadius:16}}>15% desconto</span>}
            <div style={{width:28,height:28,borderRadius:"50%",background:C.dark3,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.red}}>
              {dentist.nome.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <button onClick={resetAll} style={{background:"none",border:`1px solid ${C.border}`,color:C.textSec,fontSize:13,padding:"4px 10px",borderRadius:8,cursor:"pointer"}}>Sair</button>
          </div>
        )}
      </div>

      {/* ── EDITING BANNER ── */}
      {editingId&&(
        <div style={{background:"rgba(229,34,41,0.10)",borderBottom:"1px solid rgba(229,34,41,0.18)",padding:"7px 20px",display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.textSec}}>
          <FileText size={14}/>
          <span>Modo de edição — reconfigure o serviço e avance até o final para salvar</span>
          <button onClick={()=>{
            // Restaura o serviço original no carrinho e cancela a edição
            if(editingOriginal){
              setServices(s=>[...s,editingOriginal]);
              setEditingOriginal(null);
            }
            setEditingId(null);
            setScreen("resumo");
          }} style={{marginLeft:"auto",background:"none",border:"none",color:C.textSec,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Cancelar edição</button>
        </div>
      )}

      {/* ── BREADCRUMB ── */}
      {dentist&&patient&&screen!=="auth"&&screen!=="patient"&&screen!=="pending"&&(
        <div style={{background:C.dark2,padding:"6px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:5,fontSize:13,color:C.textSec}}>
          <span style={{cursor:"pointer"}} onClick={()=>{setScreen("specialties");setSpecialty(null);setService(null);}}>Especialidades</span>
          {specialty&&<><span>›</span><span style={{cursor:"pointer"}} onClick={()=>{setScreen("services");setService(null);}}>{specialty.name}</span></>}
          {service&&<><span>›</span><span style={{color:C.text}}>{service.name}</span></>}
        </div>
      )}

      {/* ── WIZARD PROGRESS ── */}
      {stepNum>=0&&(
        <div style={{background:C.dark2,padding:"8px 20px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{flex:1,height:3,background:C.dark3,borderRadius:8,overflow:"hidden"}}>
              <div style={{height:"100%",width:(stepNum/(WIZARD_STEPS.length-1)*100)+"%",background:C.red,transition:"width .4s ease"}}/>
            </div>
            <span style={{fontSize:13,color:C.textSec,whiteSpace:"nowrap",fontWeight:600,flexShrink:0}}>
              {stepNum+1}/{WIZARD_STEPS.length}
            </span>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {WIZARD_STEPS.map((l,i)=>(
              <span key={i} style={{fontSize:12,padding:"2px 8px",borderRadius:16,background:i===stepNum?C.red:i<stepNum?"rgba(229,34,41,0.15)":C.dark3,color:i===stepNum?"#fff":i<stepNum?C.red:C.textSec,fontWeight:i===stepNum?700:400,transition:"all .2s",cursor:i<stepNum?"pointer":"default"}}
                onClick={()=>{if(i<stepNum)setScreen(i);}}>{l}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── PROFILE INCOMPLETE BANNER ── */}
      {dentist&&!profileComplete&&screen!=="auth"&&screen!=="profile"&&screen!=="pending"&&(
        <div style={{background:"rgba(234,179,8,0.12)",borderBottom:"1px solid rgba(234,179,8,0.3)",padding:"9px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#FCD34D"}}>
            <AlertTriangle size={14} color={C.yellow}/>
            <span><b>Cadastro incompleto.</b> Finalize seus dados de cobrança e entrega para poder concluir compras.</span>
          </div>
          <button onClick={()=>setScreen("profile")} style={{background:"rgba(234,179,8,0.2)",border:"1px solid rgba(234,179,8,0.4)",color:"#FCD34D",fontSize:13,fontWeight:700,padding:"5px 12px",borderRadius:8,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
            Completar agora →
          </button>
        </div>
      )}

      {/* ── LAYOUT: sidebar + main ── */}
      <div suppressHydrationWarning style={{display:"flex",alignItems:"flex-start",width:"100%"}}>

        {/* ── DESKTOP SIDEBAR ── */}
        {isDesktop&&dentist&&screen!=="auth"&&screen!=="dashboard"&&(patient||specialty||services.length>0)&&(
          <div style={{width:256,flexShrink:0,borderRight:`1px solid ${C.border}`,minHeight:"calc(100vh - 52px)",padding:"16px 14px",position:"sticky",top:52,overflowY:"auto",maxHeight:"calc(100vh - 52px)"}}>

            {/* Section title */}
            <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1.5,marginBottom:12}}>RESUMO DO CASO</div>

            {/* Step-by-step summary */}
            {[
              // Patient
              {icon:<User size={14}/>, label:"Paciente", value:patient?.nome, active:!!patient, action:()=>setScreen("patient"), actionLabel:"trocar"},
              // Specialty
              {icon:<SpecIcon id={specialty?.id||""} size={14}/>, label:"Especialidade", value:specialty?.name, active:!!specialty, action:specialty?()=>{setScreen("specialties");setSpecialty(null);setService(null);}:null, actionLabel:"trocar"},
              // Service type
              {icon:serviceType==="print"?<Printer size={14}/>:serviceType==="planOnly"?<Ruler size={14}/>:<Activity size={14}/>, label:"Tipo de serviço", value:serviceType==="print"?"Plan. + Impressão 3D":serviceType==="planOnly"?"Arquivo Digital (STL)":null, active:!!serviceType, action:serviceType&&specialty?()=>setScreen("serviceType"):null, actionLabel:"trocar"},
              // Service
              {icon:<ClipboardList size={14}/>, label:"Serviço", value:service?.name, active:!!service},
              // Pre-planning
              ...(A.preplan!==null?[{icon:<Search size={14}/>, label:"Pré-planejamento", value:A.preplan==="sim"?"Sim (R$ 150)":"Não", active:true}]:[]),
              // Arcada (protocolo)
              ...(service?.usesArch&&(A.arch?.sup||A.arch?.inf)?[{
                icon:<Activity size={14}/>, label:"Arcada",
                value:[A.arch.sup&&"Superior",A.arch.inf&&"Inferior"].filter(Boolean).join(" + "),
                active:true,
              }]:[]),
              // Tipo de caso (protocolo — ALL-ON)
              ...(service?.usesArch&&A.implantQty?[{
                icon:<Hash size={14}/>, label:"Tipo de caso",
                value:(()=>{
                  const labels={4:"ALL-ON-4",5:"ALL-ON-X",6:"ALL-ON-6"};
                  if(typeof A.implantQty==="object"){
                    const s=A.implantQty.sup?labels[A.implantQty.sup]:"—";
                    const i=A.implantQty.inf?labels[A.implantQty.inf]:"—";
                    return `Sup: ${s} · Inf: ${i}`;
                  }
                  return labels[A.implantQty]||`${A.implantQty} implantes`;
                })(),
                active:true,
              }]:[]),
              // Serviço complementar DSD 3D (protocolo)
              ...(service?.usesArch&&service?.id!=="stackable"?[{
                icon:<Sparkles size={14}/>, label:"Plan. Sorriso 3D",
                value:A.dsd3dAddon?`Sim (+${fmt(P.dsd3dProto)})`:"Não",
                active:true,
              }]:[]),
              // Dentes (guiada)
              ...(!service?.usesArch&&A.teeth?.length>0?[{
                icon:null, label:"Dente(s)",
                value:[...A.teeth].sort((a,b)=>a-b).join(", "),
                active:true,
              }]:[]),
              // Brand
              ...(A.brand?[{icon:<Tag size={14}/>, label:"Marca do Implante", value:A.brand, active:true}]:[]),
              // Kit
              ...(A.kit?[{icon:<Wrench size={14}/>, label:"Kit Cirúrgico", value:A.kit, active:true}]:[]),
              // Model
              ...(A.model||A.modelText?[{icon:<Ruler size={14}/>, label:"Modelo do Implante", value:A.model||A.modelText, active:true}]:[]),
              // Serviços adicionais (guiada — por dente)
              ...((A.comps?.captura?.length||A.comps?.adesiva?.length||A.comps?.cicatriz?.length)?[{
                icon:null, label:"Adicionais",
                value:[
                  A.comps.captura?.length&&`Prov. captura ×${A.comps.captura.length}`,
                  A.comps.adesiva?.length&&`Prov. adesiva ×${A.comps.adesiva.length}`,
                  A.comps.cicatriz?.length&&`Cicatrizador ×${A.comps.cicatriz.length}`,
                ].filter(Boolean).join(" · "),
                active:true,
              }]:[]),
              // Prótese protocolo provisória
              ...(A.comps?.proto_captura>0?[{
                icon:null, label:"Prótese prov.",
                value:`Para ${A.comps.proto_captura} arcada${A.comps.proto_captura>1?"s":""}`,
                active:true,
              }]:[]),
              // Arquivo preparado
              ...(serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile?[{
                icon:<Printer size={14}/>, label:"Arquivo p/ impressão",
                value:A.slicedFile?`Sim (+${fmt(P.slicedFile)})`:"Não",
                active:true,
              }]:[]),
              // Urgência
              ...(A.urgency&&A.urgency!=="normal"?[{
                icon:<Zap size={14}/>, label:"Prazo",
                value:URGENCY_TIERS.find(u=>u.id===A.urgency)?.label||A.urgency,
                active:true,
              }]:[]),
              // Observations
              ...(A.observacoes?[{icon:<FileText size={14}/>, label:"Observações", value:A.observacoes.slice(0,30)+(A.observacoes.length>30?"...":""), active:true}]:[]),
              // Freight
              ...(freight?.method&&freight.method!=="none"?[{
                icon:<Package size={14}/>, label:"Frete",
                value:freight.method==="local"?"Entrega local (Grátis)":freight.method==="sedex"?`SEDEX${freight.value===0?" (Grátis)":` R$${freight.value?.toFixed(2)}`}`:`PAC R$${freight.value?.toFixed(2)}`,
                active:true,
              }]:[]),
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start",opacity:item.active?1:0.4}}>
                <div style={{width:22,height:22,borderRadius:8,background:item.active?"rgba(229,34,41,0.1)":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:1}}>
                  {item.active?item.icon:"○"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:.5,textTransform:"uppercase"}}>{item.label}</span>
                    {item.action&&<button onClick={item.action} style={{background:"none",border:"none",color:C.red,fontSize:13,cursor:"pointer",padding:0,flexShrink:0}}>{item.actionLabel}</button>}
                  </div>
                  {item.value&&<div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3,wordBreak:"break-word",marginTop:1}}>{item.value}</div>}
                </div>
              </div>
            ))}

            {specialty&&service&&screen!=="resumo"&&screen!=="checkout"&&screen!=="auth"&&screen!=="dashboard"&&(
              <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:10,marginBottom:4}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:12,color:C.textSec,fontWeight:700,letterSpacing:.5}}>SUBTOTAL</span>
                  <span style={{fontSize:15,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
                </div>
                {services.length>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:C.textSec}}>+ {services.length} serviço{services.length>1?"s":""} no carrinho</span>
                    <span style={{fontSize:13,fontWeight:700,color:C.textSec}}>{fmt(totalAll)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Divider before cart */}
            {services.length>0&&(
              <div>
                <div style={{borderTop:`1px solid ${C.border}`,margin:"12px 0 10px"}}/>
                <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:8}}>CARRINHO ({services.length})</div>
                {services.map(sv=>(
                  <div key={sv.id} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",marginBottom:5}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:2,lineHeight:1.3}}>{sv.name}</div>
                    <div style={{fontSize:12,color:C.textSec}}>{sv.teeth?.join(", ")||"—"} · {sv.brand||"—"}</div>
                    <div style={{fontWeight:800,fontSize:13,color:C.red,marginTop:3}}>{fmt(sv.total)}</div>
                  </div>
                ))}
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.textSec}}>Total</span>
                  <span style={{fontSize:13,fontWeight:900,color:C.red}}>{fmt(totalAll)}</span>
                </div>
              </div>
            )}

            {/* Discount badge */}
            {discount>0&&(
              <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"7px 9px",fontSize:12,color:C.green,fontWeight:700,marginTop:10,textAlign:"center"}}>
                ✓ 15% desconto parceiro
              </div>
            )}

          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <div suppressHydrationWarning style={{flex:1,minWidth:0,opacity:screenVisible?1:0,transition:screenVisible?"opacity .18s ease-out":"none",willChange:"opacity"}}>
      <div suppressHydrationWarning style={W}>

        {/* ════════════════════════════════
            AUTH SCREEN
        ════════════════════════════════ */}
        {screen==="auth"&&(
          <div style={{maxWidth:460,margin:"0 auto",paddingTop:isDesktop?40:24}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:56,height:56,background:C.red,borderRadius:12,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",marginBottom:14}}>D</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>D-CAD Portal</div>
              <div style={{fontSize:13,color:C.textSec}}>Acesso exclusivo para dentistas cadastrados</div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",background:C.dark3,borderRadius:12,padding:3,marginBottom:20}}>
              {[["login","Entrar"],["reg","Criar conta"]].map(([t,l])=>(
                <button key={t} onClick={()=>setAuthTab(t)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:authTab===t?C.dark2:"transparent",color:authTab===t?C.text:C.textSec,fontWeight:authTab===t?700:400,fontSize:13,cursor:"pointer",transition:"all .2s"}}>
                  {l}
                </button>
              ))}
            </div>

            {authTab==="login"&&!forgotPw&&(
              <div>
                <Field label="E-mail" type="email" value={loginForm.email} onChange={v=>setLoginForm(f=>({...f,email:v}))} placeholder="seu@email.com"/>
                <div style={{position:"relative"}}>
                  <Field label="Senha" type={showPass?"text":"password"} value={loginForm.senha} onChange={v=>setLoginForm(f=>({...f,senha:v}))} placeholder="••••••••"/>
                  <button type="button" onClick={()=>setShowPass(p=>!p)} aria-label={showPass?"Ocultar senha":"Mostrar senha"}
                    style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",paddingTop:16}}>
                    {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
                <button onClick={()=>{
                  if(!loginForm.email||!loginForm.senha){setToast("Preencha e-mail e senha.");return;}
                  setDentist({nome:"Dr. Leonardo Araújo",cro:"CRO-MA 6789",clinica:"D-CAD Dental Digital Solutions",email:loginForm.email,whatsapp:"(98) 98542-5982",accountType:"dentista",accountStatus:"active"});
                  setProfile({docType:"cpf",cpf:"000.000.000-00",rua:"Av. Colares Moreira",numero:"444",bairro:"Renascença II",complemento:"Sala 343",cidade:"São Luís",estado:"MA",cep:"65060-645",entregaIgual:true,entRua:"",entNumero:"",entBairro:"",entCidade:"",entEstado:"",entCep:""});
                  setProfileComplete(true);setScreen("dashboard");
                }} style={btnStyle(C.red)}>
                  Entrar
                </button>
                <div style={{textAlign:"center",marginTop:14}}>
                  <button onClick={()=>{setForgotPw(true);setForgotSent(false);setForgotEmail(loginForm.email||"");}}
                    style={{background:"none",border:"none",color:C.textSec,fontSize:12,cursor:"pointer",textDecoration:"underline",fontFamily:"inherit"}}>
                    Esqueci minha senha
                  </button>
                </div>
              </div>
            )}

            {/* ── RECUPERAÇÃO DE SENHA ── */}
            {authTab==="login"&&forgotPw&&(
              <div>
                <div style={{background:"rgba(229,34,41,0.06)",border:`1px solid rgba(229,34,41,0.18)`,borderRadius:12,padding:"16px",marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Recuperar senha</div>
                  <div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>Informe o e-mail cadastrado. Você receberá um link para redefinir sua senha.</div>
                </div>
                {!forgotSent?(
                  <div>
                    <Field label="E-mail cadastrado" type="email" value={forgotEmail} onChange={v=>setForgotEmail(v)} placeholder="seu@email.com"/>
                    <button onClick={()=>{
                      if(!forgotEmail||!forgotEmail.includes("@")){setToast("Informe um e-mail válido.");return;}
                      // Aqui integrar com Supabase resetPasswordForEmail
                      setForgotSent(true);
                    }} style={btnStyle(C.red)}>
                      Enviar link de recuperação
                    </button>
                    <div style={{textAlign:"center",marginTop:12}}>
                      <button onClick={()=>setForgotPw(false)}
                        style={{background:"none",border:"none",color:C.textSec,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                        ← Voltar ao login
                      </button>
                    </div>
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"20px 0"}}>
                    <div style={{fontSize:36,marginBottom:12}}>✉️</div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>E-mail enviado!</div>
                    <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:20}}>
                      Enviamos um link de recuperação para<br/>
                      <strong style={{color:C.text}}>{forgotEmail}</strong>.<br/>
                      Verifique sua caixa de entrada e spam.
                    </div>
                    <button onClick={()=>{setForgotPw(false);setForgotSent(false);}}
                      style={{background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 24px",color:C.textSec,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      Voltar ao login
                    </button>
                  </div>
                )}
              </div>
            )}

            {authTab==="reg"&&(
              <div>
                {/* Tipo de conta */}
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:8,letterSpacing:.5}}>TIPO DE CONTA *</label>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {v:"dentista",icon:<Stethoscope size={14}/>,label:"Dentista"},
                      {v:"clinica", icon:<Building2 size={16}/>,label:"Clínica Radiológica"},
                      {v:"cursos",  icon:<GraduationCap size={16}/>,label:"Cursos e Instituições"},
                    ].map(t=>(
                      <button key={t.v} onClick={()=>setRegForm(f=>({...f,tipo:t.v}))}
                        style={{display:"flex",alignItems:"center",gap:8,background:regForm.tipo===t.v?"rgba(229,34,41,0.08)":C.dark2,border:`1.5px solid ${regForm.tipo===t.v?C.red:C.border}`,borderRadius:12,padding:"11px 13px",cursor:"pointer",textAlign:"left",color:C.text}}>
                        <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                        <div style={{flex:1,fontSize:13,fontWeight:700,color:regForm.tipo===t.v?C.red:C.text}}>{t.label}</div>
                        <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${regForm.tipo===t.v?C.red:C.border}`,background:regForm.tipo===t.v?C.red:"transparent",flexShrink:0}}/>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dados básicos */}
                <Field label="Nome completo *" value={regForm.nome} onChange={v=>setRegForm(f=>({...f,nome:v}))} placeholder="Dr. João da Silva"/>
                <Field label="CRO *" value={regForm.cro} onChange={v=>setRegForm(f=>({...f,cro:v}))} placeholder="CRO-MA 12345"/>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ESPECIALIDADE PRINCIPAL</label>
                  <select value={regForm.especialidade} onChange={e=>setRegForm(f=>({...f,especialidade:e.target.value}))}
                    style={{width:"100%",background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",color:regForm.especialidade?C.text:C.textSec,fontSize:13,outline:"none",boxSizing:"border-box"}}>
                    <option value="">Selecione...</option>
                    {SPECIALTIES_LIST.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="Nome da clínica / instituição" value={regForm.clinica} onChange={v=>setRegForm(f=>({...f,clinica:v}))} placeholder="Clínica XYZ Odontologia"/>
                <Field label="WhatsApp *" value={regForm.whatsapp} onChange={v=>setRegForm(f=>({...f,whatsapp:v}))} placeholder="(98) 99999-9999"/>
                <Field label="E-mail *" type="email" value={regForm.email} onChange={v=>setRegForm(f=>({...f,email:v}))} placeholder="seu@email.com"/>
                <Field label="Senha *" type="password" value={regForm.senha} onChange={v=>setRegForm(f=>({...f,senha:v}))} placeholder="Mínimo 8 caracteres"/>
                <Field label="Confirmar senha *" type="password" value={regForm.confirmaSenha} onChange={v=>setRegForm(f=>({...f,confirmaSenha:v}))} placeholder="Repita a senha"/>

                {/* Dados adicionais para Clínica Radiológica e Cursos */}
                {["clinica","cursos"].includes(regForm.tipo)&&(
                  <div>
                    <div style={{borderTop:`1px solid ${C.border}`,margin:"16px 0 14px",paddingTop:14}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.yellow,letterSpacing:1,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                        <AlertTriangle size={12} style={{display:"inline",marginRight:4,verticalAlign:"middle"}}/> DADOS COMPLEMENTARES (obrigatórios para aprovação)
                      </div>

                      {/* CPF / CNPJ — Clínica e Cursos usam apenas CNPJ */}
                      <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:8,letterSpacing:.5}}>TIPO DE DOCUMENTO *</label>
                      {(regForm.tipo==="clinica"||regForm.tipo==="cursos")
                        ?<div style={{background:C.dark3,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:13,color:C.textSec}}>
                            CNPJ <span style={{fontSize:13,color:C.textSec,fontWeight:400}}>— obrigatório para este tipo de conta</span>
                          </div>
                        :<div style={{display:"flex",gap:8,marginBottom:12}}>
                          {[["cpf","CPF"],["cnpj","CNPJ"]].map(([v,l])=>(
                            <button key={v} onClick={()=>setRegForm(f=>({...f,docType:v}))}
                              style={{flex:1,padding:"9px 0",border:`1.5px solid ${regForm.docType===v?C.red:C.border}`,borderRadius:8,background:regForm.docType===v?"rgba(229,34,41,0.08)":C.dark2,color:regForm.docType===v?C.red:C.textSec,fontWeight:regForm.docType===v?700:400,fontSize:13,cursor:"pointer"}}>
                              {l}
                            </button>
                          ))}
                        </div>
                      }
                      {(regForm.tipo==="clinica"||regForm.tipo==="cursos"||(regForm.docType==="cnpj"))
                        ?<div>
                          <Field label="CNPJ *" value={regForm.cnpj} onChange={v=>setRegForm(f=>({...f,cnpj:v}))} placeholder="00.000.000/0001-00"/>
                          <Field label="Razão Social *" value={regForm.razaoSocial} onChange={v=>setRegForm(f=>({...f,razaoSocial:v}))} placeholder="Nome conforme CNPJ"/>
                        </div>
                        :<Field label="CPF *" value={regForm.cpf} onChange={v=>setRegForm(f=>({...f,cpf:v}))} placeholder="000.000.000-00"/>
                      }

                      {/* Endereço de cobrança */}
                      <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10,marginTop:4}}>ENDEREÇO DE COBRANÇA</div>
                      <div style={{marginBottom:12}}>
                        <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>CEP * <span style={{fontSize:12,color:C.textSec,fontWeight:400}}>— Buscar preenche os campos automaticamente</span></label>
                        <div style={{display:"flex",gap:8}}>
                          <input value={regForm.cep} onChange={e=>setRegForm(f=>({...f,cep:e.target.value}))} placeholder="00000-000" maxLength={9}
                            style={{flex:1,background:C.dark2,border:`1px solid ${regForm.cep?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                          <button onClick={()=>buscarCEP(regForm.cep,(d)=>setRegForm(f=>({...f,rua:d.logradouro||f.rua,bairro:d.bairro||f.bairro,cidade:d.localidade||f.cidade,estado:d.uf||f.estado})),"reg_billing")}
                            disabled={cepLoading==="reg_billing"}
                            style={{padding:"0 14px",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0,opacity:cepLoading==="reg_billing"?0.6:1,whiteSpace:"nowrap"}}>
                            {cepLoading==="reg_billing"?"...":"Buscar"}
                          </button>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8}}>
                        <Field label="Rua / Avenida *" value={regForm.rua} onChange={v=>setRegForm(f=>({...f,rua:v}))} placeholder="Preenchido automaticamente"/>
                        <Field label="Número *" value={regForm.numero} onChange={v=>setRegForm(f=>({...f,numero:v}))} placeholder="444"/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <Field label="Bairro *" value={regForm.bairro} onChange={v=>setRegForm(f=>({...f,bairro:v}))} placeholder="Preenchido automaticamente"/>
                        <Field label="Complemento" value={regForm.complemento} onChange={v=>setRegForm(f=>({...f,complemento:v}))} placeholder="Sala, apto..."/>
                        <Field label="Cidade *" value={regForm.cidade} onChange={v=>setRegForm(f=>({...f,cidade:v}))} placeholder="Preenchido automaticamente"/>
                        <div style={{marginBottom:12}}>
                          <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ESTADO *</label>
                          <select value={regForm.estado} onChange={e=>setRegForm(f=>({...f,estado:e.target.value}))}
                            style={{width:"100%",background:C.dark2,border:`1px solid ${regForm.estado?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 12px",color:regForm.estado?C.text:C.textSec,fontSize:13,outline:"none",boxSizing:"border-box"}}>
                            <option value="">UF</option>
                            {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Endereço de entrega */}
                      <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10,marginTop:4}}>ENDEREÇO DE ENTREGA</div>
                      <button onClick={()=>setRegForm(f=>({...f,entregaIgual:!f.entregaIgual}))}
                        style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:"0 0 12px 0",color:C.text}}>
                        <div style={{width:18,height:18,borderRadius:8,background:regForm.entregaIgual?C.green:C.dark3,border:`1.5px solid ${regForm.entregaIgual?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:regForm.entregaIgual?"#111":"transparent",fontWeight:800,flexShrink:0}}>
                          {regForm.entregaIgual?"✓":""}
                        </div>
                        <span style={{fontSize:13}}>Mesmo endereço de cobrança</span>
                      </button>
                      {!regForm.entregaIgual&&(
                        <div>
                          <div style={{marginBottom:12}}>
                            <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>CEP * <span style={{fontSize:12,color:C.textSec,fontWeight:400}}>— Buscar preenche automaticamente</span></label>
                            <div style={{display:"flex",gap:8}}>
                              <input value={regForm.entCep} onChange={e=>setRegForm(f=>({...f,entCep:e.target.value}))} placeholder="00000-000" maxLength={9}
                                style={{flex:1,background:C.dark2,border:`1px solid ${regForm.entCep?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                              <button onClick={()=>buscarCEP(regForm.entCep,(d)=>setRegForm(f=>({...f,entRua:d.logradouro||f.entRua,entBairro:d.bairro||f.entBairro,entCidade:d.localidade||f.entCidade,entEstado:d.uf||f.entEstado})),"reg_delivery")}
                                disabled={cepLoading==="reg_delivery"}
                                style={{padding:"0 14px",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0,opacity:cepLoading==="reg_delivery"?0.6:1,whiteSpace:"nowrap"}}>
                                {cepLoading==="reg_delivery"?"...":"Buscar"}
                              </button>
                            </div>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8}}>
                            <Field label="Rua *" value={regForm.entRua} onChange={v=>setRegForm(f=>({...f,entRua:v}))} placeholder="Preenchido automaticamente"/>
                            <Field label="Número *" value={regForm.entNumero} onChange={v=>setRegForm(f=>({...f,entNumero:v}))} placeholder="100"/>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                            <Field label="Bairro *" value={regForm.entBairro} onChange={v=>setRegForm(f=>({...f,entBairro:v}))} placeholder="Preenchido automaticamente"/>
                            <Field label="Complemento" value={regForm.entComplemento} onChange={v=>setRegForm(f=>({...f,entComplemento:v}))} placeholder="Sala, apto..."/>
                            <Field label="Cidade *" value={regForm.entCidade} onChange={v=>setRegForm(f=>({...f,entCidade:v}))} placeholder="Preenchido automaticamente"/>
                            <div style={{marginBottom:12}}>
                              <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ESTADO *</label>
                              <select value={regForm.entEstado} onChange={e=>setRegForm(f=>({...f,entEstado:e.target.value}))}
                                style={{width:"100%",background:C.dark2,border:`1px solid ${regForm.entEstado?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 12px",color:regForm.entEstado?C.text:C.textSec,fontSize:13,outline:"none",boxSizing:"border-box"}}>
                                <option value="">UF</option>
                                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s=><option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                )}

                <button onClick={()=>{
                  if(!regForm.nome||!regForm.cro||!regForm.whatsapp||!regForm.email||!regForm.senha){setToast("Preencha todos os campos obrigatórios.");return;}
                  if(regForm.senha!==regForm.confirmaSenha){setToast("As senhas não coincidem.");return;}
                  const needsApproval=["clinica","cursos"].includes(regForm.tipo);
                  if(needsApproval){
                    const doc=regForm.docType==="cpf"?regForm.cpf:regForm.cnpj;
                    const razao=regForm.docType==="cnpj"&&!regForm.razaoSocial;
                    const addr=!regForm.rua||!regForm.numero||!regForm.bairro||!regForm.cidade||!regForm.estado||!regForm.cep;
                    const ent=!regForm.entregaIgual&&(!regForm.entRua||!regForm.entNumero||!regForm.entCidade||!regForm.entEstado||!regForm.entCep);
                    if(!doc||razao||addr||ent){setToast("Preencha todos os campos obrigatórios para aprovação.");return;}
                    // Save profile from regForm
                    setProfile({docType:regForm.docType,cpf:regForm.cpf,cnpj:regForm.cnpj,razaoSocial:regForm.razaoSocial,rua:regForm.rua,numero:regForm.numero,bairro:regForm.bairro,complemento:regForm.complemento,cidade:regForm.cidade,estado:regForm.estado,cep:regForm.cep,entregaIgual:regForm.entregaIgual,entRua:regForm.entRua,entNumero:regForm.entNumero,entBairro:regForm.entBairro,entComplemento:regForm.entComplemento,entCidade:regForm.entCidade,entEstado:regForm.entEstado,entCep:regForm.entCep});
                    setProfileComplete(true);
                  }
                  setDentist({nome:regForm.nome,cro:regForm.cro,clinica:regForm.clinica,email:regForm.email,accountType:regForm.tipo,accountStatus:needsApproval?"pending":"active"});
                  setScreen(needsApproval?"pending":"profile");
                }} style={btnStyle(C.red)}>
                  {["clinica","cursos"].includes(regForm.tipo)?"Criar conta e aguardar aprovação":"Criar conta e continuar"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            PENDING APPROVAL SCREEN
        ════════════════════════════════ */}
        {screen==="pending"&&(
          <div style={{maxWidth:480,margin:"0 auto",paddingTop:isDesktop?40:16,textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:16}}>⏳</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Cadastro em análise</div>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,marginBottom:24}}>
              Seu cadastro como <b style={{color:C.text}}>{dentist?.accountType==="clinica"?"Clínica Radiológica":"Curso / Instituição"}</b> foi recebido e está aguardando aprovação da equipe D-CAD.<br/><br/>
              Você receberá uma confirmação por e-mail em até <b style={{color:C.text}}>48 horas úteis</b>.
            </div>

            <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:20,textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:12}}>APÓS A APROVAÇÃO VOCÊ TERÁ ACESSO A:</div>
              {[
                ["$","Desconto fixo de 15% em todos os serviços"],
                ["◈","Plataforma completa de contratação de serviços"],
                ["","Portal de acompanhamento de pedidos"],
                ["◎","Histórico de casos e planejamentos"],
              ].map(([icon,txt],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <span style={{fontSize:13,color:C.textSec}}>{txt}</span>
                </div>
              ))}
            </div>

            <div style={{background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,padding:16,marginBottom:20,textAlign:"left",fontSize:13,color:C.textSec,lineHeight:1.6}}>
              Dúvidas? Fale com a equipe D-CAD:<br/>
              <b style={{color:C.text}}>WhatsApp: (98) 98542-5982</b>
            </div>

            {/* Demo only: simulate approval */}
            <div style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:C.yellow,letterSpacing:1,marginBottom:8}}>MODO DE DEMONSTRAÇÃO</div>
              <button onClick={()=>{setDentist(d=>({...d,accountStatus:"active"}));setScreen("dashboard");}}
                style={{width:"100%",padding:"10px 0",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:8,color:C.green,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                ✓ Simular aprovação pelo admin D-CAD
              </button>
            </div>
            <button onClick={resetAll} style={{background:"none",border:"none",color:C.textSec,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Voltar ao início</button>
          </div>
        )}

        {/* ════════════════════════════════
            PROFILE COMPLETION
        ════════════════════════════════ */}
        {screen==="profile"&&(
          <div style={{maxWidth:560,margin:"0 auto",paddingTop:isDesktop?32:8}}>
            <div style={{marginBottom:20}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(234,179,8,0.12)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:16,padding:"4px 12px",marginBottom:12}}>
                <AlertTriangle size={12} color={C.yellow}/>
                <span style={{fontSize:13,fontWeight:700,color:"#FCD34D"}}>Cadastro pendente</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Complete seu cadastro</div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.6}}>Necessário para emissão de nota fiscal e envio dos produtos. Você pode navegar livremente, mas precisará completar antes de finalizar qualquer compra.</div>
            </div>

            {/* CPF / CNPJ */}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:8,letterSpacing:.5}}>TIPO DE DOCUMENTO</label>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {[["cpf","CPF"],["cnpj","CNPJ"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setProfile(p=>({...p,docType:v}))}
                    style={{flex:1,padding:"9px 0",border:`1.5px solid ${profile.docType===v?C.red:C.border}`,borderRadius:8,background:profile.docType===v?"rgba(229,34,41,0.08)":C.dark2,color:profile.docType===v?C.red:C.textSec,fontWeight:profile.docType===v?700:400,fontSize:13,cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>
              {profile.docType==="cpf"&&(
                <Field label="CPF *" value={profile.cpf} onChange={v=>setProfile(p=>({...p,cpf:v}))} placeholder="000.000.000-00"/>
              )}
              {profile.docType==="cnpj"&&(<>
                <Field label="CNPJ *" value={profile.cnpj} onChange={v=>setProfile(p=>({...p,cnpj:v}))} placeholder="00.000.000/0001-00"/>
                <Field label="Razão Social *" value={profile.razaoSocial} onChange={v=>setProfile(p=>({...p,razaoSocial:v}))} placeholder="Nome da empresa conforme CNPJ"/>
              </>)}
            </div>

            {/* Endereço */}
            <div style={{padding:"12px 14px",background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:12,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:12}}>ENDEREÇO DE COBRANÇA</div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>CEP * <span style={{fontSize:12,color:C.textSec,fontWeight:400}}>— Buscar preenche os campos automaticamente</span></label>
                <div style={{display:"flex",gap:8}}>
                  <input value={profile.cep} onChange={e=>setProfile(p=>({...p,cep:e.target.value}))} placeholder="00000-000" maxLength={9}
                    style={{flex:1,background:C.dark2,border:`1px solid ${profile.cep?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={()=>buscarCEP(profile.cep,(d)=>setProfile(p=>({...p,rua:d.logradouro||p.rua,bairro:d.bairro||p.bairro,cidade:d.localidade||p.cidade,estado:d.uf||p.estado})),"prof_billing")}
                    disabled={cepLoading==="prof_billing"}
                    style={{padding:"0 14px",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0,opacity:cepLoading==="prof_billing"?0.6:1,whiteSpace:"nowrap"}}>
                    {cepLoading==="prof_billing"?"...":"Buscar"}
                  </button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8,marginBottom:0}}>
                <Field label="Rua / Avenida *" value={profile.rua} onChange={v=>setProfile(p=>({...p,rua:v}))} placeholder="Preenchido automaticamente"/>
                <Field label="Número *" value={profile.numero} onChange={v=>setProfile(p=>({...p,numero:v}))} placeholder="Ex: 444"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <Field label="Bairro *" value={profile.bairro} onChange={v=>setProfile(p=>({...p,bairro:v}))} placeholder="Preenchido automaticamente"/>
                <Field label="Complemento" value={profile.complemento} onChange={v=>setProfile(p=>({...p,complemento:v}))} placeholder="Sala, apto..."/>
                <Field label="Cidade *" value={profile.cidade} onChange={v=>setProfile(p=>({...p,cidade:v}))} placeholder="Preenchido automaticamente"/>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ESTADO *</label>
                  <select value={profile.estado} onChange={e=>setProfile(p=>({...p,estado:e.target.value}))}
                    style={{width:"100%",background:C.dark2,border:`1px solid ${profile.estado?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 12px",color:profile.estado?C.text:C.textSec,fontSize:13,outline:"none",boxSizing:"border-box"}}>
                    <option value="">UF</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço de entrega */}
            <div style={{padding:"12px 14px",background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:12,marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:12}}>ENDEREÇO DE ENTREGA</div>
              <button onClick={()=>setProfile(p=>({...p,entregaIgual:!p.entregaIgual}))}
                style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:"0 0 12px 0",color:C.text}}>
                <div style={{width:18,height:18,borderRadius:8,background:profile.entregaIgual?C.green:C.dark3,border:`1.5px solid ${profile.entregaIgual?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:profile.entregaIgual?"#111":"transparent",fontWeight:800,flexShrink:0}}>
                  {profile.entregaIgual?"✓":""}
                </div>
                <span style={{fontSize:13}}>Mesmo endereço de cobrança</span>
              </button>
              {!profile.entregaIgual&&(
                <div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>CEP * <span style={{fontSize:12,color:C.textSec,fontWeight:400}}>— Buscar preenche automaticamente</span></label>
                    <div style={{display:"flex",gap:8}}>
                      <input value={profile.entCep} onChange={e=>setProfile(p=>({...p,entCep:e.target.value}))} placeholder="00000-000" maxLength={9}
                        style={{flex:1,background:C.dark2,border:`1px solid ${profile.entCep?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                      <button onClick={()=>buscarCEP(profile.entCep,(d)=>setProfile(p=>({...p,entRua:d.logradouro||p.entRua,entBairro:d.bairro||p.entBairro,entCidade:d.localidade||p.entCidade,entEstado:d.uf||p.entEstado})),"prof_delivery")}
                        disabled={cepLoading==="prof_delivery"}
                        style={{padding:"0 14px",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0,opacity:cepLoading==="prof_delivery"?0.6:1,whiteSpace:"nowrap"}}>
                        {cepLoading==="prof_delivery"?"...":"Buscar"}
                      </button>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8}}>
                    <Field label="Rua / Avenida *" value={profile.entRua} onChange={v=>setProfile(p=>({...p,entRua:v}))} placeholder="Preenchido automaticamente"/>
                    <Field label="Número *" value={profile.entNumero} onChange={v=>setProfile(p=>({...p,entNumero:v}))} placeholder="Ex: 100"/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <Field label="Bairro *" value={profile.entBairro} onChange={v=>setProfile(p=>({...p,entBairro:v}))} placeholder="Preenchido automaticamente"/>
                    <Field label="Complemento" value={profile.entComplemento} onChange={v=>setProfile(p=>({...p,entComplemento:v}))} placeholder="Sala, apto..."/>
                    <Field label="Cidade *" value={profile.entCidade} onChange={v=>setProfile(p=>({...p,entCidade:v}))} placeholder="Preenchido automaticamente"/>
                    <div style={{marginBottom:12}}>
                      <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>ESTADO *</label>
                      <select value={profile.entEstado} onChange={e=>setProfile(p=>({...p,entEstado:e.target.value}))}
                        style={{width:"100%",background:C.dark2,border:`1px solid ${profile.entEstado?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 12px",color:profile.entEstado?C.text:C.textSec,fontSize:13,outline:"none",boxSizing:"border-box"}}>
                        <option value="">UF</option>
                        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Impressoras 3D ────────────────────────────────── */}
            <div style={{padding:"14px 16px",background:"rgba(13,148,136,0.06)",border:"1px solid rgba(13,148,136,0.25)",borderRadius:12,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#0D9488",letterSpacing:1}}>IMPRESSORAS 3D CADASTRADAS</div>
                  <div style={{fontSize:13,color:C.textSec,marginTop:2}}>Seus parâmetros são preenchidos automaticamente ao contratar Somente Planejamento.</div>
                </div>
                <button onClick={()=>{setPrinterForm({apelido:"",marca:"",modelo:"",resina_marca:"",resina_modelo:"",camada:"",exposicao:"",serviceTypes:[]});setPrinterModal("new");}}
                  style={{background:"rgba(13,148,136,0.15)",border:"1px solid rgba(13,148,136,0.35)",borderRadius:8,padding:"7px 12px",color:"#0D9488",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
                  <Plus size={13}/> Nova
                </button>
              </div>
              {printers.length===0&&(
                <div style={{fontSize:12,color:C.textSec,textAlign:"center",padding:"12px 0"}}>Nenhuma impressora cadastrada ainda.</div>
              )}
              {printers.map((pr,i)=>(
                <div key={pr.id} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:8}}>
                  <Printer size={18} color="#0D9488" style={{flexShrink:0,marginTop:2}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13}}>{pr.apelido||`${pr.marca} ${pr.modelo}`}</div>
                    <div style={{fontSize:13,color:C.textSec,marginTop:2}}>Resina: {pr.resina_marca} {pr.resina_modelo}</div>
                    <div style={{fontSize:13,color:C.textSec}}>Camada: {pr.camada}mm · Exposição: {pr.exposicao}s</div>
                    {pr.serviceTypes?.length>0&&<div style={{fontSize:12,color:"#0D9488",marginTop:3,fontWeight:600}}>Usada em: {pr.serviceTypes.join(", ")}</div>}
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>{setPrinterForm({...pr});setPrinterModal(pr);}}
                      style={{background:"rgba(229,34,41,0.10)",border:"1px solid rgba(229,34,41,0.25)",borderRadius:8,padding:"5px 10px",color:C.textSec,fontSize:13,cursor:"pointer",fontWeight:600}}>Editar</button>
                    <button onClick={()=>setPrinters(p=>p.filter((_,j)=>j!==i))}
                      style={{background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.2)",borderRadius:8,padding:"5px 8px",color:C.red,fontSize:13,cursor:"pointer"}}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Btn onClick={()=>{
              const doc=profile.docType==="cpf"?profile.cpf:profile.cnpj;
              const razao=profile.docType==="cnpj"&&!profile.razaoSocial;
              const addr=!profile.rua||!profile.numero||!profile.bairro||!profile.cidade||!profile.estado||!profile.cep;
              const ent=!profile.entregaIgual&&(!profile.entRua||!profile.entNumero||!profile.entCidade||!profile.entEstado||!profile.entCep);
              if(!doc||razao||addr||ent){setToast("Preencha todos os campos obrigatórios.");return;}
              setProfileComplete(true);
              setScreen("dashboard");
            }}>Salvar cadastro e continuar →</Btn>
            {dentist&&screen==="profile"&&services.length>0&&(
              <button onClick={()=>setScreen("resumo")} style={{width:"100%",marginTop:10,padding:"11px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,cursor:"pointer"}}>
                Salvar e voltar ao pedido
              </button>
            )}
            <button onClick={()=>setScreen(dentist&&patient?"specialties":"patient")} style={{width:"100%",marginTop:8,padding:"8px 0",background:"none",border:"none",color:C.textSec,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
              Preencher depois (não poderá finalizar compras)
            </button>
          </div>
        )}

        {/* ════════════════════════════════
            DASHBOARD
        ════════════════════════════════ */}
        {screen==="dashboard"&&(
          <div style={{width:"100%"}}>
            {/* Bloco unificado: carrossel + tutorial */}
            <div style={{marginBottom:20,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {/* Carrossel de novidades D-CAD */}
            {(()=>{
              const ann=ANNOUNCEMENTS[carouselIdx];
              return(
                <div
                  onMouseEnter={()=>setCarouselPaused(true)}
                  onMouseLeave={()=>setCarouselPaused(false)}
                  style={{position:"relative",borderRadius:12,border:`1px solid ${ann.borderColor}`,marginBottom:20,overflow:"hidden",background:ann.bg,transition:"border-color .3s"}}>
                  {/* Imagem de fundo */}
                  {ann.imageUrl&&(
                    <img src={ann.imageUrl} alt="" aria-hidden="true"
                      style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.18,pointerEvents:"none"}}
                      onError={e=>{e.target.style.display="none";}}/>
                  )}
                  <div style={{position:"relative",padding:"18px 20px"}}>
                    {/* Topo: badge + fechar */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{fontSize:11,fontWeight:700,background:ann.badgeColor+"22",color:ann.badgeColor,border:`1px solid ${ann.badgeColor}44`,padding:"2px 10px",borderRadius:20}}>
                        {ann.badge}
                      </span>

                    </div>
                    {/* Título */}
                    <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6,lineHeight:1.3}}>{ann.title}</div>
                    {/* Corpo */}
                    <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:ann.link?12:0}}>{ann.body}</div>
                    {/* Link */}
                    {ann.link&&(
                      <a href={ann.link} target="_blank" rel="noopener noreferrer"
                        style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,color:ann.badgeColor,textDecoration:"none",background:ann.badgeColor+"14",border:`1px solid ${ann.badgeColor}33`,borderRadius:8,padding:"5px 12px"}}>
                        {ann.linkLabel||"Saiba mais →"}
                      </a>
                    )}
                    {/* Paginação */}
                    {ANNOUNCEMENTS.length>1&&(
                      <div style={{display:"flex",gap:6,alignItems:"center",marginTop:14}}>
                        {ANNOUNCEMENTS.map((_,i)=>(
                          <button key={i} onClick={()=>{setCarouselIdx(i);setCarouselPaused(true);}}
                            aria-label={`Slide ${i+1}`}
                            style={{width:i===carouselIdx?22:8,height:8,borderRadius:4,background:i===carouselIdx?ann.badgeColor:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",transition:"all .25s",padding:0}}/>
                        ))}
                        <span style={{fontSize:11,color:C.textSec,marginLeft:4}}>{carouselIdx+1} / {ANNOUNCEMENTS.length}</span>
                        {/* Prev/Next */}
                        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                          <button onClick={()=>{setCarouselIdx(i=>(i-1+ANNOUNCEMENTS.length)%ANNOUNCEMENTS.length);setCarouselPaused(true);}}
                            style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.textSec,fontSize:12}}>‹</button>
                          <button onClick={()=>{setCarouselIdx(i=>(i+1)%ANNOUNCEMENTS.length);setCarouselPaused(true);}}
                            style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.textSec,fontSize:12}}>›</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
            }

            {/* Botão Tutorial do Sistema — parte do mesmo bloco */}
            <button onClick={()=>{try{localStorage.removeItem("dcad_tutorial_done");}catch{}tutorialShownRef.current=true;setScreen("tutorial");}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"rgba(229,34,41,0.04)",borderTop:`1px solid ${C.border}`,padding:"12px 18px",color:C.text,cursor:"pointer",textAlign:"left",border:"none",fontFamily:"inherit"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.20)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🎓</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textSec}}>Tutorial do Sistema</div>
                <div style={{fontSize:12,color:C.textSec}}>Aprenda o fluxo completo em 8 etapas ilustradas</div>
              </div>
              <div style={{fontSize:16,color:C.textSec,flexShrink:0}}>›</div>
            </button>
            </div>{/* fim bloco unificado */}

            {/* Boas-vindas */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:12}}>
              <div>
                <div style={{fontSize:15,color:C.textSec,marginBottom:4}}>Bem-vindo de volta</div>
                <div style={{fontSize:22,fontWeight:800,lineHeight:1.2}}>{dentist?.nome}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                  {accountType==="clinica"&&<span style={{fontSize:12,fontWeight:700,background:"rgba(34,197,94,0.12)",color:C.green,padding:"3px 9px",borderRadius:16,border:"1px solid rgba(34,197,94,0.2)"}}> Clínica Radiológica · 15% desconto</span>}
                  {accountType==="cursos"&&<span style={{fontSize:12,fontWeight:700,background:"rgba(34,197,94,0.12)",color:C.green,padding:"3px 9px",borderRadius:16,border:"1px solid rgba(34,197,94,0.2)"}}> Cursos · 15% desconto</span>}
                  {accountType==="dentista"&&<span style={{fontSize:12,fontWeight:700,background:C.dark3,color:C.textSec,padding:"3px 9px",borderRadius:16}}> Dentista</span>}
                </div>
              </div>
              <button onClick={()=>{setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});setSpecialty(null);setService(null);setServiceType(null);setSelectedGroup(null);setScreen("patient");}}
                style={{background:C.red,border:"none",borderRadius:12,padding:"11px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                + Novo pedido
              </button>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
              {[
                {label:"Total de pedidos",value:mockOrders.length,color:C.textSec},
                {label:"Em andamento",value:mockOrders.filter(o=>o.status==="planning"||o.status==="printing").length,color:C.yellow},
                {label:"Entregues",value:mockOrders.filter(o=>o.status==="shipped"||o.status==="delivered").length,color:C.green},
              ].map((s,i)=>(
                <div key={i} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
                  <div style={{fontSize:26,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:13,color:C.textSec,marginTop:3,lineHeight:1.3}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sparkline — atividade 30 dias */}
            {(()=>{
              // Gera dados de atividade simulados baseados nos pedidos reais
              const weeks=["Sem 1","Sem 2","Sem 3","Sem 4"];
              const vals=[mockOrders.length>0?2:0, mockOrders.length>0?1:0, mockOrders.length>0?3:0, services.length>0?services.length:mockOrders.length>0?2:0];
              const max=Math.max(...vals,1);
              const W=260,H=40,pad=4;
              const pts=vals.map((v,i)=>({
                x:pad+i*(W-2*pad)/3,
                y:H-pad-(v/max)*(H-2*pad)
              }));
              const path=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
              const area=path+` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
              if(vals.every(v=>v===0)) return null;
              return(
                <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                  <div style={{fontSize:12,color:C.textSec,fontWeight:700,letterSpacing:.5,marginBottom:8}}>ATIVIDADE — ÚLTIMAS 4 SEMANAS</div>
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",height:40}}>
                    <defs>
                      <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.red} stopOpacity="0.3"/>
                        <stop offset="100%" stopColor={C.red} stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#spark-grad)"/>
                    <path d={path} fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3} fill={C.red}/>)}
                  </svg>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    {weeks.map((w,i)=><span key={i} style={{fontSize:10,color:C.textSec}}>{w}</span>)}
                  </div>
                </div>
              );
            })()}

            {/* Ações rápidas */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10}}>ACESSO RÁPIDO</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {icon:<Archive size={18}/>,label:"Histórico completo",sub:"Todos os pedidos",action:()=>setToast("Histórico em breve"),clr:"rgba(229,34,41,0.12)"},
                  {icon:<Users size={18}/>,label:"Meus pacientes",sub:"Gerenciar pacientes",action:()=>setToast("Pacientes em breve"),clr:"rgba(34,197,94,0.08)"},
                  {icon:<FolderOpen size={18}/>,label:"Baixar arquivos",sub:"Resultados e planejamentos",action:()=>setToast("Arquivos em breve"),clr:"rgba(234,179,8,0.08)"},
                  {icon:<MessageCircle size={18}/>,label:"Falar com a D-CAD",sub:"Suporte via WhatsApp",action:()=>window.open("https://wa.me/5598985425982?text=Olá! Sou cliente D-CAD e preciso de suporte.","_blank"),clr:"rgba(34,197,94,0.08)"},
                ].map((a,i)=>(
                  <button key={i} onClick={a.action}
                    style={{display:"flex",alignItems:"center",gap:12,background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s",minHeight:56}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#555"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{width:44,height:44,borderRadius:12,background:a.clr,display:"flex",alignItems:"center",justifyContent:"center",color:C.text,flexShrink:0}}>{a.icon}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700}}>{a.label}</div>
                      <div style={{fontSize:13,color:C.textSec,marginTop:2}}>{a.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Serviços frequentes */}
            {frequentServices.length>0&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                  <span>⭐</span> MEUS SERVIÇOS FREQUENTES
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {frequentServices.slice(0,3).map((fs,i)=>(
                    <div key={i} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:8,background:(fs.specialtyColor||C.red)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
                        ⭐
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,lineHeight:1.3}}>{fs.name}</div>
                        <div style={{fontSize:12,color:C.textSec}}>{fs.specialty} · {fs.count} pedido{fs.count>1?"s":""}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:900,color:C.red,marginBottom:6}}>{fmt(fs.price||0)}</div>
                        <button onClick={()=>{
                          const sp=catalog.find(cat=>cat.name===fs.specialty||cat.specialties?.some(s=>s.name===fs.specialty));
                          const foundSp=catalog.find(cat=>cat.services?.some(s=>s.id===fs.id));
                          if(foundSp){setSpecialty(foundSp);setScreen("services");}
                          else setScreen("specialties");
                        }} style={{background:"rgba(229,34,41,0.1)",border:"1px solid rgba(229,34,41,0.25)",borderRadius:8,padding:"4px 10px",color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                          Contratar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carrinhos pendentes */}
            {pendingCarts.length>0&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:C.yellow,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                  ⏳ AGUARDANDO PAGAMENTO
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {pendingCarts.map((cart,i)=>(
                    <div key={i} style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.25)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:44,height:44,borderRadius:12,background:"rgba(234,179,8,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}><ShoppingCart size={20}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>
                          {cart.services.length} serviço(s) · Paciente: {cart.patientNome}
                        </div>
                        <div style={{fontSize:13,color:C.textSec}}>
                          {cart.services.map(s=>s.name).join(", ")} · {cart.date}
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontWeight:800,fontSize:14,color:C.yellow,marginBottom:4}}>{fmt(cart.total)}</div>
                        <button onClick={()=>{
                          // Restaurar carrinho e ir para resumo
                          const pat=savedPatients.find(p=>p.id===cart.patientId)||{id:cart.patientId,nome:cart.patientNome};
                          setPatient(pat);
                          setServices(cart.services);
                          setPendingCarts(pc=>pc.filter((_,idx)=>idx!==i));
                          setScreen("resumo");
                        }} style={{background:"rgba(234,179,8,0.12)",border:"1px solid rgba(234,179,8,0.3)",borderRadius:8,padding:"4px 10px",color:C.yellow,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                          Finalizar pedido →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pedidos com pagamento pendente (checkout aberto, aguardando confirmação) */}
            {pendingPayments.length>0&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:C.yellow,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                  <Clock size={13} color={C.yellow}/> PAGAMENTO PENDENTE
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {pendingPayments.map((o,i)=>(
                    <div key={o.id||i} style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.3)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:44,height:44,borderRadius:12,background:"rgba(234,179,8,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}><Clock size={18} color={C.yellow}/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{o.servicesSummary}</div>
                        <div style={{fontSize:13,color:C.textSec}}>Paciente: {o.patientNome} · {o.date}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                        <div style={{fontWeight:800,fontSize:14,color:C.yellow}}>{fmt(o.total)}</div>
                        <div style={{fontSize:12,background:"rgba(234,179,8,0.12)",color:C.yellow,padding:"2px 7px",borderRadius:16,fontWeight:700}}>Aguard. pagamento</div>
                        <button onClick={()=>window.open(o.checkoutUrl,"_blank")}
                          style={{background:C.yellow,border:"none",borderRadius:8,padding:"5px 12px",color:"#111",fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
                          Finalizar pagamento →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pedidos recentes */}
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10}}>PEDIDOS RECENTES</div>
              {mockOrders.length===0&&services.length===0?(
                <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"32px 20px",textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:10}}><ClipboardList size={16}/></div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Nenhum pedido ainda</div>
                  <div style={{fontSize:13,color:C.textSec,marginBottom:16}}>Clique em "Novo pedido" para começar</div>
                </div>
              ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {/* Pedidos da sessão atual */}
                  {services.slice(0,8).map((sv,i)=>(
                    <div key={sv.id} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                        <div style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Stethoscope size={14} color="#E52229"/></div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:12,lineHeight:1.3,marginBottom:2}}>{sv.name}</div>
                          <div style={{fontSize:12,color:C.textSec}}>{patient?.nome||"—"}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:12,background:"rgba(234,179,8,0.12)",color:C.yellow,padding:"2px 7px",borderRadius:16,fontWeight:700}}>Aguard. pagamento</div>
                        <div style={{fontWeight:800,fontSize:13,color:C.red}}>{fmt(sv.total)}</div>
                      </div>
                    </div>
                  ))}
                  {/* Mock de pedidos anteriores */}
                  {mockOrders.slice(0, Math.max(0, 8-services.length)).map(o=>{
                    const STATUS={
                      pending_payment:{label:"Aguard. pagamento",color:C.yellow,bg:"rgba(234,179,8,0.1)"},
                      planning:{label:"Em planejamento",color:C.textSec,bg:"rgba(229,34,41,0.10)"},
                      printing:{label:"Em impressão",color:C.textSec,bg:"rgba(168,85,247,0.1)"},
                      shipped:{label:"Enviado",color:C.green,bg:"rgba(34,197,94,0.1)"},
                      delivered:{label:"Entregue",color:C.green,bg:"rgba(34,197,94,0.1)"},
                    };
                    const s=STATUS[o.status]||STATUS.planning;
                    return(
                      <div key={o.id} style={{background:C.dark2,border:`1px solid ${o.status==="pending_payment"?"rgba(234,179,8,0.3)":C.border}`,borderRadius:12,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                          <div style={{width:44,height:44,borderRadius:8,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ClipboardList size={14}/></div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:12,lineHeight:1.3,marginBottom:2}}>{o.service}</div>
                            <div style={{fontSize:12,color:C.textSec}}>{o.patient} · {o.date}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,background:s.bg,color:s.color,padding:"2px 7px",borderRadius:16,fontWeight:700,whiteSpace:"nowrap",display:"inline-block",marginBottom:4}}>{s.label}</div>
                            {(o.status==="planning"||o.status==="printing")&&(
                              <div style={{display:"flex",gap:3,alignItems:"center"}}>
                                {["Recebido","Planejamento","Impressão","Enviado"].map((step,si)=>{
                                  const stepIdx={planning:1,printing:2}[o.status]||0;
                                  const done=si<=stepIdx;
                                  return(
                                    <React.Fragment key={si}>
                                      <div style={{width:6,height:6,borderRadius:"50%",background:done?s.color:"rgba(255,255,255,0.12)",flexShrink:0}}/>
                                      {si<3&&<div style={{flex:1,height:2,background:done&&si<stepIdx?s.color:"rgba(255,255,255,0.08)",borderRadius:1}}/>}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div style={{fontWeight:800,fontSize:13,color:C.text,flexShrink:0}}>{fmt(o.total)}</div>
                        </div>
                        {o.status==="pending_payment"&&(
                          <button onClick={()=>{
                            const pat=savedPatients.find(p=>p.nome===o.patient)||{id:"mock-"+o.id,nome:o.patient,nasc:""};
                            setPatient(pat);
                            setServices([{id:o.id,name:o.service,specialty:o.specialty,teeth:[],brand:"",kit:"",model:"",comps:{},observacoes:"",serviceType:"print",total:o.total}]);
                            setFreight({method:"none",value:0,prazo:"",loading:false,simulated:false});
                            setCouponDiscount(0);
                            setScreen("resumo");
                          }} style={{background:C.yellow,border:"none",borderRadius:8,padding:"5px 0",color:"#111",fontSize:12,fontWeight:800,cursor:"pointer",width:"100%"}}>
                            Finalizar pagamento →
                          </button>
                        )}
                        {o.status!=="pending_payment"&&o.filesSubmitted===false&&(
                          <a href={process.env.NEXT_PUBLIC_CLICKUP_FORM_URL||"#"} target="_blank" rel="noopener noreferrer"
                            style={{background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.25)",borderRadius:8,padding:"5px 0",color:C.textSec,fontSize:12,fontWeight:700,textDecoration:"none",display:"block",textAlign:"center",width:"100%"}}>
                            <FolderOpen size={12} style={{display:"inline",marginRight:4}}/> Enviar exames →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            PATIENT SCREEN
        ════════════════════════════════ */}

        {screen==="tutorial"&&(
          <div style={{maxWidth:680,margin:"0 auto",padding:"0 0 80px",position:"relative"}}>

            {/* ── STICKY HEADER: voltar + progresso ── */}
            <div style={{position:"sticky",top:0,zIndex:60,background:"rgba(10,10,10,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border2}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:0,borderRadius:0}}>
              <button onClick={()=>{setScreen("dashboard");setTutorialScrollStep(0);}}
                style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${C.border}`,color:C.textSec,fontSize:13,cursor:"pointer",padding:"6px 12px",borderRadius:8,flexShrink:0,fontFamily:"inherit",minHeight:36}}>
                ← Voltar
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>Tutorial do Sistema</span>
                  <span style={{fontSize:11,color:C.textSec}}>{Math.min(tutorialScrollStep+1,8)} / 8</span>
                </div>
                <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${((tutorialScrollStep+1)/8)*100}%`,background:C.red,borderRadius:2,transition:"width .3s"}}/>
                </div>
              </div>
            </div>

            {/* ── Header hero ── */}
            <div style={{background:`linear-gradient(135deg,${C.red}1a 0%,${C.red}0d 100%)`,borderBottom:`1px solid rgba(229,34,41,0.18)`,padding:"28px 24px 24px",marginBottom:0,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,borderRadius:"50%",background:"rgba(229,34,41,0.06)",pointerEvents:"none"}}/>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:.8,marginBottom:8}}>D-CAD DIGITAL SOLUTIONS</div>
              <div style={{fontSize:24,fontWeight:900,marginBottom:8,lineHeight:1.2}}>Tutorial do Sistema</div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,marginBottom:20}}>Aprenda a solicitar planejamentos digitais e guias cirúrgicos em minutos. Siga o passo a passo abaixo — 8 etapas no total.</div>

              {/* Vídeo ou placeholder */}
              {TUTORIAL_VIDEO_URL?(
                <div style={{borderRadius:12,overflow:"hidden",marginBottom:20,background:"#000",position:"relative",paddingBottom:"56.25%"}}>
                  {TUTORIAL_VIDEO_URL.includes("youtube")||TUTORIAL_VIDEO_URL.includes("youtu.be")
                    ?<iframe src={TUTORIAL_VIDEO_URL.replace("watch?v=","embed/").replace("youtu.be/","youtube.com/embed/")}
                        style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title="Tutorial D-CAD"/>
                    :<video src={TUTORIAL_VIDEO_URL} controls style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
                  }
                </div>
              ):(
                <div style={{borderRadius:12,border:`1px dashed rgba(229,34,41,0.25)`,padding:"18px",marginBottom:20,display:"flex",alignItems:"center",gap:14,background:"rgba(229,34,41,0.04)"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(229,34,41,0.10)",border:"1px solid rgba(229,34,41,0.20)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🎬</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.textSec,marginBottom:3}}>Vídeo tutorial em breve</div>
                    <div style={{fontSize:12,color:C.textMut,lineHeight:1.5}}>Estamos produzindo um vídeo guiado do sistema. Por ora, siga o passo a passo abaixo.</div>
                  </div>
                </div>
              )}

              {/* Índice de navegação rápida */}
              <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:8,letterSpacing:.5}}>NAVEGAR PARA</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
                  {["Acesse sua conta","Dados do paciente","Selecione a especialidade","Escolha o serviço","Configure o caso","Revise e finalize","Envie os arquivos","Acompanhe o status"].map((label,i)=>(
                    <button key={i} onClick={()=>{
                      const el=document.getElementById(`tut-step-${i}`);
                      if(el)el.scrollIntoView({behavior:"smooth",block:"start"});
                    }} style={{background:"none",border:"none",color:C.textSec,fontSize:12,cursor:"pointer",textAlign:"left",padding:"3px 0",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:10,fontWeight:700,color:C.textSec,flexShrink:0,width:14}}>{i+1}</span>
                      <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Etapas ── */}
            {[
              {
                n:1, color:C.textSec, phase:"Configuração da conta", ico:"👤",
                title:"Acesse sua conta",
                desc:"Faça login com seu e-mail e senha cadastrados. Na primeira vez, clique em 'Criar conta' e preencha seus dados profissionais (CRO, clínica e WhatsApp para contato).",
                tips:["Use o mesmo e-mail em todos os acessos","Guarde sua senha em local seguro","Em caso de esquecimento, entre em contato via WhatsApp"],
                svg:(
                  <svg viewBox="0 0 320 160" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="160" fill="#1a1a1a" rx="10"/>
                    <rect x="40" y="24" width="240" height="112" fill="#242424" rx="8" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                    <text x="160" y="48" textAnchor="middle" fill="#E52229" fontSize="11" fontWeight="700" fontFamily="system-ui">D-CAD DIGITAL SOLUTIONS</text>
                    <rect x="80" y="64" width="160" height="22" fill="#2a2a2a" rx="5" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <text x="160" y="79" textAnchor="middle" fill="#666" fontSize="10" fontFamily="system-ui">E-mail</text>
                    <rect x="80" y="92" width="160" height="22" fill="#2a2a2a" rx="5" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <text x="160" y="107" textAnchor="middle" fill="#666" fontSize="10" fontFamily="system-ui">Senha</text>
                    <rect x="80" y="118" width="160" height="22" fill="#E52229" rx="5"/>
                    <text x="160" y="133" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui">Entrar</text>
                  </svg>
                ),
              },
              {
                n:2, color:C.textSec, phase:"Configuração da conta", ico:"🧑‍⚕️",
                title:"Informe os dados do paciente",
                desc:"Após o login, clique em '+ Novo pedido'. Informe o nome completo e a data de nascimento do paciente. Você pode buscar pacientes já cadastrados ou criar um novo.",
                tips:["Cada pedido é vinculado a um paciente","Pacientes anteriores ficam salvos para reutilização","O nome do paciente aparece no resumo do caso"],
                svg:(
                  <svg viewBox="0 0 320 140" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="140" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="30" fill="rgba(229,34,41,0.85)" fontSize="11" fontWeight="700" fontFamily="system-ui">Dados do Paciente</text>
                    <rect x="16" y="40" width="288" height="24" fill="#242424" rx="6" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                    <text x="28" y="56" fill="#666" fontSize="10" fontFamily="system-ui">Nome completo do paciente</text>
                    <rect x="16" y="70" width="136" height="24" fill="#242424" rx="6" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                    <text x="28" y="86" fill="#666" fontSize="10" fontFamily="system-ui">Data de nascimento</text>
                    <rect x="168" y="70" width="136" height="24" fill="#2a2a2a" rx="6" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
                    <text x="236" y="86" textAnchor="middle" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">Maria das Graças</text>
                    <rect x="16" y="104" width="288" height="26" fill="rgba(229,34,41,0.85)" rx="6"/>
                    <text x="160" y="121" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui">Continuar →</text>
                  </svg>
                ),
              },
              {
                n:3, color:C.textSec, phase:"Configuração da conta", ico:"🏥",
                title:"Selecione a especialidade",
                desc:"Escolha a especialidade odontológica do serviço que você precisa. As especialidades disponíveis são Implantodontia, Dentística, Prótese, DTM, Estética e outras.",
                tips:["Cada especialidade tem serviços específicos","Implantodontia v1.0 está completa e disponível","Outras especialidades serão adicionadas em breve"],
                svg:(
                  <svg viewBox="0 0 320 190" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="190" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="22" fill="#0D9488" fontSize="10" fontWeight="700" fontFamily="system-ui">Selecione a Especialidade</text>
                    {[
                      {x:8, y:30,c:"#E52229",t:"Implanto"},
                      {x:86,y:30,c:"#6366f1",t:"Dentística"},
                      {x:164,y:30,c:"#eab308",t:"Prótese"},
                      {x:242,y:30,c:"#22c55e",t:"Periodontia"},
                      {x:8, y:108,c:"rgba(229,34,41,0.85)",t:"Endodontia"},
                      {x:86,y:108,c:"#0D9488",t:"DTM"},
                      {x:164,y:108,c:"#ea580c",t:"Estética"},
                      {x:242,y:108,c:"#2563eb",t:"Cirurgia"},
                    ].map((sp,i)=>(
                      <g key={i}>
                        <rect x={sp.x} y={sp.y} width="72" height="70" fill="#242424" rx="8"
                          stroke={i===0?"rgba(229,34,41,0.6)":"rgba(255,255,255,0.07)"} strokeWidth={i===0?"1.5":"1"}/>
                        <rect x={sp.x} y={sp.y} width="72" height="3" fill={sp.c} rx="2"/>
                        <rect x={sp.x+10} y={sp.y+22} width="52" height="4" fill={sp.c} rx="2" opacity=".3"/>
                        <text x={sp.x+36} y={sp.y+50} textAnchor="middle" fill="#d0d0d0" fontSize="9.5" fontFamily="system-ui" fontWeight="600">{sp.t}</text>
                      </g>
                    ))}
                  </svg>
                ),
              },
              {
                n:4, color:C.red, phase:"Realizando o pedido", ico:"📋",
                title:"Escolha o serviço e a modalidade",
                desc:"Selecione o serviço desejado (ex: Cirurgia Guiada Unitária) e escolha a modalidade: Planejamento + Impressão 3D (D-CAD entrega as peças) ou Somente Planejamento (você recebe os arquivos para imprimir).",
                tips:["Somente Planejamento requer que você possua uma impressora 3D","O preço muda entre as modalidades","Serviços com ⚠ não oferecem modalidade Somente Planejamento"],
                svg:(
                  <svg viewBox="0 0 320 165" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="165" fill="#1a1a1a" rx="10"/>
                    <rect x="16" y="16" width="288" height="64" fill="#242424" rx="8" stroke="rgba(229,34,41,0.3)" strokeWidth="1.5"/>
                    <rect x="16" y="16" width="288" height="3" fill="#E52229" rx="2"/>
                    <text x="32" y="40" fill="#fff" fontSize="12" fontWeight="700" fontFamily="system-ui">Cirurgia Guiada Unitária</text>
                    <text x="32" y="56" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">Guia para 1 implante · A partir de R$ 389</text>
                    <rect x="28" y="64" width="80" height="10" fill="rgba(34,197,94,0.15)" rx="3" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5"/>
                    <text x="68" y="72" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="system-ui">✓ Exames inclusos</text>
                    <rect x="16" y="96" width="138" height="58" fill="#242424" rx="8" stroke="rgba(229,34,41,0.4)" strokeWidth="1.5"/>
                    <text x="85" y="118" textAnchor="middle" fill="#E52229" fontSize="10" fontWeight="700" fontFamily="system-ui">Plan. + Impressao</text>
                    <text x="85" y="134" textAnchor="middle" fill="#a0a0a0" fontSize="9" fontFamily="system-ui">D-CAD entrega as pecas</text>
                    <rect x="162" y="96" width="142" height="58" fill="#2a2a2a" rx="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <text x="233" y="118" textAnchor="middle" fill="#a0a0a0" fontSize="10" fontWeight="700" fontFamily="system-ui">So Planejamento</text>
                    <text x="233" y="134" textAnchor="middle" fill="#666" fontSize="9" fontFamily="system-ui">Voce imprime os arquivos</text>
                  </svg>
                ),
              },
              {
                n:5, color:C.red, phase:"Realizando o pedido", ico:"⚙️",
                title:"Configure o caso clínico",
                desc:"Preencha as informações clínicas: selecione os dentes no odontograma (ou arcadas no protocolo), escolha a marca do implante, o kit e o modelo. Em seguida, defina o prazo de entrega.",
                tips:["O odontograma aceita até 8 implantes por arcada","A marca do implante filtra automaticamente kits e modelos","Urgente tem acréscimo de 40% sobre o valor base"],
                svg:(
                  <svg viewBox="0 0 320 175" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="175" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="24" fill="#E52229" fontSize="11" fontWeight="700" fontFamily="system-ui">Selecione os dentes</text>
                    <g transform="translate(8,32)">
                      {[...Array(16)].map((_,i)=>{
                        const row=i<8?0:1;const col=i%8;
                        const x=col*19;const y=row*26;
                        const sel=[2,4,7].includes(i);
                        return(
                          <g key={i}>
                            <rect x={x} y={y} width="17" height="21" fill={sel?"rgba(229,34,41,0.25)":"#2a2a2a"} rx="3"
                              stroke={sel?"#E52229":"rgba(255,255,255,0.1)"} strokeWidth={sel?"1.5":"1"}/>
                            <text x={x+8} y={y+14} textAnchor="middle" fill={sel?"#E52229":"#555"} fontSize="7.5" fontFamily="system-ui">
                              {[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28][i]}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                    <text x="16" y="108" fill="#E52229" fontSize="11" fontWeight="700" fontFamily="system-ui">Marca do implante</text>
                    <rect x="16" y="114" width="288" height="24" fill="#242424" rx="6" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                    <text x="28" y="130" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">Neodent · Grand Morse · Titamax</text>
                    <rect x="270" y="116" width="26" height="20" fill="#E52229" rx="4"/>
                    <text x="283" y="130" textAnchor="middle" fill="#fff" fontSize="12">▾</text>
                  </svg>
                ),
              },
              {
                n:6, color:C.red, phase:"Realizando o pedido", ico:"📦",
                title:"Revise o pedido e finalize",
                desc:"Na tela de Resumo do Caso, confira todos os serviços adicionados, os valores, o prazo e o tipo de frete. Você pode adicionar mais serviços ao mesmo pedido antes de finalizar.",
                tips:["Você pode editar ou remover serviços antes de pagar","Múltiplos serviços podem ser enviados juntos","O desconto institucional é aplicado automaticamente"],
                svg:(
                  <svg viewBox="0 0 320 140" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="140" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="24" fill="#22c55e" fontSize="11" fontWeight="700" fontFamily="system-ui">Resumo do Caso</text>
                    <rect x="16" y="30" width="288" height="44" fill="#242424" rx="8" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                    <text x="28" y="48" fill="#fff" fontSize="11" fontWeight="600" fontFamily="system-ui">Cirurgia Guiada Unitária</text>
                    <text x="28" y="62" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">Dente 16 · Neodent · Grand Morse · Normal</text>
                    <text x="290" y="56" textAnchor="end" fill="#E52229" fontSize="13" fontWeight="900" fontFamily="system-ui">R$ 389</text>
                    <line x1="16" y1="80" x2="304" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                    <rect x="16" y="86" width="136" height="24" fill="#2a2a2a" rx="6" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <text x="84" y="102" textAnchor="middle" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">+ Adicionar serviço</text>
                    <rect x="160" y="86" width="144" height="24" fill="#E52229" rx="6"/>
                    <text x="232" y="102" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui">Finalizar pedido →</text>
                    <text x="16" y="130" fill="#22c55e" fontSize="10" fontFamily="system-ui">✓ Total: R$ 389,00 · Frete: A calcular</text>
                  </svg>
                ),
              },
              {
                n:7, color:C.textSec, phase:"Após o pedido", ico:"📁",
                title:"Envie os arquivos clínicos",
                desc:"Após o pagamento, você receberá instruções para enviar os arquivos clínicos: tomografia (DICOM/CBCT), escaneamento intraoral (STL), e outros exames conforme o serviço. O planejamento começa após o recebimento e validação dos arquivos.",
                tips:["CBCT obrigatório para cirurgia guiada (fatias ≤0.4mm)","Escaneamento intraoral substitui modelos de gesso","Dúvidas sobre arquivos: WhatsApp (98) 98542-5982"],
                svg:(
                  <svg viewBox="0 0 320 140" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="140" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="24" fill="#0D9488" fontSize="11" fontWeight="700" fontFamily="system-ui">Arquivos necessários</text>
                    {[
                      {ico:"🧠",label:"CBCT / Tomografia",sub:"Formato DICOM · Fatias ≤0.4mm",req:true},
                      {ico:"🦷",label:"Escaneamento Intraoral",sub:"Formato STL ou OBJ",req:true},
                      {ico:"📋",label:"Prescrição clínica",sub:"Posição, angulação, emergência",req:false},
                    ].map((f,i)=>(
                      <g key={i} transform={`translate(16,${32+i*34})`}>
                        <rect width="288" height="28" fill="#242424" rx="6" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                        <text x="14" y="18" fill="#fff" fontSize="14">{f.ico}</text>
                        <text x="36" y="14" fill="#e0e0e0" fontSize="10" fontWeight="600" fontFamily="system-ui">{f.label}</text>
                        <text x="36" y="24" fill="#666" fontSize="9" fontFamily="system-ui">{f.sub}</text>
                        <text x="272" y="18" textAnchor="end" fill={f.req?"#E52229":"#22c55e"} fontSize="9" fontWeight="700" fontFamily="system-ui">{f.req?"Obrigatório":"Opcional"}</text>
                      </g>
                    ))}
                  </svg>
                ),
              },
              {
                n:8, color:C.textSec, phase:"Após o pedido", ico:"🚀",
                title:"Acompanhe o planejamento",
                desc:"Após o envio dos arquivos, nossa equipe inicia o planejamento. Você recebe atualizações por WhatsApp e pode acompanhar o status no dashboard. O prazo começa a contar a partir da validação dos arquivos.",
                tips:["Tempo médio de planejamento: 48-72h úteis","Aprovação obrigatória antes da impressão","Suporte por WhatsApp em horário comercial"],
                svg:(
                  <svg viewBox="0 0 320 140" style={{width:"100%",borderRadius:10,display:"block"}}>
                    <rect width="320" height="140" fill="#1a1a1a" rx="10"/>
                    <text x="16" y="24" fill="#6366f1" fontSize="11" fontWeight="700" fontFamily="system-ui">Status do pedido #001</text>
                    <g transform="translate(16,36)">
                      {[
                        {label:"Recebido",done:true,active:false},
                        {label:"Planejamento",done:false,active:true},
                        {label:"Impressão",done:false,active:false},
                        {label:"Enviado",done:false,active:false},
                        {label:"Entregue",done:false,active:false},
                      ].map((st,i)=>(
                        <g key={i}>
                          <circle cx={i*72} cy="18" r="10"
                            fill={st.done?"#22c55e":st.active?"#6366f1":"#2a2a2a"}
                            stroke={st.done?"rgba(34,197,94,0.4)":st.active?"rgba(229,34,41,0.60)":"rgba(255,255,255,0.1)"} strokeWidth="1.5"/>
                          <text x={i*72} y="23" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{st.done?"✓":i+1}</text>
                          <text x={i*72} y="42" textAnchor="middle" fill={st.active?"#6366f1":"#555"} fontSize="8" fontFamily="system-ui">{st.label}</text>
                          {i<4&&<line x1={i*72+11} y1="18" x2={i*72+61} y2="18" stroke={st.done?"#22c55e":"rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={st.done?"0":"4 3"}/>}
                        </g>
                      ))}
                    </g>
                    <rect x="16" y="96" width="288" height="34" fill="#242424" rx="8" stroke="rgba(229,34,41,0.18)" strokeWidth="1"/>
                    <text x="28" y="110" fill="#6366f1" fontSize="10" fontWeight="700" fontFamily="system-ui">🔵 Em planejamento</text>
                    <text x="28" y="123" fill="#a0a0a0" fontSize="10" fontFamily="system-ui">Previsão de conclusão: 48h úteis · Cirurgia Guiada Unitária</text>
                  </svg>
                ),
              },
            ].map((step,idx)=>(
              <div key={idx} id={`tut-step-${idx}`} style={{marginBottom:24,background:C.dark2,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}
                ref={el=>{
                  if(!el) return;
                  const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setTutorialScrollStep(idx);},{threshold:.3});
                  obs.observe(el);
                }}>
                {/* Header da etapa */}
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:10,background:step.color+"18",border:`1px solid ${step.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>
                    {step.ico}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontSize:10,fontWeight:700,color:step.color,letterSpacing:.5,background:step.color+"14",border:`1px solid ${step.color}33`,borderRadius:20,padding:"1px 7px"}}>ETAPA {step.n}</span>
                      {step.phase&&<span style={{fontSize:10,color:C.textMut}}>{step.phase}</span>}
                    </div>
                    <div style={{fontSize:15,fontWeight:800,lineHeight:1.2}}>{step.title}</div>
                  </div>
                </div>
                {/* Ilustração SVG */}
                <div style={{padding:"16px 20px 0"}}>{step.svg}</div>
                {/* Descrição */}
                <div style={{padding:"14px 20px",fontSize:13,color:C.textSec,lineHeight:1.7}}>{step.desc}</div>
                {/* Dicas */}
                <div style={{margin:"0 20px 16px",background:step.color+"08",borderLeft:`3px solid ${step.color}`,borderRadius:"0 8px 8px 0",padding:"10px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:step.color,marginBottom:6,letterSpacing:.3}}>💡 DICAS</div>
                  {step.tips.map((tip,ti)=>(
                    <div key={ti} style={{fontSize:12,color:C.textSec,display:"flex",alignItems:"flex-start",gap:6,marginBottom:ti<step.tips.length-1?5:0,lineHeight:1.55}}>
                      <span style={{color:step.color,flexShrink:0,marginTop:1}}>✓</span>{tip}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Footer ── */}
            <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>Dúvidas? Fale com a D-CAD</div>
                  <div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>Suporte por WhatsApp em horário comercial — casos, arquivos e prazos.</div>
                </div>
                <a href="https://wa.me/5598985425982" target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:10,padding:"9px 14px",color:C.green,fontSize:12,fontWeight:700,textDecoration:"none",flexShrink:0}}>
                  💬 WhatsApp
                </a>
              </div>
              {/* Checkbox no local certo — após ler o tutorial */}
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:`1px solid ${C.border}`}}>
                <input type="checkbox" checked={tutorialNeverShow}
                  onChange={e=>setTutorialNeverShowAndSave(e.target.checked)}
                  style={{width:16,height:16,accentColor:C.red,cursor:"pointer",flexShrink:0}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>Não exibir este tutorial automaticamente</div>
                  <div style={{fontSize:11,color:C.textMut,marginTop:1}}>Você poderá acessar pelo botão "Tutorial do Sistema" no dashboard a qualquer momento.</div>
                </div>
              </label>
            </div>

            <button onClick={()=>setScreen("dashboard")}
              style={{width:"100%",padding:"13px 0",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
              ← Voltar ao Dashboard
            </button>
          </div>
        )}

        {screen==="patient"&&(
          <div style={{maxWidth:560,margin:"0 auto",paddingTop:isDesktop?32:8}}>
            <button onClick={()=>setScreen("dashboard")} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:C.textSec,fontSize:13,cursor:"pointer",padding:"0 0 16px 0",fontFamily:"inherit"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>Voltar ao dashboard
            </button>

            <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Selecionar paciente</div>
            <div style={{fontSize:13,color:C.textSec,marginBottom:20}}>Busque um paciente existente ou cadastre um novo.</div>

            {/* Busca */}
            <div style={{position:"relative",marginBottom:16}}>
              <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.4,pointerEvents:"none"}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={patSearch} onChange={e=>setPatSearch(e.target.value)}
                placeholder="Buscar paciente pelo nome..."
                style={{width:"100%",background:C.dark2,border:`1px solid ${patSearch?C.red:C.border}`,borderRadius:12,padding:"11px 14px 11px 38px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
              {patSearch&&<button onClick={()=>setPatSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
            </div>

            {/* Lista de pacientes */}
            {savedPatients.filter(p=>p.nome.toLowerCase().includes(patSearch.toLowerCase())).length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:8}}>
                  {patSearch?"RESULTADO DA BUSCA":"PACIENTES RECENTES"}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {patSearch&&savedPatients.filter(p=>p.nome.toLowerCase().includes(patSearch.toLowerCase())).length===0&&(
                  <div style={{textAlign:"center",padding:"20px 0",color:C.textSec}}>
                    <User size={28} style={{margin:"0 auto 8px",opacity:.3}}/>
                    <div style={{fontSize:13,fontWeight:600,color:C.textSec}}>Nenhum paciente encontrado para "{patSearch}"</div>
                    <div style={{fontSize:12,color:C.textSec,marginTop:4,opacity:.7}}>Cadastre um novo paciente abaixo ↓</div>
                  </div>
                )}
                {savedPatients
                    .filter(p=>p.nome.toLowerCase().includes(patSearch.toLowerCase()))
                    .map(p=>(
                    <button key={p.id} onClick={()=>{
                      // Save current cart if not empty
                      if(services.length>0&&patient){
                        setPendingCarts(pc=>[...pc.filter(c=>c.patientId!==patient.id),{patientId:patient.id,patientNome:patient.nome,services:[...services],total:totalAll,date:new Date().toLocaleDateString("pt-BR")}]);
                      }
                      setServices([]);
                      setPatient(p);
                      setPatSearch("");
                      setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});
                      setSpecialty(null);setService(null);setServiceType(null);setSelectedGroup(null);
                      setScreen("specialties");
                    }} style={{display:"flex",alignItems:"center",gap:12,background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=C.red}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                      <div style={{width:44,height:44,borderRadius:12,background:"rgba(229,34,41,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.textSec,flexShrink:0}}>
                        {p.nome.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{p.nome}</div>
                        {p.nasc&&<div style={{fontSize:13,color:C.textSec,marginTop:1}}>{calcAge(p.nasc)?`${calcAge(p.nasc)} · Nasc. ${p.nasc}`:p.nasc}</div>}
                      </div>
                      <div style={{fontSize:12,color:C.textSec,fontWeight:600,flexShrink:0}}>Selecionar →</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divisor */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:13,color:C.textSec,fontWeight:600,whiteSpace:"nowrap"}}>ou cadastrar novo paciente</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {/* Novo paciente */}
            <Field label="Nome completo *" value={patForm.nome} onChange={v=>setPatForm(f=>({...f,nome:v}))} placeholder="Ex: Maria das Graças Almeida"/>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>Data de nascimento *</label>
              <input value={patForm.nasc} onChange={e=>setPatForm(f=>({...f,nasc:maskDob(e.target.value)}))} placeholder="dd/mm/aaaa" inputMode="numeric" maxLength={10}
                style={{width:"100%",background:C.dark2,border:`1px solid ${patForm.nasc&&!calcAge(patForm.nasc)?C.red:patForm.nasc?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
              {patForm.nasc&&calcAge(patForm.nasc)&&<div style={{fontSize:13,color:C.green,marginTop:5,fontWeight:600}}>Idade: {calcAge(patForm.nasc)}</div>}
              {patForm.nasc.length===10&&!calcAge(patForm.nasc)&&<div style={{fontSize:13,color:C.red,marginTop:5}}>Data inválida. Verifique dia, mês e ano.</div>}
            </div>
            <button disabled={!patForm.nome.trim()||!calcAge(patForm.nasc)} onClick={()=>{
              const novo={id:"p"+Date.now(),nome:patForm.nome.trim(),nasc:patForm.nasc};
              setSavedPatients(list=>[novo,...list]);
              // Save current cart if not empty
              if(services.length>0&&patient){
                setPendingCarts(pc=>[...pc.filter(c=>c.patientId!==patient.id),{patientId:patient.id,patientNome:patient.nome,services:[...services],total:totalAll,date:new Date().toLocaleDateString("pt-BR")}]);
              }
              setServices([]);
              setPatient(novo);
              setPatForm({nome:"",nasc:""});
              setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});
              setSpecialty(null);setService(null);setServiceType(null);setSelectedGroup(null);
              setScreen("specialties");
            }} style={btnStyle(C.red,!patForm.nome.trim()||!calcAge(patForm.nasc))}>
              Cadastrar e continuar →
            </button>
          </div>
        )}

        {/* ════════════════════════════════
            SPECIALTIES
        ════════════════════════════════ */}
        {screen==="specialties"&&(
          <div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Escolha a especialidade</div>
              <div style={{fontSize:13,color:C.textSec}}>Selecione a área clínica para ver os serviços disponíveis.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {catalogLoading
                ? Array.from({length:8}).map((_,i)=>(
                    <div key={i} style={{borderRadius:12,background:"#111",overflow:"hidden",aspectRatio:"1/1"}}>
                      <div style={{height:3,background:"#333",width:"100%"}}/>
                      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100% - 3px)"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:"#222",animation:"pulse 1.2s ease-in-out infinite"}}/>
                      </div>
                    </div>
                  ))
                : catalog.map((sp)=>(
                <button key={sp.id}
                  onClick={()=>{setSpecialty(sp);setServiceType(null);setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});setScreen(["imp3d","consult"].includes(sp.id)?0:"serviceType");}}
                  style={{position:"relative",border:"none",borderRadius:12,cursor:"pointer",overflow:"hidden",padding:0,display:"flex",flexDirection:"column",background:"#111",transition:"transform .15s,box-shadow .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${sp.color}55`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{height:3,background:sp.color,width:"100%",flexShrink:0}}/>
                  <div style={{width:"100%",aspectRatio:"1/1",background:`${sp.color}12`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,position:"relative"}}>
                    {SPEC_IMGS[sp.id]
                      ? <img src={SPEC_IMGS[sp.id]} alt={sp.name}
                          style={{width:"100%",height:"100%",objectFit:"contain",padding:8,boxSizing:"border-box",display:"block"}}/>
                      : <SpecIcon id={sp.id} size={32} color={sp.color}/>
                    }
                    {discount>0&&<div style={{position:"absolute",top:4,right:4,fontSize:12,fontWeight:700,background:"rgba(34,197,94,0.92)",color:"#fff",padding:"1px 5px",borderRadius:16}}>-15%</div>}
                  </div>
                  <div style={{padding:"10px 10px 12px",background:"rgba(0,0,0,0.65)",flexShrink:0}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#fff",lineHeight:1.25,marginBottom:3,wordBreak:"break-word"}}>{sp.name}</div>
                    <div style={{fontSize:13,fontWeight:700,color:sp.color}}>{sp.services.length} serviço{sp.services.length===1?"":"s"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            SERVICES
        ════════════════════════════════ */}
        {screen==="services"&&specialty&&(
          <div>
            <BackBtn onClick={()=>["imp3d","consult"].includes(specialty.id)?setScreen("specialties"):setScreen("serviceType")}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:specialty.color+"20",display:"flex",alignItems:"center",justifyContent:"center",color:specialty.color}}><SpecIcon id={specialty.id} size={20} color={specialty.color}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:800}}>{specialty.name}</div>
                <div style={{fontSize:12,color:C.textSec}}>{specialty.desc}</div>
              </div>
            </div>
            {serviceType&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:serviceType==="print"?"rgba(34,197,94,0.06)":"rgba(234,179,8,0.06)",border:`1px solid ${serviceType==="print"?"rgba(34,197,94,0.2)":"rgba(234,179,8,0.2)"}`,borderRadius:12,padding:"8px 12px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{display:"flex"}}>{serviceType==="print"?<Printer size={16}/>:<Ruler size={16}/>}</span>
                  <span style={{fontSize:12,fontWeight:700,color:serviceType==="print"?C.green:C.yellow}}>
                    {serviceType==="print"?"Planejamento + Impressão 3D":"Somente Planejamento (arquivos digitais)"}
                  </span>
                </div>
                <button onClick={()=>setScreen("serviceType")} style={{background:"none",border:"none",color:C.textSec,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>alterar</button>
              </div>
            )}
            {/* Grupos de serviço — um card por grupo */}
            {(()=>{
              const isPlannedMode=serviceType==="planOnly";
              const groupMap=new Map();
              specialty.services.forEach(sv=>{
                if(isPlannedMode&&!sv.planOnly)return; // oculta grupos sem planOnly no modo planOnly
                const key=sv.type||sv.id;
                if(!groupMap.has(key))groupMap.set(key,{type:key,label:sv.groupLabel||sv.name,services:[]});
                groupMap.get(key).services.push(sv);
              });
              const groups=[...groupMap.values()].filter(g=>g.services.length>0);

              return groups.map(group=>{
                const isProtocol=group.type==="protocolo";
                const isParcialGroup=!isProtocol&&group.services.length>1&&!!group.services[0]?.priceByQty;
                // Para grupos de serviço único (unitária), pega o primeiro serviço direto
                const singleSv=group.services.length===1?group.services[0]:null;
                // Preço mínimo do grupo para exibição
                const minPrice=Math.min(...group.services.map(sv=>isPlannedMode&&sv.planOnly?sv.planOnly.price:sv.price));
                const hasVariablePrice=group.services.length>1&&!isProtocol;
                const isArchBased=group.services[0]?.usesArch;

                return(
                  <button key={group.type}
                    onClick={()=>{
                      if(isProtocol){
                        setSelectedGroup(group);
                        setScreen("serviceSubcat");
                      } else if(singleSv){
                        setService({...singleSv,...(isPlannedMode&&singleSv.planOnly?singleSv.planOnly:{})});
                        setScreen(0);
                      } else if(isParcialGroup){
                        // Parcial — vai direto, quantidade definida no odontograma
                        const sv=group.services[0];
                        setService({...sv,...(isPlannedMode&&sv.planOnly?sv.planOnly:{})});
                        setScreen(0);
                      } else {
                        setSelectedGroup(group);
                        setScreen("serviceSubcat");
                      }
                    }}
                    style={{width:"100%",display:"flex",flexDirection:"column",background:C.dark2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:0,cursor:"pointer",textAlign:"left",marginBottom:12,color:C.text,overflow:"hidden",transition:"border-color .15s,background .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=specialty.color;e.currentTarget.style.background="#222";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.dark2;}}>
                    <div style={{height:3,background:specialty.color,width:"100%"}}/>
                    <div style={{padding:"16px 16px",display:"flex",gap:16,alignItems:"flex-start"}}>
                      {/* Ícone */}
                      <div style={{width:48,height:48,borderRadius:12,background:specialty.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:specialty.color}}>
                        <SpecIcon id={specialty.id} size={24} color={specialty.color}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {/* Nome + preço */}
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:singleSv?6:4}}>
                          <div style={{fontWeight:800,fontSize:15,lineHeight:1.3}}>{group.label}</div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {hasVariablePrice&&<div style={{fontSize:12,color:C.textSec,marginBottom:2}}>a partir de</div>}
                            {isArchBased&&<div style={{fontSize:12,color:C.textSec,marginBottom:2}}>por arcada</div>}
                            <div style={{fontWeight:900,fontSize:15,color:specialty.color}}>{fmt(applyDiscount(minPrice))}</div>
                          </div>
                        </div>
                        {/* Subtítulo do grupo */}
                        <div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:(singleSv||isParcialGroup)&&8}}>
                          {isProtocol&&`${group.services.length} opções disponíveis — selecione para ver detalhes`}
                          {!isProtocol&&group.services.length>1&&!isParcialGroup&&`${group.services.length} variações · de 2 a 8 implantes — selecione para ver opções`}
                          {!isProtocol&&group.services.length===1&&group.services[0].desc}
                          {isParcialGroup&&group.services[0].desc}
                        </div>
                        {/* Descrição completa — Unitária e Parcial */}
                        {(singleSv||isParcialGroup)&&(
                          <div style={{fontSize:12,color:C.textSec,lineHeight:1.55,marginBottom:8}}>
                            {isPlannedMode&&(singleSv||group.services[0]).planOnly
                              ?(singleSv||group.services[0]).planOnly.fullDesc||(singleSv||group.services[0]).fullDesc
                              :(singleSv||group.services[0]).fullDesc}
                          </div>
                        )}
                        {/* Exames necessários + O que está incluso — lado a lado */}
                        {(singleSv||isParcialGroup)&&(()=>{
                          const sv0=singleSv||group.services[0];
                          const hasIncludes=sv0.includes?.length>0;
                          return(
                            <div style={{display:"grid",gridTemplateColumns:hasIncludes?"1fr 1fr":"1fr",gap:8,marginBottom:4}}>
                              {/* Exames */}
                              {sv0.exams?.length>0&&(
                                <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:8,padding:"7px 10px"}}>
                                  <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                                    <FileText size={10} color={C.textSec}/> ARQUIVOS NECESSÁRIOS
                                  </div>
                                  {sv0.exams.map((ex,ei)=>(
                                    <div key={ei} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                                      <span style={{color:C.textSec,flexShrink:0}}>·</span>{ex}
                                    </div>
                                  ))}
                                  <a href={EXAMS_MANUAL_URL} target="_blank" rel="noopener noreferrer"
                                    onClick={e=>e.stopPropagation()}
                                    style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:16,padding:"3px 9px",textDecoration:"none",cursor:"pointer"}}>
                                    <Search size={9} color={C.textSec}/>
                                    <span style={{fontSize:12,fontWeight:700,color:C.textSec}}>DÚVIDAS? CLIQUE AQUI</span>
                                  </a>
                                </div>
                              )}
                              {/* O que está incluso */}
                              {hasIncludes&&(
                                <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"7px 10px"}}>
                                  <div style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                                    <CheckCircle size={10} color={C.green}/> O QUE ESTÁ INCLUSO
                                  </div>
                                  {sv0.includes.map((item,i)=>(
                                    <div key={i} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                                      <span style={{color:C.green,flexShrink:0}}>✓</span>{item}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {/* Chevron apenas para protocolo */}
                        {isProtocol&&(
                          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6}}>
                            <ChevronLeft size={12} color={specialty.color} style={{transform:"rotate(180deg)"}}/>
                            <span style={{fontSize:13,color:specialty.color,fontWeight:600}}>Ver opções</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        )}

        {/* ════════════════════════════════
            SUBCATEGORIA (Parcial e Protocolo)
        ════════════════════════════════ */}
        {screen==="serviceSubcat"&&specialty&&selectedGroup&&(
          <div>
            <BackBtn onClick={()=>{setSelectedGroup(null);setScreen("services");}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:12,background:specialty.color+"20",display:"flex",alignItems:"center",justifyContent:"center",color:specialty.color}}><SpecIcon id={specialty.id} size={20} color={specialty.color}/></div>
              <div>
                <div style={{fontSize:18,fontWeight:800}}>{selectedGroup.label}</div>
                <div style={{fontSize:12,color:C.textSec}}>Selecione a variação do serviço</div>
              </div>
            </div>
            {selectedGroup.services.map(sv=>{
              const isPlannedMode=serviceType==="planOnly";
              // Em modo Somente Planejamento, serviços sem planOnly ficam desabilitados
              const unavailable=isPlannedMode&&!sv.planOnly;
              const disp=isPlannedMode&&sv.planOnly?{...sv,...sv.planOnly}:sv;
              const isArchBased=!!sv.usesArch;
              const archLabel=isArchBased?"por arcada":"";
              return(
                <button key={sv.id}
                  onClick={()=>{
                    if(unavailable)return;
                    setService({...sv,...(isPlannedMode&&sv.planOnly?sv.planOnly:{})});
                    setScreen(0);
                  }}
                  style={{width:"100%",display:"flex",flexDirection:"column",background:unavailable?"rgba(255,255,255,0.02)":C.dark2,border:`1.5px solid ${unavailable?"rgba(255,255,255,0.06)":C.border}`,borderRadius:12,padding:"0",cursor:unavailable?"not-allowed":"pointer",textAlign:"left",marginBottom:12,color:C.text,overflow:"hidden",transition:"border-color .15s,background .15s",opacity:unavailable?0.45:1}}
                  onMouseEnter={e=>{if(!unavailable){e.currentTarget.style.borderColor=specialty.color;e.currentTarget.style.background="#222";}}}
                  onMouseLeave={e=>{if(!unavailable){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.dark2;}}}>
                  {unavailable&&(
                    <div style={{background:"rgba(234,179,8,0.08)",borderBottom:`1px solid rgba(234,179,8,0.2)`,padding:"5px 14px",fontSize:12,fontWeight:700,color:C.yellow,letterSpacing:.3}}>
                      INDISPONÍVEL EM SOMENTE PLANEJAMENTO
                    </div>
                  )}
                  {/* Hero image / barra de cor */}
                  {sv.imageUrl?(
                    <div style={{position:"relative",width:"100%",height:140,overflow:"hidden",flexShrink:0}}>
                      <img src={sv.imageUrl} alt={sv.name} onError={e=>{e.target.parentElement.style.display="none";}}
                        style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.85) 100%)"}}/>
                      <div style={{position:"absolute",bottom:10,left:12,right:12}}>
                        <div style={{fontWeight:800,fontSize:15,color:"#fff",lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{disp.name}</div>
                        <div style={{fontWeight:900,fontSize:16,color:specialty.color,marginTop:2}}>{fmt(applyDiscount(disp.price))}</div>
                      </div>
                      <div style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <SpecIcon id={specialty.id} size={14} color={specialty.color}/>
                      </div>
                    </div>
                  ):(
                    <div style={{height:3,background:specialty.color,width:"100%"}}/>
                  )}
                  <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                    {/* Ícone / número — oculto quando tem hero image */}
                    {!sv.imageUrl&&<div style={{width:44,height:44,borderRadius:12,background:specialty.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {sv.exactQty
                        ?<span style={{fontSize:18,fontWeight:900,color:specialty.color}}>{sv.exactQty}</span>
                        :<SpecIcon id={specialty.id} size={20} color={specialty.color}/>
                      }
                    </div>}
                    <div style={{flex:1,minWidth:0}}>
                      {/* Nome + preço — oculto quando há hero image */}
                      {!sv.imageUrl&&(
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:5}}>
                          <div style={{fontWeight:800,fontSize:14,lineHeight:1.3}}>{disp.name}</div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {archLabel&&<div style={{fontSize:12,color:C.textSec,marginBottom:1}}>{archLabel}</div>}
                            <div style={{fontWeight:900,fontSize:15,color:specialty.color}}>{fmt(applyDiscount(disp.price))}</div>
                          </div>
                        </div>
                      )}
                      {/* Descrição */}
                      <div style={{fontSize:12,color:C.textSec,lineHeight:1.55,marginBottom:8}}>{disp.fullDesc}</div>
                      {/* Galeria de imagens */}
                      {sv.imagens?.length>0&&(
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {sv.imagens.map((url,i)=>(
                            <img key={i} src={url} alt={`${disp.name} ${i+1}`}
                              style={{width:56,height:56,objectFit:"cover",borderRadius:6,border:`1px solid ${specialty.color}30`,cursor:"pointer"}}
                              onClick={e=>{e.stopPropagation();window.open(url,"_blank");}}
                            />
                          ))}
                        </div>
                      )}
                      {/* Exames + O que está incluso — lado a lado */}
                      {(disp.exams?.length>0||sv.includes?.length>0)&&(
                        <div style={{display:"grid",gridTemplateColumns:sv.includes?.length?"1fr 1fr":"1fr",gap:8}}>
                          {disp.exams?.length>0&&(
                            <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                                <FileText size={10} color={C.textSec}/> ARQUIVOS NECESSÁRIOS
                              </div>
                              {disp.exams.map((ex,ei)=>(
                                <div key={ei} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                                  <span style={{color:C.textSec,flexShrink:0}}>·</span>{ex}
                                </div>
                              ))}
                              <a href={EXAMS_MANUAL_URL} target="_blank" rel="noopener noreferrer"
                                onClick={e=>e.stopPropagation()}
                                style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:16,padding:"3px 9px",textDecoration:"none",cursor:"pointer"}}>
                                <Search size={9} color={C.textSec}/>
                                <span style={{fontSize:12,fontWeight:700,color:C.textSec}}>DÚVIDAS? CLIQUE AQUI</span>
                              </a>
                            </div>
                          )}
                          {sv.includes?.length>0&&(
                            <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                                <CheckCircle size={10} color={C.green}/> O QUE ESTÁ INCLUSO
                              </div>
                              {sv.includes.map((item,i)=>(
                                <div key={i} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                                  <span style={{color:C.green,flexShrink:0}}>✓</span>{item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {!sv.planOnly&&serviceType==="planOnly"&&(
                        <div style={{fontSize:12,marginTop:8,fontWeight:600,color:C.textSec}}>
                          NÃO DISPONÍVEL NA MODALIDADE{" "}
                          <span style={{color:C.red,fontWeight:800}}>SOMENTE PLANEJAMENTO</span>
                        </div>
                      )}

                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════
            SERVICE TYPE SELECTION
        ════════════════════════════════ */}
        {screen==="serviceType"&&specialty&&(
          <div>
            <BackBtn onClick={()=>{setScreen("specialties");setSpecialty(null);}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:44,height:44,borderRadius:12,background:specialty.color+"20",display:"flex",alignItems:"center",justifyContent:"center",color:specialty.color}}>
                <SpecIcon id={specialty.id} size={18} color={specialty.color}/>
              </div>
              <div style={{fontWeight:800,fontSize:16}}>{specialty.name}</div>
            </div>
            <div style={{fontSize:13,color:C.textSec,marginBottom:24,lineHeight:1.6}}>Como você deseja contratar o seu serviço?</div>

            {/* Opção 1 — Com impressão */}
            <button onClick={()=>{setServiceType("print");setScreen("services");}}
              style={{width:"100%",display:"flex",gap:16,alignItems:"flex-start",background:C.dark2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"18px 16px",cursor:"pointer",textAlign:"left",marginBottom:12,color:C.text,transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=specialty.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:44,height:44,borderRadius:12,background:specialty.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:specialty.color}}><Printer size={22}/></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>Planejamento + Impressão 3D</div>
                <div style={{fontSize:12,color:C.textSec,lineHeight:1.6}}>A D-CAD realiza o planejamento digital e entrega o dispositivo físico impresso em 3D (guias, placas, modelos e etc) pronto para uso na sua clínica.</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,background:C.greenBg,border:"1px solid rgba(34,197,94,0.2)",borderRadius:16,padding:"3px 10px"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.green}}>Recomendado</span>
                </div>
              </div>
              <div style={{color:C.textSec,fontSize:18,flexShrink:0,marginTop:2}}>›</div>
            </button>

            {/* Opção 2 — Só planejamento (apenas se o serviço oferecer) */}
            {(()=>{
              // Verifica se algum serviço da especialidade oferece planOnly
              const anyPlanOnly=specialty.services.some(sv=>sv.planOnly);
              if(!anyPlanOnly)return(
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 16px",display:"flex",gap:16,alignItems:"center",opacity:.45}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(234,179,8,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.textMut}}><Ruler size={22}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14,marginBottom:4,color:C.textSec}}>Somente Planejamento</div>
                    <div style={{fontSize:12,color:C.textMut,lineHeight:1.6}}>Não disponível para os serviços desta categoria.</div>
                  </div>
                </div>
              );
              return(
                <button onClick={()=>setShowDisclaimer(true)}
                  style={{width:"100%",display:"flex",gap:16,alignItems:"flex-start",background:C.dark2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"18px 16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(234,179,8,0.5)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(234,179,8,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#EAB308"}}><Ruler size={22}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>Somente Planejamento</div>
                    <div style={{fontSize:12,color:C.textSec,lineHeight:1.6}}>A D-CAD entrega apenas os arquivos digitais do planejamento. Você realiza a impressão 3D na sua clínica ou laboratório.</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:16,padding:"3px 10px"}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.yellow}}>Requer impressora 3D própria</span>
                    </div>
                  </div>
                  <div style={{color:C.textSec,fontSize:18,flexShrink:0,marginTop:2}}>›</div>
                </button>
              );
            })()}
          </div>
        )}

        {/* ════════════════════════════════
            STEP 0 — PRÉ-PLANEJAMENTO
        ════════════════════════════════ */}
        {screen===0&&(
          <Step title="Deseja realizar um pré-planejamento?" sub="Análise prévia de viabilidade antes do planejamento completo." badge="Pré-Plan" badgeColor={C.yellow} onBack={()=>{if(["imp3d","consult"].includes(specialty?.id)){setScreen("specialties");setSpecialty(null);}else if(selectedGroup){setScreen("serviceSubcat");}else{setScreen("services");}}}>
            <div style={{background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.25)",borderRadius:12,padding:"11px 14px",marginBottom:16,fontSize:13,lineHeight:1.6}}>
              O pré-planejamento é cobrado à parte. Se o caso tiver viabilidade, o valor é integralmente descontado do serviço principal.{" "}
              <button onClick={()=>setShowRules(true)} style={{background:"none",border:"none",color:C.yellow,fontWeight:700,fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>Ver regras</button>
              <div style={{marginTop:8,fontSize:12,color:C.textSec}}>
                <b style={{color:C.text}}>Arquivo necessário:</b> Tomografia (DICOM) da arcada de interesse
              </div>
            </div>
            <button onClick={()=>setShowPreplanConfirm(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:C.dark2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 15px",cursor:"pointer",textAlign:"left",marginBottom:7,color:C.text}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Search size={16} color={C.textSec}/>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>Sim — contratar pré-planejamento</div>
                  <div style={{fontSize:13,color:C.textSec,marginTop:2}}>Análise prévia de viabilidade do caso clínico</div>
                </div>
              </div>
              <div style={{fontWeight:900,fontSize:15,color:C.red,flexShrink:0}}>{fmt(P.preplan)}</div>
            </button>
            <button onClick={()=>{set("preplan","nao");setScreen(1);}} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:8,background:C.dark2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 15px",cursor:"pointer",textAlign:"left",color:C.text}}>
              <Zap size={16} color={C.textSec}/>
              <div><div style={{fontSize:14,fontWeight:700}}>Não — ir direto ao planejamento</div><div style={{fontSize:13,color:C.textSec,marginTop:2}}>Iniciar o planejamento sem análise prévia</div></div>
            </button>
          </Step>
        )}

        {/* PREPLAN CHECKOUT */}
        {screen==="preplanCO"&&(
          <div style={{display:isDesktop?"grid":"block",gridTemplateColumns:isDesktop?"1.2fr 1fr":"1fr",gap:isDesktop?32:0,alignItems:"start"}}>
          <div>
            {/* Header igual ao resumo */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
              <div style={{width:42,height:42,borderRadius:12,background:"rgba(234,179,8,0.08)",display:"flex",alignItems:"center",justifyContent:"center",color:C.yellow}}><Search size={22}/></div>
              <div>
                <div style={{fontSize:18,fontWeight:800}}>Pré-planejamento configurado!</div>
                <div style={{fontSize:13,color:C.textSec}}>Paciente: {patient?.nome||"Não informado"}</div>
              </div>
            </div>
            {/* Card do pré-planejamento — empilhado, igual ao resumo */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
              <div style={{background:C.dark2,border:`1px solid rgba(234,179,8,0.3)`,borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontSize:12,background:C.yellow,color:"#111",padding:"2px 8px",borderRadius:16,fontWeight:700}}>PRÉ-PLANEJAMENTO</span>
                  </div>
                  <div style={{fontSize:13,color:C.textSec}}>{specialty?.name}</div>
                  <div style={{fontWeight:700,fontSize:14,marginTop:2}}>Pré-planejamento</div>
                  <div style={{fontSize:12,color:C.textSec,marginTop:2}}>Prazo: 7 dias corridos · Valor abatido se aprovado</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:900,color:C.yellow}}>{fmt(P.preplan)}</div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{position:"relative"}}>
                      <button onClick={()=>setScreen(0)}
                        style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.18)";e.currentTarget.nextSibling.style.opacity="1";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                        <Pencil size={14} color={C.textSec}/>
                      </button>
                      <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Editar</div>
                    </div>
                    <div style={{position:"relative"}}>
                      <button onClick={()=>setConfirmDeleteId("preplan")}
                        style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.22)";e.currentTarget.nextSibling.style.opacity="1";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                        <Trash2 size={14} color={C.red}/>
                      </button>
                      <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Remover</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Nota informativa */}
            <div style={{background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.textSec,lineHeight:1.6}}>
              Após o pagamento, envie os arquivos pelo portal. Se o caso tiver viabilidade, {fmt(P.preplan)} será descontado.{" "}
              <button onClick={()=>setShowRules(true)} style={{background:"none",border:"none",color:C.textSec,fontWeight:700,fontSize:12,cursor:"pointer",textDecoration:"underline",padding:0}}>Ver regras</button>
            </div>
            {/* Total */}
            <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.2)",borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:800,fontSize:15}}>Total do pedido</span>
                <span style={{fontSize:22,fontWeight:900,color:C.red}}>{fmt(P.preplan)}</span>
              </div>
            </div>
          </div>
          {/* Coluna checkout */}
          <div style={{position:isDesktop?"sticky":"static",top:isDesktop?80:0,marginTop:isDesktop?0:16}}>
            <InfinitePayCheckout amount={P.preplan} services={[{name:"Pré-planejamento",specialty:"D-CAD",total:P.preplan}]} patient={patient} dentist={dentist} freight={{method:"none",value:0}} couponDiscount={0} profileComplete={profileComplete} onProfileIncomplete={()=>setScreen("profile")} onOrderPending={registerPendingPayment} onBackToDashboard={()=>setScreen("dashboard")}/>
          </div>
          </div>
        )}

        {/* STEP 1 — ODONTOGRAMA ou ARCADA */}
        {screen===1&&(
          service?.usesArch
          /* ── Seleção de arcada (Protocolos / Stackable) ── */
          ? <Step title="Selecione a(s) arcada(s)" sub="Selecione a(s) arcada(s) do caso." badge="Arcada" badgeColor={C.red} onBack={()=>setScreen(0)}>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {[{key:"sup",label:"Arcada Superior"},{key:"inf",label:"Arcada Inferior"}].map(arc=>{
                  const sel=A.arch[arc.key];
                  return(
                    <button key={arc.key} onClick={()=>setA(a=>({...a,arch:{...a.arch,[arc.key]:!a.arch[arc.key]}}))}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:sel?"rgba(229,34,41,0.10)":C.dark2,border:`1.5px solid ${sel?C.red:C.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                      <div style={{width:22,height:22,borderRadius:8,background:sel?C.red:C.dark3,border:`2px solid ${sel?C.red:C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>
                        {sel?"✓":""}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:800,color:sel?C.red:"#fff"}}>{arc.label}</div>
                      </div>
                      {service.archAffectsPrice&&sel&&(
                        <div style={{fontSize:13,fontWeight:800,color:C.textSec,flexShrink:0}}>+{fmt(service.price)}</div>
                      )}
                    </button>
                  );
                })}
              </div>
              {(A.arch.sup||A.arch.inf)&&(
                <div style={{background:C.dark3,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.textSec}}>{[A.arch.sup&&"Superior",A.arch.inf&&"Inferior"].filter(Boolean).join(" + ")}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,color:C.textSec,marginBottom:2}}>Subtotal</div>
                    <span style={{fontSize:16,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
                  </div>
                </div>
              )}
              <Btn disabled={!A.arch.sup&&!A.arch.inf} onClick={()=>setScreen("implantQty")}>Continuar — Quantidade de implantes</Btn>
            </Step>
          /* ── Odontograma (Guiada Unitária / Parcial) ── */
          : <Step title="Selecione o(s) dente(s) no odontograma"
              sub={service?.exactQty
                ?`Selecione exatamente ${service.exactQty} dente${service.exactQty>1?"s":""} para marcar os implantes.`
                :"Selecione o dente do implante."}
              badge="Dentes" badgeColor={C.red} onBack={()=>setScreen(0)}>
              {/* Contador de seleção */}
              {(()=>{
                const isParcial=!!service?.priceByQty;
                const supCount=A.teeth.filter(t=>SUP_ALL.includes(t)).length;
                const infCount=A.teeth.filter(t=>!SUP_ALL.includes(t)).length;
                if(isParcial){
                  const pbyq=serviceType==="planOnly"&&service?.planOnly?.priceByQty?service.planOnly.priceByQty:service.priceByQty;
                  const supValid=supCount>=2;
                  const infValid=infCount>=2;
                  const supPrice=supValid?(pbyq[Math.min(supCount,8)]||0):0;
                  const infPrice=infValid?(pbyq[Math.min(infCount,8)]||0):0;
                  const total=supPrice+infPrice;
                  return(
                    <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:8,letterSpacing:.5}}>SELEÇÃO DE IMPLANTES</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div style={{background:supValid?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${supValid?"rgba(34,197,94,0.3)":C.border}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontSize:12,color:C.textSec,marginBottom:2}}>Arcada Superior</div>
                          <div style={{fontSize:20,fontWeight:900,color:supValid?C.green:C.textSec}}>{supCount}</div>
                          <div style={{fontSize:12,color:supValid?C.green:C.textSec}}>{supValid?`${fmt(supPrice)}`:"mín. 2"}</div>
                        </div>
                        <div style={{background:infValid?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${infValid?"rgba(34,197,94,0.3)":C.border}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontSize:12,color:C.textSec,marginBottom:2}}>Arcada Inferior</div>
                          <div style={{fontSize:20,fontWeight:900,color:infValid?C.green:C.textSec}}>{infCount}</div>
                          <div style={{fontSize:12,color:infValid?C.green:C.textSec}}>{infValid?`${fmt(infPrice)}`:"mín. 2"}</div>
                        </div>
                      </div>
                      {total>0&&(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                          <span style={{fontSize:12,color:C.textSec}}>Total estimado</span>
                          <span style={{fontSize:16,fontWeight:900,color:C.red}}>{fmt(applyDiscount(total))}</span>
                        </div>
                      )}
                      {A.teeth.length===0&&<div style={{fontSize:13,color:C.textSec,textAlign:"center",marginTop:4}}>Selecione os dentes no odontograma (mín. 2 por arcada)</div>}
                    </div>
                  );
                }
                if(service?.exactQty){
                  const limit=service.exactQty;
                  const hasSupInf=supCount>0&&infCount>0;
                  const total=A.teeth.length;
                  return(
                    <div style={{background:hasSupInf?"rgba(234,179,8,0.08)":total===limit?"rgba(34,197,94,0.08)":"rgba(229,34,41,0.06)",border:`1px solid ${hasSupInf?"rgba(234,179,8,0.35)":total===limit?"rgba(34,197,94,0.3)":"rgba(229,34,41,0.18)"}`,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasSupInf?6:0}}>
                        <span style={{fontSize:13,color:C.textSec}}>
                          {total===0?"Nenhum dente selecionado":hasSupInf?`Superior: ${supCount}/${limit} · Inferior: ${infCount}/${limit}`:`${total}/${limit} dente${limit>1?"s":""}`}
                        </span>
                        <span style={{fontSize:13,fontWeight:800,color:hasSupInf?C.yellow:total===limit?C.green:C.red}}>
                          {hasSupInf?`×2 guias`:`${total}/${limit}`}
                        </span>
                      </div>
                      {hasSupInf&&<div style={{fontSize:13,color:C.yellow,display:"flex",alignItems:"center",gap:5}}><AlertTriangle size={11}/> Ambas as arcadas — valor dobrado</div>}
                    </div>
                  );
                }
                return null;
              })()}
              <Odontogram selected={A.teeth} onToggle={toggleTooth}/>
              {/* Aviso de limite atingido */}
              {A.teeth.length>0&&(()=>{
                const maxPerArc=service?.priceByQty?8:(service?.exactQty||service?.maxTeeth||1);
                const supCount=A.teeth.filter(t=>SUP_ALL.includes(t)).length;
                const infCount=A.teeth.filter(t=>!SUP_ALL.includes(t)).length;
                const supFull=supCount>=maxPerArc;
                const infFull=infCount>=maxPerArc;
                if(!supFull&&!infFull) return null;
                return(
                  <div style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:8,padding:"7px 12px",marginBottom:8,fontSize:13,color:C.yellow,display:"flex",alignItems:"center",gap:8}}>
                    <AlertTriangle size={12}/>
                    {supFull&&infFull?"Limite atingido nas duas arcadas.":supFull?"Limite atingido na arcada superior.":"Limite atingido na arcada inferior."}
                    {" "}Clique em um dente marcado para desselecioná-lo.
                  </div>
                );
              })()}
              {(()=>{
                const isParcial=!!service?.priceByQty;
                const supCount=A.teeth.filter(t=>SUP_ALL.includes(t)).length;
                const infCount=A.teeth.filter(t=>!SUP_ALL.includes(t)).length;
                const parcialReady=isParcial&&(supCount>=2||infCount>=2);
                const fixedReady=!isParcial&&(service?.exactQty?A.teeth.length===service.exactQty:A.teeth.length>0);
                const isReady=parcialReady||fixedReady;
                const remaining=isParcial
                  ?`Selecione ao menos 2 dentes em uma arcada`
                  :`Selecione ${(service?.exactQty||1)-A.teeth.length} dente${((service?.exactQty||1)-A.teeth.length)>1?"s":""}`;
                return(
                  <Btn disabled={!isReady} onClick={()=>{
                    if(isParcial){
                      const anteriorSup=[11,12,13,21,22,23];
                      const hasAnterior=A.teeth.some(t=>anteriorSup.includes(t));
                      setScreen(hasAnterior?"protoCompl":2);
                    } else {
                      setScreen(2);
                    }
                  }}>
                    {isReady?(isParcial?"Continuar":"Continuar — Marca do Implante"):remaining}
                  </Btn>
                );
              })()}
            </Step>
        )}

        {/* STEP 1b — TIPO DE CASO (Protocolo) */}
        {screen==="implantQty"&&service?.usesArch&&(()=>{
          const bothArches=A.arch.sup&&A.arch.inf;
          const opts=[
            {qty:4,label:"ALL-ON-4",sub:"4 implantes"},
            {qty:5,label:"ALL-ON-X",sub:"5 implantes"},
            {qty:6,label:"ALL-ON-6",sub:"6 implantes"},
          ];
          const getVal=(arc)=>bothArches?(typeof A.implantQty==="object"?A.implantQty?.[arc]||null:null):A.implantQty;
          const setVal=(arc,qty)=>setA(a=>({...a,implantQty:bothArches?{...(typeof a.implantQty==="object"?a.implantQty:{sup:null,inf:null}),[arc]:qty}:qty}));
          const isReady=bothArches?(getVal("sup")!==null&&getVal("inf")!==null):A.implantQty!==null;

          return(
            <Step title="Tipo de caso" sub={bothArches?"Selecione o tipo de caso para cada arcada.":"Selecione a quantidade de implantes planejada."} badge="Tipo de Caso" badgeColor={C.red} onBack={()=>setScreen(1)}>
              {bothArches
                /* ── DUAS ARCADAS: coluna por arcada ── */
                ?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  {[{arc:"sup",label:"Superior"},{arc:"inf",label:"Inferior"}].map(({arc,label})=>(
                    <div key={arc} style={{display:"flex",flexDirection:"column",gap:8}}>
                      {/* Cabeçalho da coluna */}
                      <div style={{background:`rgba(229,34,41,0.08)`,border:"1px solid rgba(229,34,41,0.18)",borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:.5}}>ARCADA {label.toUpperCase()}</div>
                        {getVal(arc)&&<div style={{fontSize:13,color:C.textSec,fontWeight:600,marginTop:1}}>{opts.find(o=>o.qty===getVal(arc))?.label}</div>}
                      </div>
                      {/* 3 opções empilhadas */}
                      {opts.map(opt=>{
                        const sel=getVal(arc)===opt.qty;
                        return(
                          <button key={opt.qty} onClick={()=>setVal(arc,opt.qty)}
                            style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:sel?"rgba(229,34,41,0.12)":C.dark2,border:`2px solid ${sel?C.red:C.border}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",color:C.text,transition:"border-color .15s,background .15s",position:"relative"}}>
                            {sel&&<div style={{position:"absolute",top:5,right:5,width:14,height:14,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:800}}>✓</div>}
                            <div style={{fontSize:13,fontWeight:900,color:sel?C.red:"#fff"}}>{opt.label}</div>
                            <div style={{fontSize:12,color:C.textSec}}>{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                /* ── ARCADA ÚNICA: lista 1×1 ── */
                :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                  {opts.map(opt=>{
                    const sel=A.implantQty===opt.qty;
                    return(
                      <button key={opt.qty} onClick={()=>setA(a=>({...a,implantQty:opt.qty}))}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:sel?"rgba(229,34,41,0.12)":C.dark2,border:`2px solid ${sel?C.red:C.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                        <div style={{width:56,height:52,borderRadius:12,background:sel?C.red:"rgba(229,34,41,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontSize:14,fontWeight:900,color:sel?"#fff":C.red}}>{opt.label}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:16,fontWeight:800,color:sel?C.red:"#fff"}}>{opt.label}</div>
                          <div style={{fontSize:12,color:C.textSec,marginTop:2}}>{opt.sub} na arcada selecionada</div>
                        </div>
                        {sel&&<div style={{width:22,height:22,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800,flexShrink:0}}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              }
              {/* Resumo */}
              {isReady&&(
                <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                  {bothArches
                    ?<>
                      <div style={{fontSize:12,color:C.textSec}}>Superior: <b style={{color:C.textSec}}>{opts.find(o=>o.qty===getVal("sup"))?.label}</b> · {getVal("sup")} implantes</div>
                      <div style={{fontSize:12,color:C.textSec,marginTop:3}}>Inferior: <b style={{color:C.textSec}}>{opts.find(o=>o.qty===getVal("inf"))?.label}</b> · {getVal("inf")} implantes</div>
                      <div style={{fontSize:12,color:C.textSec,fontWeight:700,marginTop:6,borderTop:`1px solid rgba(229,34,41,0.12)`,paddingTop:6}}>Total: {(getVal("sup")||0)+(getVal("inf")||0)} implantes</div>
                    </>
                    :<div style={{fontSize:12,color:C.textSec}}>{opts.find(o=>o.qty===A.implantQty)?.label} · {A.implantQty} implantes na arcada selecionada</div>
                  }
                </div>
              )}
              <Btn disabled={!isReady} onClick={()=>isStackable?setScreen(2):setScreen("protoCompl")}>
                {isStackable?"Continuar — Marca do Implante":"Continuar — Serviço complementar"}
              </Btn>
            </Step>
          );
        })()}

        {/* STEP — SERVIÇO COMPLEMENTAR (Protocolo e Parcial) */}
        {screen==="protoCompl"&&(service?.usesArch||isParcial)&&(
          <Step title="Serviço complementar" sub="Opcional. Adicione o planejamento digital do sorriso para orientar o posicionamento dos implantes." badge="Serviço Complementar" badgeColor={C.red} onBack={()=>isParcial?setScreen(1):setScreen("implantQty")}>
            {/* Card do serviço complementar */}
            <div style={{marginBottom:16}}>
              <button onClick={()=>setA(a=>({...a,dsd3dAddon:!a.dsd3dAddon}))}
                style={{width:"100%",display:"flex",flexDirection:"column",background:A.dsd3dAddon?"rgba(34,197,94,0.06)":C.dark2,border:`2px solid ${A.dsd3dAddon?C.green:C.border}`,borderRadius:12,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",transition:"border-color .15s,background .15s"}}>
                <div style={{height:3,background:A.dsd3dAddon?C.green:"#EA580C",width:"100%"}}/>
                <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  {/* Checkbox */}
                  <div style={{width:24,height:24,borderRadius:8,background:A.dsd3dAddon?C.green:C.dark3,border:`2px solid ${A.dsd3dAddon?C.green:C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#111",fontSize:13,fontWeight:800,marginTop:2}}>
                    {A.dsd3dAddon?"✓":""}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    {/* Nome + preço */}
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:6}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:15,color:A.dsd3dAddon?C.green:"#fff",lineHeight:1.3}}>
                          Planejamento Digital do Sorriso 3D{isParcial?" — Até 6 Dentes":""}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3,flexWrap:"wrap"}}>
                          <div style={{fontSize:13,color:"#EA580C",fontWeight:600}}>Estética Dental · Somente Planejamento</div>
                          {isParcial&&(
                            <span style={{fontSize:12,fontWeight:800,background:"rgba(34,197,94,0.12)",color:C.green,padding:"2px 8px",borderRadius:16,border:"1px solid rgba(34,197,94,0.3)",letterSpacing:.3}}>RECOMENDADO</span>
                          )}
                          {service?.id==="proto_parc"&&(
                            <span style={{fontSize:12,fontWeight:800,background:"rgba(229,34,41,0.15)",color:C.red,padding:"2px 8px",borderRadius:16,border:"1px solid rgba(229,34,41,0.3)",letterSpacing:.3}}>ALTAMENTE RECOMENDADO</span>
                          )}
                          {service?.id==="proto_total"&&(
                            <span style={{fontSize:12,fontWeight:800,background:"rgba(34,197,94,0.12)",color:C.green,padding:"2px 8px",borderRadius:16,border:"1px solid rgba(34,197,94,0.3)",letterSpacing:.3}}>RECOMENDADO</span>
                          )}
                        </div>
                        {/* Destaque para a Parcial */}
                        {isParcial&&(
                          <div style={{fontSize:13,color:C.yellow,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:8,padding:"6px 10px",marginTop:8,lineHeight:1.5}}>
                            ⭐ Recomendado para casos que envolvam dentes anteriores superiores e que tenham alta demanda estética.
                          </div>
                        )}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:13,color:C.textSec,marginBottom:2}}>adicional</div>
                        <div style={{fontWeight:900,fontSize:16,color:A.dsd3dAddon?C.green:C.textSec}}>+{fmt(P.dsd3dProto)}</div>
                      </div>
                    </div>
                    {/* Descrição */}
                    <div style={{fontSize:12,color:C.textSec,lineHeight:1.6,marginBottom:10}}>
                      Criação do projeto digital da futura prótese em 3D para orientar o posicionamento ideal dos implantes. Entregue como arquivo digital (Somente Planejamento), integrado ao planejamento cirúrgico.
                    </div>
                    {/* Exames + Incluso */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:8,padding:"7px 10px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                          <FileText size={10} color={C.textSec}/> ARQUIVOS NECESSÁRIOS
                        </div>
                        {["Protocolo fotográfico (JPEG)","Modelo digital das arcadas (arquivo STL)"].map((ex,i)=>(
                          <div key={i} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                            <span style={{color:C.textSec,flexShrink:0}}>·</span>{ex}
                          </div>
                        ))}
                      </div>
                      <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"7px 10px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                          <CheckCircle size={10} color={C.green}/> O QUE ESTÁ INCLUSO
                        </div>
                        {["Projeto 3D da futura prótese","Arquivo digital para orientação do protocolo","A definir — itens serão atualizados em breve"].map((item,i)=>(
                          <div key={i} style={{fontSize:13,color:C.textSec,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                            <span style={{color:C.green,flexShrink:0}}>✓</span>{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            {/* Resumo */}
            {A.dsd3dAddon&&(
              <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:C.green,fontWeight:600}}>✓ Planejamento Digital do Sorriso 3D incluído</span>
                <span style={{fontSize:13,fontWeight:800,color:C.green}}>+{fmt(P.dsd3dProto)}</span>
              </div>
            )}
            <Btn onClick={()=>{
              if(!A.dsd3dAddon&&(service?.id==="proto_total"||service?.id==="proto_parc"||isParcial)){
                setShowProtoWarning(true);
              } else {
                setScreen(2);
              }
            }}>
              {A.dsd3dAddon?"Continuar — Marca do Implante":"Pular e continuar — Marca do Implante"}
            </Btn>
          </Step>
        )}

        {/* STEP 2 — MARCA */}
        {screen===2&&(
          <Step title="Qual a marca do implante?" sub="O kit e o modelo serão filtrados pela marca selecionada." badge="Marca do Implante" badgeColor={C.red} onBack={()=>{
            if(isProto) return setScreen("protoCompl");
            if(isParcial){
              const anteriorSup=[11,12,13,21,22,23];
              return setScreen(A.teeth.some(t=>anteriorSup.includes(t))?"protoCompl":1);
            }
            setScreen(1);
          }}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {BRANDS.map(b=>{
                const sel=A.brand===b;
                const hasFee=!!(service?.brandFees?.[b]||(b==="STRAUMANN"?P.strauAdd:0));
                return(
                  <button key={b} onClick={()=>setA(a=>({...a,brand:b,kit:null,model:null,modelText:""}))}
                    style={{background:sel?"rgba(229,34,41,0.12)":C.dark2,border:`1.5px solid ${sel?C.red:C.border}`,borderRadius:12,padding:"13px 13px",cursor:"pointer",textAlign:"left",color:sel?C.red:C.text,transition:"border-color .15s,background .15s"}}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{b}</div>
                    <div style={{fontSize:13,color:C.textSec}}>{kitsFor(b).length} kit(s)</div>
                  </button>
                );
              })}
            </div>
            {/* Aviso de valor diferenciado apenas após selecionar Straumann */}
            {A.brand==="STRAUMANN"&&(
              <div style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <AlertTriangle size={14} color={C.yellow}/>
                <div style={{fontSize:12,color:C.textSec}}>Esta marca possui valor diferenciado. O adicional será exibido no resumo do pedido.</div>
              </div>
            )}
            <Btn disabled={!A.brand} onClick={()=>setScreen(3)}>Continuar — Kit cirúrgico</Btn>
          </Step>
        )}

        {/* STEP 3 — KIT */}
        {screen===3&&(
          <Step title={`Kit cirúrgico — ${A.brand}`} sub="Os modelos disponíveis serão filtrados pelo kit." badge="Kit Cirúrgico" badgeColor={C.red} onBack={()=>setScreen(2)}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {kitsFor(A.brand).map(kit=>(
                <button key={kit} onClick={()=>setA(a=>({...a,kit,model:null,modelText:""}))}
                  style={{background:A.kit===kit?"rgba(229,34,41,0.12)":C.dark2,border:`1.5px solid ${A.kit===kit?C.red:C.border}`,borderRadius:12,padding:"13px 12px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                  <div style={{fontWeight:700,fontSize:13,color:A.kit===kit?C.red:C.text,marginBottom:3}}>{kit}</div>
                  <div style={{fontSize:13,color:C.textSec}}>{modelsFor(A.brand,kit).length} modelo(s)</div>
                  {A.kit===kit&&<div style={{fontSize:12,color:C.red,fontWeight:700,marginTop:4}}>✓ Selecionado</div>}
                </button>
              ))}
            </div>
            {A.brand==="STRAUMANN"&&A.kit&&<div style={{background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.25)",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13}}>Adicional Straumann: +{fmt(P.strauAdd)}</div>}
            <Btn disabled={!A.kit} onClick={()=>setScreen(4)}>Continuar — Modelo do implante</Btn>
          </Step>
        )}

        {/* STEP 4 — MODELO */}
        {screen===4&&(
          <Step title={`Modelo — ${A.kit}`} sub={`Modelos compatíveis com ${A.kit} · ${A.brand}.`} badge="Modelo do Implante" badgeColor={C.red} onBack={()=>setScreen(3)}>
            {modelsFor(A.brand,A.kit).length>0
              ?<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {modelsFor(A.brand,A.kit).map(model=>(
                  <button key={model} onClick={()=>set("model",model)}
                    style={{background:A.model===model?"rgba(229,34,41,0.12)":C.dark2,border:`1.5px solid ${A.model===model?C.red:C.border}`,borderRadius:12,padding:"13px 12px",cursor:"pointer",textAlign:"left",color:A.model===model?C.red:C.text,fontWeight:A.model===model?700:400,fontSize:13,transition:"border-color .15s,background .15s"}}>
                    <div style={{fontWeight:700,fontSize:13,color:A.model===model?C.red:C.text,marginBottom:3,wordBreak:"break-word"}}>{model}</div>
                    {A.model===model&&<div style={{fontSize:12,color:C.red,fontWeight:700,marginTop:4}}>✓ Selecionado</div>}
                  </button>
                ))}
              </div></>
              :<><div style={{background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.25)",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13}}>Informe o modelo manualmente.</div>
              <input value={A.modelText} onChange={e=>set("modelText",e.target.value)} placeholder="Ex: BLT Ø 4.1 mm"
                style={{width:"100%",background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:14}}/></>
            }
            <Btn disabled={modelsFor(A.brand,A.kit).length>0?!A.model:!A.modelText.trim()} onClick={()=>isStackable?setScreen(6):setScreen(5)}>
              {isStackable?"Continuar — Prazo de planejamento":"Continuar — Serviços Adicionais"}
            </Btn>
          </Step>
        )}

        {/* STEP 5 — SERVIÇOS ADICIONAIS */}
        {screen===5&&service?.id==="stackable"&&(
          <Step title="Serviços adicionais" sub="O Stackable Guide já contempla todos os serviços adicionais." badge="Serviços Adicionais" badgeColor={C.green} onBack={()=>setScreen(4)}>
            <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:12,padding:"16px",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <CheckCircle size={20} color={C.green}/>
                <div style={{fontSize:15,fontWeight:800,color:C.green}}>Serviços adicionais já inclusos</div>
              </div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.7}}>
                O Stackable Guide é um serviço completo que já contempla todos os itens adicionais. Não há serviços opcionais a selecionar nesta etapa.
              </div>
            </div>
            <div style={{padding:"11px 14px",background:C.dark3,borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <span style={{fontSize:13,color:C.textSec}}>Subtotal estimado</span>
              <span style={{fontSize:18,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
            </div>
            <Btn onClick={()=>setScreen(6)}>Continuar — Prazo de planejamento</Btn>
          </Step>
        )}
        {screen===5&&service?.id!=="stackable"&&(
          <Step title="Serviços adicionais" sub={service?.usesArch?"Selecione os serviços adicionais para o protocolo.":"Selecione quais dentes receberão cada serviço adicional."} badge="Serviços Adicionais" badgeColor={C.green} onBack={()=>setScreen(4)}>
            {/* Tags Somente Planejamento */}
            {serviceType==="planOnly"&&(
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:700,background:"rgba(234,179,8,0.12)",color:C.yellow,padding:"4px 12px",borderRadius:16,border:"1px solid rgba(234,179,8,0.3)",letterSpacing:.3}}>SOMENTE ARQUIVO DIGITAL</span>
                <span style={{fontSize:13,fontWeight:700,background:"rgba(229,34,41,0.08)",color:C.red,padding:"4px 12px",borderRadius:16,border:"1px solid rgba(229,34,41,0.25)",letterSpacing:.3}}>NÃO INCLUI IMPRESSÃO</span>
              </div>
            )}
            {service?.usesArch
            /* ── PROTOCOLO: complementar único por arcada ── */
            ? (()=>{
                const archCount=(A.arch.sup?1:0)+(A.arch.inf?1:0)||1;
                const compsList=[
                  {id:"proto_captura",label:"Prótese Protocolo Provisória para Captura",price:350,desc:"Prótese provisória imediata para captura do protocolo. Cobrado por arcada.",unit:"arcada"},
                ];
                return compsList.map(c=>{
                  const rawSel=(A.comps[c.id]||0)>0;
                  const requiresDsd=service?.id==="proto_total";
                  const locked=requiresDsd&&!A.dsd3dAddon;
                  const sel=rawSel&&!locked;
                  // Para proto_parc: não disponível — redirecionar para Stackable Guide
                  const unavailableParc=service?.id==="proto_parc";
                  const isLocked=locked||unavailableParc;
                  return(
                    <div key={c.id}>
                    <button onClick={()=>{if(isLocked)return;setA(a=>({...a,comps:{...a.comps,[c.id]:sel?0:archCount}}));}}                      style={{width:"100%",display:"flex",alignItems:"flex-start",gap:12,background:isLocked?"rgba(255,255,255,0.02)":sel?"rgba(34,197,94,0.08)":C.dark2,border:`1.5px solid ${isLocked?"rgba(255,255,255,0.07)":sel?C.green:C.border}`,borderRadius:12,padding:"16px 16px",cursor:isLocked?"not-allowed":"pointer",textAlign:"left",marginBottom:isLocked?6:10,color:C.text,opacity:isLocked?0.5:1}}>
                      <div style={{width:22,height:22,borderRadius:8,background:sel?C.green:C.dark3,border:`2px solid ${sel?C.green:C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:sel?"#111":"transparent",fontSize:12,fontWeight:800,marginTop:1}}>{sel?"✓":""}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:isLocked?C.textSec:sel?C.green:C.text,marginBottom:3}}>{c.label}</div>
                        <div style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>{c.desc}</div>
                        {sel&&archCount>1&&(
                      <div style={{marginTop:6}}>
                        <div style={{fontSize:13,color:C.green,fontWeight:600,marginBottom:4}}>Selecionado para {archCount} arcadas:</div>
                        <div style={{display:"flex",gap:8}}>
                          {A.arch.sup&&<div
                            onClick={e=>{e.stopPropagation();setA(a=>({...a,comps:{...a.comps,[c.id]:a.comps[c.id]===2?1:2}}));}}
                            style={{fontSize:12,fontWeight:700,padding:"3px 9px",borderRadius:16,cursor:"pointer",
                              background:A.comps[c.id]>=1?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.05)",
                              border:`1px solid ${A.comps[c.id]>=1?C.green:"rgba(255,255,255,0.1)"}`,
                              color:A.comps[c.id]>=1?C.green:C.textSec}}>
                            Superior
                          </div>}
                          {A.arch.inf&&<div
                            onClick={e=>{e.stopPropagation();setA(a=>({...a,comps:{...a.comps,[c.id]:a.comps[c.id]===2?1:2}}));}}
                            style={{fontSize:12,fontWeight:700,padding:"3px 9px",borderRadius:16,cursor:"pointer",
                              background:A.comps[c.id]===2?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.05)",
                              border:`1px solid ${A.comps[c.id]===2?C.green:"rgba(255,255,255,0.1)"}`,
                              color:A.comps[c.id]===2?C.green:C.textSec}}>
                            Inferior
                          </div>}
                        </div>
                        <div style={{fontSize:12,color:C.textSec,marginTop:4}}>Toque para ajustar por arcada</div>
                      </div>
                    )}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:800,color:isLocked?C.textMut:sel?C.green:C.textSec}}>
                          {sel?`+${fmt(c.price*archCount)}`:`+${fmt(c.price)}`}
                        </div>
                        <div style={{fontSize:12,color:C.textSec,marginTop:2}}>por arcada</div>
                      </div>
                    </button>
                    {/* Aviso proto_parc — trocar para Stackable Guide */}
                    {unavailableParc&&(
                      <div style={{background:"rgba(229,34,41,0.05)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px"}}>
                          <AlertTriangle size={13} color={C.textSec} style={{flexShrink:0,marginTop:1}}/>
                          <div style={{fontSize:13,color:C.textSec,lineHeight:1.6}}>
                            A <b style={{color:"#fff"}}>Prótese Protocolo Provisória</b> não está disponível no Protocolo Edêntulo Parcial. Para incluí-la, selecione o serviço <b style={{color:C.textSec}}>Stackable Guide / Guias Empilháveis</b>, que já contempla este adicional.
                          </div>
                        </div>
                        {/* Botão para trocar o serviço */}
                        <button onClick={()=>{
                            const stackSv=specialty?.services?.find(sv=>sv.id==="stackable");
                            if(stackSv){
                              setService({...stackSv});
                              setA(a=>({...a,comps:{}}));
                              setShowStackableInfo(true);
                            }
                          }}
                          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"rgba(229,34,41,0.06)",borderTop:"1px solid rgba(229,34,41,0.18)",padding:"12px 14px",cursor:"pointer",textAlign:"left",color:C.text,border:"none"}}>
                          <div style={{width:44,height:44,borderRadius:12,background:"rgba(229,34,41,0.12)",border:"1px solid rgba(229,34,41,0.20)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Wrench size={16} color={C.textSec}/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:2}}>Alterar para Stackable Guide / Guias Empilháveis</div>
                            <div style={{fontSize:13,color:C.textSec}}>Prótese Provisória já inclusa no serviço</div>
                          </div>
                          <ChevronLeft size={14} color={C.textSec} style={{transform:"rotate(180deg)",flexShrink:0}}/>
                        </button>
                      </div>
                    )}
                    {/* Aviso proto_total — requer DSD3D */}
                    {locked&&(
                      <div style={{background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px"}}>
                          <AlertTriangle size={13} color={C.yellow} style={{flexShrink:0,marginTop:1}}/>
                          <div style={{fontSize:13,color:C.yellow,lineHeight:1.6}}>
                            Este serviço é derivado do <b>Planejamento Digital do Sorriso 3D</b>. Adicione o serviço complementar abaixo para habilitar a Prótese Provisória.
                          </div>
                        </div>
                        <button onClick={()=>setA(a=>({...a,dsd3dAddon:true}))}
                          style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"rgba(234,179,8,0.04)",borderTop:"1px solid rgba(234,179,8,0.2)",padding:"12px 14px",cursor:"pointer",textAlign:"left",color:C.text,border:"none"}}>
                          <div style={{width:44,height:44,borderRadius:12,background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Sparkles size={16} color={C.yellow}/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.yellow,marginBottom:2}}>Adicionar Planejamento Digital do Sorriso 3D</div>
                            <div style={{fontSize:13,color:C.textSec}}>Somente Planejamento · integrado ao planejamento cirúrgico</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:13,fontWeight:800,color:C.yellow}}>+{fmt(P.dsd3dProto)}</div>
                          </div>
                        </button>
                      </div>
                    )}
                    </div>
                  );
                });
              })()
            /* ── GUIADA: grid 2×2, dentes dentro de cada card à direita ── */
            : (()=>{
              const compsList=[
                {id:"captura",label:"Provisório\npara captura",price:P.provCaptura,desc:"Por dente"},
                {id:"adesiva",label:"Provisório\nadesiva",price:P.provAdesiva,desc:"Por dente"},
                {id:"cicatriz",label:"Cicatrizador\npersonalizado",price:P.cicatriz,desc:"Por dente"}
              ];
              const caseteeth=[...A.teeth].sort((a,b)=>a-b);
              return(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {compsList.map(c=>{
                    const selTeeth=A.comps[c.id]||[];
                    const isActive=selTeeth.length>0;
                    return(
                      <div key={c.id} style={{background:isActive?"rgba(34,197,94,0.06)":C.dark2,border:`1.5px solid ${isActive?C.green:C.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"row",minHeight:130}}>
                        {/* Esquerda — info do serviço */}
                        <div style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",justifyContent:"space-between",minWidth:0}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:800,color:isActive?C.green:C.text,lineHeight:1.3,marginBottom:4,whiteSpace:"pre-line"}}>{c.label}</div>
                            <div style={{fontSize:13,fontWeight:800,color:isActive?C.green:C.textSec}}>
                              {isActive?`+${fmt(c.price*selTeeth.length)}`:`+${fmt(c.price)}`}
                            </div>
                            <div style={{fontSize:12,color:C.textSec}}>{c.desc}</div>
                          </div>
                          {/* Ações rápidas removidas — seleção apenas pelos botões de dentes */}
                        </div>
                        {/* Direita — botões de dentes */}
                        {caseteeth.length>0?(
                          <div style={{borderLeft:`1px solid ${C.border}`,padding:"10px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:64,background:"rgba(0,0,0,0.15)"}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:.5,textAlign:"center",lineHeight:1.3,marginBottom:2}}>SELECIONE{"\n"}O DENTE</div>
                            {caseteeth.map(tooth=>{
                              const isSel=selTeeth.includes(tooth);
                              return(
                                <button key={tooth} onClick={()=>{
                                  const next=isSel?selTeeth.filter(x=>x!==tooth):[...selTeeth,tooth];
                                  setA(a=>({...a,comps:{...a.comps,[c.id]:next}}));
                                }}
                                style={{width:44,height:32,borderRadius:8,border:`1.5px solid ${isSel?C.green:C.border}`,background:isSel?"rgba(34,197,94,0.2)":C.dark3,cursor:"pointer",fontSize:13,fontWeight:isSel?800:500,color:isSel?C.green:C.textSec,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s"}}>
                                  {tooth}
                                </button>
                              );
                            })}
                          </div>
                        ):(
                          <div style={{borderLeft:`1px solid ${C.border}`,padding:"10px",display:"flex",alignItems:"center",justifyContent:"center",minWidth:64,background:"rgba(0,0,0,0.15)"}}>
                            <span style={{fontSize:12,color:C.textMut,textAlign:"center",lineHeight:1.3}}>Selecione dentes no odontograma</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}


            <div style={{margin:"4px 0 10px",padding:"11px 14px",background:C.dark3,borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:C.textSec}}>Subtotal estimado</span>
              <span style={{fontSize:18,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
            </div>
            <Btn onClick={()=>serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile?setScreen("slicedFile"):setScreen(6)}>
              {serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile?"Continuar — Arquivo p/ Impressão":"Continuar — Prazo de planejamento"}
            </Btn>
          </Step>
        )}

        {/* STEP 5b — ARQUIVO PREPARADO PARA IMPRESSÃO (somente fluxo planOnly) */}
        {screen==="slicedFile"&&serviceType==="planOnly"&&(
          <Step title="Arquivo preparado para impressão" sub="Receba o arquivo .chitubox com peças e suportes configurados." badge="Arquivo p/ Impressão" badgeColor={"#0D9488"} onBack={()=>isStackable?setScreen(4):setScreen(5)}>
            {/* Explicação do serviço */}
            <div style={{background:"rgba(13,148,136,0.06)",border:"1px solid rgba(13,148,136,0.25)",borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:44,height:44,borderRadius:12,background:"rgba(13,148,136,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Printer size={18} color="#0D9488"/>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:"#0D9488"}}>Arquivo .chitubox preparado para impressão</div>
              </div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:12}}>
                A D-CAD entrega o arquivo já no formato <b>.chitubox</b>, com as peças montadas na plataforma e os suportes configurados e posicionados.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {[
                  {icon:"✓",text:"Peças posicionadas e orientadas na plataforma de impressão"},
                  {icon:"✓",text:"Suportes gerados e configurados pela equipe D-CAD"},
                  {icon:"✓",text:"Arquivo pronto para abrir direto no Chitubox — você configura a impressora e a resina antes de imprimir"},
                  {icon:"→",text:"Você configura apenas a impressora e a resina no Chitubox antes de imprimir",highlight:true},
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:item.highlight?C.yellow:"#0D9488",flexShrink:0,marginTop:1}}>{item.icon}</span>
                    <span style={{fontSize:12,color:item.highlight?C.yellow:C.textSec,fontWeight:item.highlight?600:400,lineHeight:1.5}}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seleção — quer ou não quer */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              <button onClick={()=>set("slicedFile",true)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:A.slicedFile?"rgba(13,148,136,0.1)":C.dark2,border:`2px solid ${A.slicedFile?"#0D9488":C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:A.slicedFile?"#0D9488":C.dark3,border:`2px solid ${A.slicedFile?"#0D9488":C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{A.slicedFile?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:A.slicedFile?"#0D9488":"#fff"}}>Sim — quero o arquivo fatiado</div>
                  <div style={{fontSize:12,color:C.textSec,marginTop:2}}>Receba o arquivo .chitubox pronto para imprimir, com suportes incluídos.</div>
                </div>
                <div style={{fontSize:15,fontWeight:900,color:A.slicedFile?"#0D9488":C.textSec,flexShrink:0}}>+{fmt(P.slicedFile)}</div>
              </button>
              <button onClick={()=>{set("slicedFile",false);set("printerId",null);}}
                style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:!A.slicedFile?"rgba(229,34,41,0.06)":C.dark2,border:`2px solid ${!A.slicedFile?C.red:C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:!A.slicedFile?C.red:C.dark3,border:`2px solid ${!A.slicedFile?C.red:C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{!A.slicedFile?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:!A.slicedFile?C.red:"#fff"}}>Não — vou fatiar eu mesmo</div>
                  <div style={{fontSize:12,color:C.textSec,marginTop:2}}>Receba apenas o arquivo STL e faça a preparação no Chitubox por conta própria.</div>
                </div>
                <div style={{fontSize:15,fontWeight:900,color:C.green,flexShrink:0}}>Incluso</div>
              </button>
            </div>

            <Btn onClick={()=>setScreen(6)}>Continuar — Prazo de planejamento</Btn>
          </Step>
        )}

        {/* STEP 6 — PRAZO DE PLANEJAMENTO */}
        {screen===6&&(
          <Step title="Prazo de planejamento" sub="A urgência afeta apenas o planejamento digital. Impressão e frete mantém seus prazos normais após aprovação do planejamento." badge="Prazo" badgeColor={C.yellow} onBack={()=>isStackable?setScreen(4):setScreen(5)}>
            <div style={{fontSize:13,color:C.textSec,marginBottom:14,lineHeight:1.6,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:12,padding:"10px 13px"}}>
              <b style={{color:C.yellow}}>Como funciona:</b> O prazo de planejamento começa após o envio dos arquivos. Após o envio do planejamento e sua aprovação, damos início à impressão 3D (2 dias úteis + prazo de envio ou entrega).
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {URGENCY_TIERS.map(tier=>{
                const sel=A.urgency===tier.id;
                const baseDays=service?.days||7;
                const planDays=urgencyPlanDays(baseDays,tier);
                // Calcula a taxa de urgência em R$ usando calcTotal sem urgência
                const baseVal=(()=>{
                  const sv={...A,urgency:"normal"};
                  const supCount=(sv.teeth||[]).filter(t=>SUP_ALL.includes(t)).length;
                  const infCount=(sv.teeth||[]).filter(t=>!SUP_ALL.includes(t)).length;
                  const archCount=(sv.arch?.sup?1:0)+(sv.arch?.inf?1:0)||1;
                  const pbyq=service?.priceByQty||(serviceType==="planOnly"&&service?.planOnly?.priceByQty?service.planOnly.priceByQty:null);
                  let t=0;
                  if(pbyq){
                    if(supCount>=2)t+=pbyq[Math.min(supCount,8)]||0;
                    if(infCount>=2)t+=pbyq[Math.min(infCount,8)]||0;
                    if(t===0)t=pbyq[2]||service?.price||0;
                  }else if(service?.usesArch&&service?.archAffectsPrice){
                    t=(service.price||0)*archCount;
                  }else{
                    t=service?.price||P.unit;
                    if(supCount>0&&infCount>0)t*=2;
                  }
                  const brandFees=service?.brandFees||{STRAUMANN:P.strauAdd};
                  const guias=pbyq?((supCount>=2?1:0)+(infCount>=2?1:0)||1):service?.usesArch?archCount:(supCount>0&&infCount>0?2:1);
                  if(sv.brand&&brandFees[sv.brand])t+=brandFees[sv.brand]*guias;
                  if(sv.comps?.captura?.length)t+=P.provCaptura*sv.comps.captura.length;
                  if(sv.comps?.adesiva?.length)t+=P.provAdesiva*sv.comps.adesiva.length;
                  if(sv.comps?.cicatriz?.length)t+=P.cicatriz*sv.comps.cicatriz.length;
                  if(sv.comps?.proto_captura)t+=350*sv.comps.proto_captura;
                  if(sv.dsd3dAddon)t+=P.dsd3dProto;
                  if(sv.slicedFile&&serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile)t+=P.slicedFile;
                  return parseFloat((t*(1-discount)).toFixed(2));
                })();
                const feeVal=parseFloat((baseVal*tier.feePercent).toFixed(2));
                return(
                  <button key={tier.id} onClick={()=>set("urgency",tier.id)}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:sel?"rgba(234,179,8,0.08)":C.dark2,border:`1.5px solid ${sel?C.yellow:C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"border-color .15s,background .15s"}}>
                    {/* Radio */}
                    <div style={{width:20,height:20,borderRadius:"50%",background:sel?C.yellow:C.dark3,border:`2px solid ${sel?C.yellow:C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {sel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#111"}}/>}
                    </div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:800,color:sel?C.yellow:"#fff",marginBottom:3}}>{tier.label}</div>
                      <div style={{fontSize:12,color:C.textSec}}>
                        Planejamento em até <b style={{color:sel?C.yellow:C.text}}>{planDays} dia{planDays===1?"":"s"} corrido{planDays===1?"":"s"}</b>
                        {serviceType==="print"&&<span style={{color:C.textMut}}> · +{PRINT_DAYS} d.u. impressão após aprovação</span>}
                      </div>
                    </div>
                    {/* Valor */}
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {tier.feePercent===0
                        ? <span style={{fontSize:13,fontWeight:700,color:C.green}}>Incluso</span>
                        : <div style={{fontSize:15,fontWeight:800,color:sel?C.yellow:C.textSec}}>+{fmt(feeVal)}</div>
                      }
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{padding:"11px 14px",background:C.dark3,borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <span style={{fontSize:13,color:C.textSec}}>Subtotal estimado</span>
              <span style={{fontSize:18,fontWeight:900,color:C.red}}>{fmt(calcTotal(A))}</span>
            </div>
            <Btn onClick={()=>setScreen(7)}>Continuar — Informações do Caso</Btn>
          </Step>
        )}

        {/* STEP 7 — INFORMAÇÕES DO CASO */}
        {screen===7&&(
          <div>
            <BackBtn onClick={()=>A.preplan==="sim"?setScreen(0):setScreen(6)}/>
            <span style={{display:"inline-block",fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",background:A.preplan==="sim"?"rgba(234,179,8,0.15)":"rgba(229,34,41,0.12)",color:A.preplan==="sim"?C.yellow:C.textSec,padding:"3px 10px",borderRadius:16,marginBottom:10}}>{A.preplan==="sim"?"PRÉ-PLANEJAMENTO":"INFORMAÇÕES DO CASO"}</span>
            <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>{A.preplan==="sim"?"Observações para o pré-planejamento":"Observações para o planejamento"}</div>
            <div style={{fontSize:13,color:C.textSec,marginBottom:20,lineHeight:1.6}}>
              {A.preplan==="sim"
                ?"Campo obrigatório para o pré-planejamento. Informe as orientações necessárias para que a equipe D-CAD realize a análise de viabilidade do caso."
                :"Campo opcional. Informe orientações relevantes para que a equipe D-CAD realize o melhor planejamento possível."}
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:6,letterSpacing:.5}}>OBSERVAÇÕES E ORIENTAÇÕES {A.preplan==="sim"?<span style={{color:C.red,fontWeight:700}}>(obrigatório)</span>:<span style={{color:C.textMut,fontWeight:400}}>(opcional)</span>}</label>
              <textarea value={A.observacoes} onChange={e=>set("observacoes",e.target.value)}
                placeholder="Condições sistêmicas, medicamentos em uso, restrições, preferências clínicas, histórico de tratamentos anteriores..."
                rows={7} style={{width:"100%",background:C.dark2,border:`1px solid ${A.preplan==="sim"&&!A.observacoes.trim()?"rgba(229,34,41,0.4)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.7,fontFamily:"inherit"}}/>
              {A.preplan==="sim"&&!A.observacoes.trim()&&<div style={{fontSize:13,color:C.red,marginTop:6}}>Preencha as informações do caso para continuar.</div>}
            </div>
            <Btn disabled={A.preplan==="sim"&&!A.observacoes.trim()} onClick={()=>{if(A.preplan==="sim"){setScreen("preplanCO");return;}if(serviceType==="print"){const _cep=(profile?.entregaIgual===false?profile.entCep:profile.cep)||"";setCepDestino(_cep);if(_cep.replace(/\D/g,"").length>=8)calcularFrete(_cep.replace(/\D/g,""));setScreen(8);}else{finalize();}}}>
              {A.preplan==="sim"?"Continuar para pagamento →":serviceType==="print"?"Continuar — Frete →":"Ver resumo e finalizar →"}
            </Btn>
          </div>
        )}

        {/* ════════════════════════════════
            SCREEN 7 — FRETE
        ════════════════════════════════ */}
        {screen===8&&(
          <div>
            <BackBtn onClick={()=>setScreen(7)}/>
            <span style={{display:"inline-block",fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",background:"rgba(229,34,41,0.12)",color:C.textSec,padding:"3px 10px",borderRadius:16,marginBottom:10}}>FRETE</span>
            <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Entrega</div>
            <div style={{fontSize:13,color:C.textSec,marginBottom:20,lineHeight:1.6}}>Selecione a modalidade de envio para a entrega dos dispositivos impressos.</div>

            {/* Subtotal sem frete */}
            <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
              <Row label="Subtotal dos serviços" val={fmt(calcTotal(A))} small/>
              {freteGratis&&(
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"8px 12px"}}>
                  <span style={{fontSize:14}}><CheckCircle size={40} color={C.green}/></span>
                  <span style={{fontSize:12,color:C.green,fontWeight:700}}>
                    {isSaoLuis
                      ? "Entrega local sem custo — endereço em São Luís/MA"
                      : `Envio gratuito — pedido acima de ${fmt(FRETE_GRATIS_MIN)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Frete grátis */}
            {freteGratis&&(
              <div>
                <button onClick={()=>setFreight({method:isSaoLuis?"local":"sedex",value:0,prazo:isSaoLuis?"Combinado com a equipe D-CAD":"1 a 2 dias úteis",loading:false,simulated:false})}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:freight.method?"rgba(34,197,94,0.08)":"rgba(34,197,94,0.03)",border:`1.5px solid ${freight.method?"rgba(34,197,94,0.6)":C.border}`,borderRadius:12,padding:"16px",cursor:"pointer",textAlign:"left",color:C.text,transition:"all .15s"}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(34,197,94,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {isSaoLuis?"️":"◻"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontWeight:800,fontSize:14}}>{isSaoLuis?"Entrega local":"SEDEX Expresso"}</span>
                      <span style={{fontSize:12,fontWeight:700,background:"rgba(34,197,94,0.15)",color:C.green,padding:"2px 8px",borderRadius:16}}>GRÁTIS</span>
                    </div>
                    <div style={{fontSize:12,color:C.textSec}}>
                      {isSaoLuis
                        ?"Seu endereço está em São Luís/MA — frete sem custo"
                        :`Pedido acima de ${fmt(FRETE_GRATIS_MIN)} — envio gratuito`}
                    </div>
                    <div style={{fontSize:13,color:C.textSec,marginTop:2}}>
                      {isSaoLuis?"Prazo combinado com a equipe D-CAD":"Prazo estimado: 1 a 2 dias úteis após aprovação"}
                    </div>
                  </div>
                  {freight.method&&<span style={{color:C.green,fontSize:20,flexShrink:0}}>✓</span>}
                </button>
                <Btn disabled={!freight.method} onClick={finalize} style={{marginTop:14}}>
                  Ver resumo e finalizar →
                </Btn>
              </div>
            )}

            {/* Cálculo para pedidos abaixo do mínimo */}
            {!freteGratis&&(
              <div>
                {/* CEP destino */}
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:6,letterSpacing:.5}}>CEP DE ENTREGA</label>
                  <div style={{display:"flex",gap:8}}>
                    <input
                      value={cepDestino}
                      placeholder="00000-000"
                      maxLength={9}
                      style={{flex:1,background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
                      onChange={e=>{
                        setCepDestino(e.target.value);
                        if(freightOptions)setFreightOptions(null);
                        if(freight.method)setFreight(f=>({...f,method:null,value:0}));
                      }}
                    />
                    <button
                      onClick={()=>{
                        const cep=cepDestino.replace(/\D/g,"");
                        if(cep.length<8){setToast("CEP inválido. Digite 8 dígitos.");return;}
                        calcularFrete(cep);
                      }}
                      style={{padding:"0 18px",background:C.red,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                      Calcular
                    </button>
                  </div>
                  {profile?.cep&&<div style={{fontSize:13,color:C.textSec,marginTop:5}}>CEP do endereço de entrega cadastrado: <b style={{color:C.text}}>{profile.entregaIgual===false?profile.entCep:profile.cep}</b></div>}
                </div>

                {/* Loading */}
                {freight.loading&&(
                  <div style={{textAlign:"center",padding:"28px 0",color:C.textSec}}>
                    <div style={{fontSize:22,marginBottom:8}}>⏳</div>
                    <div style={{fontSize:13}}>Consultando Correios...</div>
                    <div style={{fontSize:13,marginTop:4,opacity:.6}}>Aguarde, calculando o frete</div>
                  </div>
                )}

                {/* Opções */}
                {freightOptions&&!freight.loading&&(
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:8,letterSpacing:.5}}>SELECIONE A MODALIDADE</div>
                    {[
                      {key:"pac",icon:<Package size={16}/>,label:"PAC",sub:"Econômico · mais barato",eta:"8–12 dias úteis",opt:freightOptions.pac},
                      {key:"sedex",icon:<Zap size={16}/>,label:"SEDEX",sub:"Expresso · mais rápido",eta:"3–5 dias úteis",opt:freightOptions.sedex},
                    ].map(({key,icon,label,sub,eta,opt})=>(
                      <button key={key}
                        onClick={()=>setFreight(f=>({...f,method:key,value:opt.valor,prazo:opt.prazo}))}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:freight.method===key?"rgba(229,34,41,0.08)":C.dark2,border:`1.5px solid ${freight.method===key?C.red:C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:C.text,marginBottom:8,transition:"border-color .15s"}}>
                        <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.text}}>{icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800,fontSize:13}}>{label}</div>
                          <div style={{fontSize:13,color:C.textSec,marginTop:1}}>{sub}</div>
                          <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginTop:2}}>Entrega estimada: {eta} após aprovação</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontWeight:900,fontSize:15,color:freight.method===key?C.red:C.text}}>{fmt(opt.valor)}</div>
                        </div>
                        {freight.method===key&&<CheckCircle size={16} color={C.red}/>}
                      </button>
                    ))}
                    <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.textSec,lineHeight:1.6}}>
                      <AlertTriangle size={11} style={{display:"inline",marginRight:4}}/> Prazos estimados a partir da aprovação do planejamento. Valores simulados para validação.
                    </div>
                    <Btn disabled={!freight.method} onClick={finalize}>
                      Ver resumo e finalizar →
                    </Btn>
                  </div>
                )}

                {!freightOptions&&!freight.loading&&(
                  <div style={{textAlign:"center",padding:"20px 0",color:C.textSec}}>
                    <div style={{fontSize:32,marginBottom:8}}><Package size={16}/></div>
                    <div style={{fontSize:13}}>Informe o CEP e clique em Calcular para ver as opções de envio.</div>
                    <div style={{fontSize:13,marginTop:6,opacity:.7}}>Entregamos para todo o Brasil via Correios.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RESUMO */}
        {screen==="resumo"&&(
          <div style={{display:isDesktop?"grid":"block",gridTemplateColumns:isDesktop?"1.2fr 1fr":"1fr",gap:isDesktop?32:0,alignItems:"start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
              <div style={{width:42,height:42,borderRadius:12,background:"rgba(34,197,94,0.08)",display:"flex",alignItems:"center",justifyContent:"center",color:C.green}}><CheckCircle size={22}/></div>
              <div>
                <div style={{fontSize:18,fontWeight:800}}>Serviço configurado!</div>
                <div style={{fontSize:13,color:C.textSec}}>Paciente: {patient?.nome||"Não informado"}</div>
              </div>
            </div>
            {/* Cards de serviços — empilhados */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
            {/* Card do pré-planejamento */}
            {A.preplan==="sim"&&(
              <div style={{background:C.dark2,border:`1px solid rgba(234,179,8,0.3)`,borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontSize:12,background:C.yellow,color:"#111",padding:"2px 8px",borderRadius:16,fontWeight:700}}>PRÉ-PLANEJAMENTO</span>
                  </div>
                  <div style={{fontSize:13,color:C.textSec}}>{specialty?.name}</div>
                  <div style={{fontWeight:700,fontSize:14,marginTop:2}}>Pré-planejamento</div>
                  <div style={{fontSize:12,color:C.textSec,marginTop:2}}>Prazo: 7 dias corridos · Valor abatido se aprovado</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:900,color:C.yellow}}>{fmt(P.preplan)}</div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{position:"relative"}}>
                      <button onClick={()=>setScreen(0)} title="Editar"
                        style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.18)";e.currentTarget.nextSibling.style.opacity="1";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                        <Pencil size={14} color={C.textSec}/>
                      </button>
                      <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Editar</div>
                    </div>
                    <div style={{position:"relative"}}>
                      <button onClick={()=>setConfirmDeleteId("preplan")} title="Remover" aria-label="Remover pré-planejamento"
                        style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.22)";e.currentTarget.nextSibling.style.opacity="1";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                        <Trash2 size={14} color={C.red}/>
                      </button>
                      <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Remover</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {services.map((sv,i)=>(
              <div key={sv.id} style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontSize:12,background:C.red,color:"#fff",padding:"2px 8px",borderRadius:16,fontWeight:700}}>SERVIÇO</span>
                      {discount>0&&<span style={{fontSize:13,fontWeight:700,background:"rgba(34,197,94,0.15)",color:C.green,padding:"2px 7px",borderRadius:16}}>15% parceiro</span>}
                      <div style={{display:"inline-flex",alignItems:"center",gap:4,background:sv.serviceType==="print"?"rgba(34,197,94,0.1)":"rgba(234,179,8,0.1)",borderRadius:16,padding:"1px 7px"}}>
                        <span style={{fontSize:13,fontWeight:700,color:sv.serviceType==="print"?C.green:C.yellow}}>{sv.serviceType==="print"?"+ Impressão 3D":"Arquivo Digital (STL)"}</span>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:C.textSec}}>{sv.specialty}</div>
                    <div style={{fontWeight:700,fontSize:14,marginTop:2}}>{sv.name}</div>
                    <div style={{fontSize:12,color:C.textSec,marginTop:2}}>
                      {sv.teeth?.length>0
                        ?`${sv.teeth.length>1?`Dentes ${sv.teeth.join(", ")}`:`Dente ${sv.teeth[0]}`}`
                        :sv.arch?`${[sv.arch.sup&&"Superior",sv.arch.inf&&"Inferior"].filter(Boolean).join(" + ")}`
                        :""}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                    <div style={{fontSize:18,fontWeight:900,color:C.red}}>{fmt(sv.total)}</div>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{position:"relative"}}>
                        <button onClick={()=>{
                          const sp=catalog.find(c=>c.services?.find(s=>s.name===sv.name||s.id===sv.serviceId));
                          const svc=sp?.services?.find(s=>s.name===sv.name||s.id===sv.serviceId)||null;
                          setSpecialty(sp||specialty);
                          setService(svc||service);
                          setServiceType(sv.serviceType);
                          setA({
                            preplan:sv.preplan||null,
                            teeth:[...(sv.teeth||[])],
                            arch:{...(sv.arch||{sup:false,inf:false})},
                            implantQty:sv.implantQty||null,
                            dsd3dAddon:sv.dsd3dAddon||false,
                            brand:sv.brand||null,
                            kit:sv.kit||null,
                            model:sv.model||null,
                            modelText:"",
                            comps:{...(sv.comps||{})},
                            observacoes:sv.observacoes||"",
                            urgency:sv.urgency||"normal",
                            slicedFile:sv.slicedFile||false,
                            printerId:sv.printerId||null,
                          });
                          setEditingId(sv.id);
                          setEditingOriginal({...sv});
                          setServices(s=>s.filter(x=>x.id!==sv.id));
                          setScreen(0);
                        }}
                          title="Editar serviço"
                          style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.18)";e.currentTarget.nextSibling.style.opacity="1";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                          <Pencil size={14} color={C.textSec}/>
                        </button>
                        <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Editar serviço</div>
                      </div>
                      <div style={{position:"relative"}}>
                        <button onClick={()=>setConfirmDeleteId(sv.id)}
                          title="Remover serviço"
                          style={{width:44,height:44,borderRadius:8,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(229,34,41,0.22)";e.currentTarget.nextSibling.style.opacity="1";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(229,34,41,0.08)";e.currentTarget.nextSibling.style.opacity="0";}}>
                          <Trash2 size={14} color="#E52229"/>
                        </button>
                        <div style={{position:"absolute",bottom:"calc(100% + 6px)",right:0,background:"rgba(0,0,0,0.85)",color:"#fff",fontSize:12,fontWeight:600,padding:"4px 8px",borderRadius:8,whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity .15s",zIndex:99}}>Remover serviço</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Linhas de detalhe */}
                {sv.teeth?.length>0
                  ?<Row label={`Guia(s) ×${sv.teeth.length}`} val={fmt(service?.price||P.unit)} small/>
                  :sv.arch&&<Row label={`Arcada(s): ${[sv.arch.sup&&"Superior",sv.arch.inf&&"Inferior"].filter(Boolean).join(" + ")}${sv.implantQty?(()=>{const lbl={4:"ALL-ON-4",5:"ALL-ON-X",6:"ALL-ON-6"};return typeof sv.implantQty==="object"?` · Sup: ${lbl[sv.implantQty.sup]||"—"} / Inf: ${lbl[sv.implantQty.inf]||"—"}`:` · ${lbl[sv.implantQty]||sv.implantQty+" implantes"}`;})():""}`} val={fmt((service?.price||0)*((sv.arch?.sup?1:0)+(sv.arch?.inf?1:0)))} small/>
                }
                {sv.brand==="STRAUMANN"&&<Row label="Adicional Straumann" val={`+ ${fmt(P.strauAdd)}`} small/>}
                {sv.dsd3dAddon&&<Row label="Plan. Digital do Sorriso 3D" val={`+ ${fmt(P.dsd3dProto)}`} small/>}
                {sv.comps?.captura?.length>0&&<Row label={`Prov. captura ×${sv.comps.captura.length}`} val={`+ ${fmt(P.provCaptura*sv.comps.captura.length)}`} small/>}
                {sv.comps?.adesiva?.length>0&&<Row label={`Prov. adesiva ×${sv.comps.adesiva.length}`} val={`+ ${fmt(P.provAdesiva*sv.comps.adesiva.length)}`} small/>}
                {sv.comps?.cicatriz?.length>0&&<Row label={`Cicatrizador ×${sv.comps.cicatriz.length}`} val={`+ ${fmt(P.cicatriz*sv.comps.cicatriz.length)}`} small/>}
                {sv.comps?.proto_captura>0&&<Row label={`Prótese Protocolo Provisória ×${sv.comps.proto_captura} arcada${sv.comps.proto_captura>1?"s":""}`} val={`+ ${fmt(350*sv.comps.proto_captura)}`} small/>}
                {sv.urgency&&sv.urgency!=="normal"&&<Row label={`Urgência — ${URGENCY_TIERS.find(u=>u.id===sv.urgency)?.label||sv.urgency}`} val={`+${Math.round((URGENCY_TIERS.find(u=>u.id===sv.urgency)?.feePercent||0)*100)}%`} small/>}
                {sv.slicedFile&&<Row label="Arquivo p/ Impressão" val={`+ ${fmt(P.slicedFile)}`} small/>}
                {sv.freight&&<Row label={`Frete ${sv.freight.method==="sedex"?"SEDEX":"PAC"}${sv.freight.value===0?" (Grátis)":""}`} val={sv.freight.value===0?"Grátis":`+ ${fmt(sv.freight.value)}`} small/>}
                {sv.observacoes&&(
                  <div style={{marginTop:10,padding:"10px 12px",background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.12)",borderRadius:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:4}}>OBSERVAÇÕES DO CASO</div>
                    <div style={{fontSize:12,color:C.textSec,lineHeight:1.6}}>{sv.observacoes}</div>
                  </div>
                )}
              </div>
            ))}
            </div>{/* end stack */}
            {/* Cupom de desconto — antes do total */}
            <CouponBlock totalAll={totalAllBase} onApply={v=>setCouponDiscount(v)}/>

            {/* Total do pedido — com breakdown quando cupom aplicado */}
            <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.2)",borderRadius:12,padding:16,marginBottom:16}}>
              {couponDiscount>0?(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,color:C.textSec}}>Subtotal</span>
                    <span style={{fontSize:13,color:C.textSec}}>{fmt(totalAllBase)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
                    <span style={{fontSize:13,color:C.green,fontWeight:600}}>Desconto (cupom)</span>
                    <span style={{fontSize:13,color:C.green,fontWeight:700}}>− {fmt(couponDiscount)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:800,fontSize:15}}>Total do pedido</span>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:22,fontWeight:900,color:C.red,lineHeight:1}}>{fmt(totalAll)}</div>
                      <div style={{fontSize:12,color:C.green,fontWeight:600,marginTop:2}}>Você economizou {fmt(couponDiscount)}</div>
                    </div>
                  </div>
                </>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:800,fontSize:15}}>Total do pedido</span>
                  <span style={{fontSize:22,fontWeight:900,color:C.red}}>{fmt(totalAll)}</span>
                </div>
              )}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={()=>{
                  setA({preplan:null,teeth:[],arch:{sup:false,inf:false},implantQty:null,dsd3dAddon:false,brand:null,kit:null,model:null,modelText:"",comps:{},observacoes:"",urgency:"normal",slicedFile:false,printerId:null});
                  setService(null);setServiceType(null);setSpecialty(null);
                  setFreight({method:null,value:0,prazo:"",loading:false,simulated:false});
                  setFreightOptions(null);
                  setScreen("specialties");
                }} style={{width:"100%",padding:"13px 20px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Plus size={16}/> Adicionar outro serviço
              </button>
            </div>
          </div>

          {/* Checkout column (sticky on desktop) */}
          <div style={{position:isDesktop?"sticky":"static",top:isDesktop?80:0,marginTop:isDesktop?0:16}}>
            <InfinitePayCheckout amount={totalAll} services={services} patient={patient} dentist={dentist} freight={freight} couponDiscount={couponDiscount} profileComplete={profileComplete} onProfileIncomplete={()=>setScreen("profile")} onOrderPending={registerPendingPayment} onBackToDashboard={()=>setScreen("dashboard")}/>
          </div>
        </div>
        )}

      </div>
    </div>
        </div>
      </div>
  );
}

/* ── ODONTOGRAM ── */
function Odontogram({selected,onToggle}){
  const SUP_=[[18,17,16,15,14,13,12,11],[21,22,23,24,25,26,27,28]];
  const INF_=[[48,47,46,45,44,43,42,41],[31,32,33,34,35,36,37,38]];
  const SUP_ALL_=[...SUP_[0],...SUP_[1]];
  const renderRow=teeth=>(
    <div style={{display:"flex",gap:3,justifyContent:"center"}}>
      {teeth.map(n=>{const sel=selected.includes(n);return(
        <button key={n} onClick={()=>onToggle(n)} style={{width:44,height:44,borderRadius:8,background:sel?C.red:C.dark3,border:`1px solid ${sel?C.red:C.border}`,color:sel?"#fff":C.textSec,fontSize:13,fontWeight:sel?700:400,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
          <span style={{fontSize:12,opacity:.5}}>{SUP_ALL_.includes(n)?"S":"I"}</span><span>{n}</span>
        </button>
      );})}
    </div>
  );
  return(
    <div style={{background:C.dark2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:700,color:C.textSec,textAlign:"center",letterSpacing:1,marginBottom:8}}>ARCADA SUPERIOR</div>
      <div style={{marginBottom:3}}>{renderRow(SUP_[0])}</div>{renderRow(SUP_[1])}
      <div style={{margin:"8px 0",borderTop:`1px dashed ${C.border}`}}/>
      <div style={{fontSize:12,fontWeight:700,color:C.textSec,textAlign:"center",letterSpacing:1,marginBottom:8}}>ARCADA INFERIOR</div>
      <div style={{marginBottom:3}}>{renderRow(INF_[0])}</div>{renderRow(INF_[1])}
      <div style={{marginTop:8,textAlign:"center",fontSize:13,color:C.textSec}}>
        {selected.length===0&&"Nenhum dente selecionado"}
        {selected.length===1&&`Dente ${selected[0]} selecionado`}
        {selected.length===2&&<span style={{color:C.yellow}}>Dentes {selected.join(" e ")} — 2 guias</span>}
      </div>
    </div>
  );
}

const VALID_COUPONS={
  "DCAD10":{type:"percent",value:10,label:"10% de desconto"},
  "DCAD20":{type:"percent",value:20,label:"20% de desconto"},
  "BEMVINDO":{type:"fixed",value:50,label:"R$ 50,00 de desconto"},
  "IMPLANTE50":{type:"fixed",value:50,label:"R$ 50,00 em implantodontia"},
};

function CouponBlock({totalAll,onApply}){
  const [code,setCode]=useState("");
  const [applied,setApplied]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  function handleApply(){
    const trimmed=code.trim().toUpperCase();
    if(!trimmed){setError("Digite um cupom.");return;}
    setLoading(true);
    setTimeout(()=>{
      const coupon=VALID_COUPONS[trimmed];
      if(!coupon){setError("Cupom inválido ou expirado.");setLoading(false);return;}
      const discount=coupon.type==="percent"
        ?parseFloat((totalAll*(coupon.value/100)).toFixed(2))
        :Math.min(coupon.value,totalAll);
      setApplied({...coupon,code:trimmed,discount});
      onApply(discount);
      setError("");
      setLoading(false);
    },600);
  }

  function handleRemove(){
    setApplied(null);
    setCode("");
    setError("");
    onApply(0);
  }

  const fmt2=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  return(
    <div style={{background:C.dark2,border:`1px solid ${applied?"rgba(34,197,94,0.3)":C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14,transition:"border-color .2s"}}>
      <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <Tag size={13} color={C.textSec}/> CUPOM DE DESCONTO
      </div>
      {!applied?(
        <div>
          <div style={{display:"flex",gap:8}}>
            <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleApply()}
              placeholder="Digite o código do cupom"
              style={{flex:1,background:C.dark3,border:`1px solid ${error?C.red:C.border}`,borderRadius:8,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",letterSpacing:1,fontWeight:600,transition:"border-color .2s"}}/>
            <button onClick={handleApply} disabled={loading||!code.trim()}
              style={{padding:"0 16px",background:loading||!code.trim()?"#2a2a2a":C.red,border:"none",borderRadius:8,color:loading||!code.trim()?C.textSec:"#fff",fontSize:13,fontWeight:700,cursor:loading||!code.trim()?"not-allowed":"pointer",flexShrink:0,transition:"all .15s"}}>
              {loading?"...":"Aplicar"}
            </button>
          </div>
          {error&&<div style={{fontSize:13,color:C.red,marginTop:5}}>{error}</div>}
        </div>
      ):(
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:44,height:44,borderRadius:8,background:"rgba(34,197,94,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✓</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13,color:C.green}}>{applied.code}</div>
            <div style={{fontSize:13,color:C.textSec}}>{applied.label} — economia de <b style={{color:C.green}}>{fmt2(applied.discount)}</b></div>
          </div>
          <button onClick={handleRemove} style={{background:"none",border:"none",color:C.textSec,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Remover</button>
        </div>
      )}
    </div>
  );
}

function InfinitePayCheckout({amount,services,patient,dentist,freight,couponDiscount,profileComplete,onProfileIncomplete,onOrderPending,onBackToDashboard}){
  const [method,setMethod]=useState(null);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(null);
  const [responsavel,setResponsavel]=useState(null); // 'dentista' | 'paciente'
  const [showNFDisclaimer,setShowNFDisclaimer]=useState(false);
  const [nfConfirmed,setNfConfirmed]=useState(false);
  const [nf,setNf]=useState({nome:"",cpf:"",rua:"",numero:"",bairro:"",complemento:"",cidade:"",estado:"",cep:""});

  const pixAmount=parseFloat((amount*0.90).toFixed(2));
  const pixDiscount=parseFloat((amount*0.10).toFixed(2));
  const installmentVal=parseFloat((amount/2).toFixed(2));
  const dueDate=useMemo(()=>{
    const d=new Date(); d.setDate(d.getDate()+14);
    return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
  },[]);
  const fmt2=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const setN=(k,v)=>setNf(f=>({...f,[k]:v}));

  const ALL_METHODS=[
    {id:"pix",icon:<Zap size={18}/>,label:"Pix — 10% de desconto",tag:"Pagamento imediato",
     detail:`De ${fmt2(amount)} por`,highlight:fmt2(pixAmount),
     sub:`Economia de ${fmt2(pixDiscount)}`,color:"#22C55E",
     tagColor:"rgba(34,197,94,0.15)",tagText:"#22C55E",action:"Pagar com Pix"},
    {id:"card",icon:<CreditCard size={18}/>,label:"Cartão de crédito",tag:"Sem juros",
     detail:"Em até 2× de",highlight:fmt2(installmentVal),
     sub:`Total: ${fmt2(amount)}`,color:"#6366F1",
     tagColor:"rgba(229,34,41,0.12)",tagText:"#818CF8",action:"Pagar com cartão"},
    {id:"prazo",icon:<Calendar size={18}/>,label:"Cobrança a prazo",tag:"14 dias",
     detail:`Vencimento em ${dueDate}`,highlight:fmt2(amount),
     sub:"Via InfinitePay Gestão de Cobrança",color:"#EAB308",
     tagColor:"rgba(234,179,8,0.12)",tagText:"#EAB308",action:"Gerar cobrança"},
  ];
  const METHODS=responsavel==="paciente"?ALL_METHODS.filter(m=>m.id!=="prazo"):ALL_METHODS;

  async function handlePay(){
    if(!profileComplete){onProfileIncomplete();return;}
    if(!method){return;}
    if(!responsavel){return;}
    setLoading(true);
    try{
      const orderId=crypto.randomUUID();
      const payload={
        orderId,
        amount,
        method,
        services: services||[],
        patient: patient||{},
        dentist: dentist||{},
        freight: freight||{method:"none",value:0},
        couponDiscount: couponDiscount||0,
        responsavel,
        nfData: responsavel==="paciente"?nf:null,
      };
      console.log("Chamando InfinitePay com payload:", JSON.stringify(payload).slice(0,300));
      const res=await fetch("/api/infinitepay/checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      });
      const data=await res.json();
      console.log("Resposta da API:", data);
      if(data.checkout_url){
        window.open(data.checkout_url,"_blank");
        setSuccess({...METHODS.find(m=>m.id===method),checkout_url:data.checkout_url,order_id:data.order_id});
        // Pagamento ainda não confirmado — registra o pedido no dashboard como "pagamento pendente"
        if(onOrderPending)onOrderPending({orderId:data.order_id||orderId,checkoutUrl:data.checkout_url,amount,servicesList:services||[]});
      }else{
        console.error("Sem checkout_url:", data);
        throw new Error(data.error||"Sem URL de pagamento");
      }
    }catch(err){
      console.error("Erro no pagamento:",err);
      setLoading(false);
      const M=METHODS.find(m=>m.id===method);
      setSuccess(M);
    }
  }

  const formUrl=process.env.NEXT_PUBLIC_CLICKUP_FORM_URL||"#";
  if(success){
    return(
      <div style={{marginTop:4}}>
        <div style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.35)",borderRadius:12,padding:24,textAlign:"center",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Clock size={40} color={C.yellow}/></div>
          <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Pagamento pendente</div>
          <div style={{fontSize:13,color:C.textSec,marginBottom:6,lineHeight:1.6}}>
            O checkout InfinitePay foi aberto em uma nova aba.<br/>
            Assim que o pagamento for confirmado, o status será atualizado.<br/>
            <b style={{color:C.text}}>{success.label}</b>
          </div>
          {responsavel==="paciente"&&(
            <div style={{fontSize:12,color:C.textSec,background:"rgba(229,34,41,0.08)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:8,padding:"8px 12px",marginTop:8,marginBottom:4}}>
              NF em nome de: <b style={{color:C.text}}>{nf.nome}</b>
            </div>
          )}
        </div>
        {success.checkout_url&&(
          <button onClick={()=>window.open(success.checkout_url,"_blank")}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(234,179,8,0.12)",border:"1px solid rgba(234,179,8,0.35)",borderRadius:12,padding:"13px 20px",color:C.yellow,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>
            <Clock size={16}/> Finalizar pagamento →
          </button>
        )}
        <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.25)",borderRadius:12,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:28,marginBottom:8}}><FolderOpen size={32}/></div>
          <div style={{fontSize:15,fontWeight:800,marginBottom:6}}>Envie os arquivos do caso</div>
          <div style={{fontSize:12,color:C.textSec,lineHeight:1.7,marginBottom:16}}>
            Após confirmar o pagamento, envie os arquivos pelo formulário:<br/>
            <b style={{color:C.text}}>STL · DICOM · Fotografias (JPEG)</b>
          </div>
          <a href={formUrl} target="_blank" rel="noopener noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:8,background:C.red,color:"#fff",padding:"12px 24px",borderRadius:12,fontWeight:700,fontSize:14,textDecoration:"none"}}>
            Enviar arquivos do caso →
          </a>
        </div>
        {onBackToDashboard&&(
          <button onClick={onBackToDashboard} style={{width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            ← Voltar ao dashboard
          </button>
        )}
      </div>
    );
  }

  return(
    <div style={{marginTop:4}}>

      {/* ── NF DISCLAIMER POPUP ── */}
      {showNFDisclaimer&&(
        <div onClick={()=>setShowNFDisclaimer(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.dark2,border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,padding:24,maxWidth:460,width:"100%"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><AlertTriangle size={26} color={C.yellow}/></div>
            <div style={{fontSize:15,fontWeight:800,marginBottom:12,textAlign:"center"}}>Nota fiscal em nome do paciente</div>
            <div style={{background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#FCD34D",lineHeight:1.7}}>
              A nota fiscal emitida pela D-CAD não é passível de dedução no Imposto de Renda, uma vez que a atividade principal da empresa não se enquadra entre as atividades previstas pela legislação como dedutíveis para esse fim.
            </div>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:20}}>
              Ao confirmar, você concorda que está ciente desta condição e autoriza a emissão da nota fiscal em nome do paciente. Após a confirmação, informe os dados do paciente para a emissão correta.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowNFDisclaimer(false)} style={{flex:1,padding:"11px 0",background:C.dark3,border:`1px solid ${C.border}`,borderRadius:12,color:C.textSec,fontSize:13,cursor:"pointer"}}>
                Cancelar
              </button>
              <button onClick={()=>{setShowNFDisclaimer(false);setNfConfirmed(true);}} style={{flex:1,padding:"11px 0",background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.4)",borderRadius:12,color:"#FCD34D",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                Entendido — continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESPONSÁVEL PELO PAGAMENTO ── */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:8,letterSpacing:.5}}>RESPONSÁVEL PELO PAGAMENTO</div>
        <div style={{display:"flex",gap:8}}>
          {[
            {v:"dentista",icon:<Stethoscope size={14}/>,label:"Dentista"},
            {v:"paciente",icon:<User size={14}/>,label:"Paciente"},
          ].map(r=>(
            <button key={r.v} onClick={()=>{
              if(r.v===responsavel)return;
              setResponsavel(r.v);
              setMethod(null);
              setNfConfirmed(false);
              setNf({nome:"",cpf:"",rua:"",numero:"",bairro:"",complemento:"",cidade:"",estado:"",cep:""});
              if(r.v==="paciente")setShowNFDisclaimer(true);
            }} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 0",border:`1.5px solid ${responsavel===r.v?C.red:C.border}`,borderRadius:12,background:responsavel===r.v?"rgba(229,34,41,0.08)":C.dark2,color:responsavel===r.v?C.red:C.textSec,fontWeight:responsavel===r.v?700:400,fontSize:13,cursor:"pointer",transition:"all .15s"}}>
              <span>{r.icon}</span>{r.label}
            </button>
          ))}
        </div>
        {responsavel==="paciente"&&(
          <div style={{fontSize:13,color:C.yellow,marginTop:6,display:"flex",alignItems:"center",gap:5}}>
            <AlertTriangle size={12} style={{display:"inline",marginRight:4,verticalAlign:"middle"}}/> Cobrança a prazo não disponível para pagamento pelo paciente
          </div>
        )}
      </div>

      {/* ── DADOS DO PACIENTE PARA NF ── */}
      {responsavel==="paciente"&&nfConfirmed&&(
        <div style={{background:"rgba(229,34,41,0.06)",border:"1px solid rgba(229,34,41,0.18)",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.textSec,letterSpacing:1,marginBottom:12}}>DADOS DO PACIENTE — EMISSÃO DE NOTA FISCAL</div>
          <NfField label="Nome completo do paciente *" value={nf.nome} onChange={v=>setN("nome",v)} placeholder="Nome conforme documento"/>
          <NfField label="CPF *" value={nf.cpf} onChange={v=>setN("cpf",v)} placeholder="000.000.000-00"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 70px",gap:8}}>
            <NfField label="Rua / Avenida *" value={nf.rua} onChange={v=>setN("rua",v)} placeholder="Nome da rua"/>
            <NfField label="Número *" value={nf.numero} onChange={v=>setN("numero",v)} placeholder="100"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <NfField label="Bairro *" value={nf.bairro} onChange={v=>setN("bairro",v)} placeholder="Bairro"/>
            <NfField label="Complemento" value={nf.complemento} onChange={v=>setN("complemento",v)} placeholder="Apto, sala..."/>
            <NfField label="Cidade *" value={nf.cidade} onChange={v=>setN("cidade",v)} placeholder="Cidade"/>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textSec,marginBottom:4,letterSpacing:.4}}>ESTADO *</div>
              <select value={nf.estado} onChange={e=>setN("estado",e.target.value)}
                style={{width:"100%",background:C.dark2,border:`1px solid ${nf.estado?"rgba(229,34,41,0.35)":C.border}`,borderRadius:8,padding:"9px 10px",color:nf.estado?C.text:C.textSec,fontSize:12,outline:"none",boxSizing:"border-box"}}>
                <option value="">UF</option>
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <NfField label="CEP *" value={nf.cep} onChange={v=>setN("cep",v)} placeholder="00000-000"/>
          {(!nf.nome||!nf.cpf||!nf.rua||!nf.numero||!nf.cidade||!nf.estado||!nf.cep)&&(
            <div style={{fontSize:13,color:C.textSec,textAlign:"center",padding:"4px 0"}}>Preencha os campos obrigatórios para liberar o pagamento</div>
          )}
        </div>
      )}

      {/* ── MÉTODOS DE PAGAMENTO ── */}
      {responsavel&&(responsavel==="dentista"||(responsavel==="paciente"&&nfConfirmed&&nf.nome&&nf.cpf&&nf.rua&&nf.numero&&nf.cidade&&nf.estado&&nf.cep))&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:10,letterSpacing:.5}}>FORMA DE PAGAMENTO</div>
          {METHODS.map(m=>(
            <button key={m.id} onClick={()=>setMethod(m.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,
                background:method===m.id?m.color+"10":C.dark2,
                border:`1.5px solid ${method===m.id?m.color:C.border}`,
                borderRadius:12,padding:"13px 15px",cursor:"pointer",textAlign:"left",
                color:C.text,marginBottom:8,transition:"all .15s"}}>
              <div style={{width:44,height:44,borderRadius:12,background:m.tagColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontWeight:700,fontSize:13}}>{m.label}</span>
                  <span style={{fontSize:13,fontWeight:700,background:m.tagColor,color:m.tagText,padding:"2px 7px",borderRadius:16,flexShrink:0}}>{m.tag}</span>
                </div>
                <div style={{fontSize:13,color:C.textSec}}>{m.detail} <b style={{color:method===m.id?m.color:C.text,fontSize:13}}>{m.highlight}</b></div>
                <div style={{fontSize:12,color:C.textSec,marginTop:1}}>{m.sub}</div>
              </div>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${method===m.id?m.color:C.border}`,background:method===m.id?m.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {method===m.id&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
              </div>
            </button>
          ))}
          {method&&(
            <button onClick={handlePay} disabled={loading}
              style={{width:"100%",marginTop:4,padding:"13px 20px",
                background:loading?"#2a2a2a":METHODS.find(m=>m.id===method).color,
                border:"none",borderRadius:12,color:loading?C.textSec:"#fff",
                fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?"Processando...":METHODS.find(m=>m.id===method).action+" via InfinitePay →"}
            </button>
          )}
          <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <span style={{fontSize:12,color:C.textSec}}>Pagamento processado por</span>
            <span style={{fontSize:12,fontWeight:700,color:"#22C55E"}}>InfinitePay</span>
            <span style={{fontSize:12,color:C.textSec}}>SSL</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NfField({label,value,onChange,placeholder}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:12,fontWeight:700,color:C.textSec,marginBottom:4,letterSpacing:.4}}>{label}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:C.dark2,border:`1px solid ${value?"rgba(229,34,41,0.35)":C.border}`,borderRadius:8,padding:"9px 11px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
    </div>
  );
}

function Step({title,sub,badge,badgeColor,children,onBack}){return(<div>{onBack&&<BackBtn onClick={onBack}/>}{badge&&<span style={{display:"inline-block",fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",background:badgeColor+"22",color:badgeColor,padding:"3px 10px",borderRadius:16,marginBottom:10}}>{badge}</span>}<div style={{fontSize:18,fontWeight:800,lineHeight:1.3,marginBottom:5}}>{title}</div><div style={{fontSize:13,color:C.textSec,marginBottom:18,lineHeight:1.6}}>{sub}</div>{children}</div>);}
function BackBtn({onClick}){return(<button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.textSec,fontSize:13,cursor:"pointer",padding:"0 0 16px 0"}}>← Voltar</button>);}
function Btn({children,onClick,disabled,style:sx}){return(<button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"13px 20px",background:disabled?"#2a2a2a":C.red,border:"none",borderRadius:12,color:disabled?C.textMut:"#fff",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",...(sx||{})}}>{children}</button>);}
function Row({label,val,bold,red,small}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:small?"3px 0":"5px 0"}}><span style={{fontSize:small?11:13,color:bold?C.text:C.textSec}}>{label}</span><span style={{fontSize:small?11:13,fontWeight:bold?800:600,color:red?C.red:C.text}}>{val}</span></div>);}
function Field({label,value,onChange,placeholder,type="text"}){return(<div style={{marginBottom:12}}><label style={{fontSize:13,fontWeight:700,color:C.textSec,display:"block",marginBottom:5,letterSpacing:.5}}>{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:C.dark2,border:`1px solid ${value?"rgba(229,34,41,0.35)":C.border}`,borderRadius:12,padding:"11px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/></div>);}
function btnStyle(bg,disabled){return{width:"100%",padding:"13px 20px",background:disabled?"#2a2a2a":bg,border:"none",borderRadius:12,color:disabled?C.textMut:"#fff",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",marginBottom:0};}
