// Catálogo base e cálculo de preço do Portal do Cliente.
// Usado pelo navegador (Wizard) para mostrar o preço e pelo servidor (/api/pedidos) para conferir
// o valor antes de registrar e cobrar o pedido — os dois calculam exatamente igual.

// Preços de referência e taxas fixas
export const P={preplan:150,unit:388.98,strauAdd:110,provCaptura:100,provAdesiva:120,cicatriz:80,slicedFile:50,dsd3dProto:700}; // dsd3dProto = placeholder
// Urgência: % sobre o valor do serviço + fator de prazo (Expresso +20% / Urgente +40%)
export const URGENCY_TIERS=[
  {id:"normal",label:"Prazo normal",feePercent:0,planFactor:1},
  {id:"expresso",label:"Expresso",feePercent:0.20,planFactor:0.5},
  {id:"urgente",label:"Urgente",feePercent:0.40,planFactor:0.25},
];
export const SUP=[[18,17,16,15,14,13,12,11],[21,22,23,24,25,26,27,28]];
export const SUP_ALL=[...SUP[0],...SUP[1]];

// Desconto por tipo de conta: clínicas/radiologias e cursos aprovados têm 15%
export function descontoDaConta(accountType, accountStatus){
  return accountStatus==="active"&&(accountType==="clinica"||accountType==="cursos")?0.15:0;
}
// Tipo de cliente do cadastro → tipo de conta usado no preço
export const tipoDaConta=tipo=>({radiologia:"clinica",dentista_clinica:"dentista"}[tipo]||tipo||"dentista");

export const CATALOG=[
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
  {id:"perio",name:"Periodontia",color:"#B8B8B8",icon:"ti-plant",desc:"Perioguide",
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

// Mescla o catálogo do banco (fetchCatalog) com os campos que só existem no catálogo base
export function mesclarCatalogo(data){
  return data.map((dynSpec) => {
    // Fora da Implantodontia o fluxo segue as etapas ligadas no Admin (sem dentes/marca/kit de implante)
    const generico = dynSpec.id !== "implanto";
    const staticSpec = CATALOG.find((s) => s.id === dynSpec.id);
    if (!staticSpec) return { ...dynSpec, services: dynSpec.services.map((sv) => ({ ...sv, generico })) };
    return {
      ...staticSpec,
      ...dynSpec,
      services: dynSpec.services.map((dynSvc) => {
        // Correspondência com o catálogo do código: pelo id, depois pelo nome; pelo tipo só se ele for único
        // (os três protocolos têm o mesmo tipo e eram todos tratados como o Edêntulo Total)
        const mesmoTipo = staticSpec.services.filter((s) => s.type && s.type === dynSvc.type);
        const staticSvc = staticSpec.services.find((s) => s.id === dynSvc.id)
          || staticSpec.services.find((s) => s.name === dynSvc.name)
          || (mesmoTipo.length === 1 ? mesmoTipo[0] : undefined);
        if (!staticSvc) return { ...dynSvc, generico };
        // Arquivo fatiado só quando a etapa está ligada no Admin
        const fatiado = dynSvc.steps ? !!dynSvc.steps.sliced : undefined;
        return {
          ...staticSvc,
          generico,
          steps:    dynSvc.steps,
          fluxo:    dynSvc.fluxo,
          unidade:  dynSvc.unidade,
          precoPorDente: dynSvc.precoPorDente,
          maxTeeth: dynSvc.maxTeeth ?? staticSvc.maxTeeth,
          // Tabela "preço total por quantidade" do Admin (desconto por quantidade fora da Implantodontia)
          tabelaQtd: generico ? dynSvc.priceByQty : undefined,
          // Etapas personalizadas: ordem das etapas do meio e definições (Serviços → Etapas personalizadas)
          ordemEtapas: dynSvc.ordemEtapas,
          etapasPers: dynSvc.etapasPers,
          // Campos que vêm do Supabase sobrescrevem o estático:
          _supabaseId: dynSvc._supabaseId, // id do serviço no banco (pedido, cupom e banners)
              name:     dynSvc.name     || staticSvc.name,
          desc:     dynSvc.desc     || staticSvc.desc,
          fullDesc: dynSvc.fullDesc || staticSvc.fullDesc,
          exams:    dynSvc.exams?.length ? dynSvc.exams    : staticSvc.exams,
          includes: dynSvc.includes?.length ? dynSvc.includes : staticSvc.includes,
          imagens:  dynSvc.imagens?.length  ? dynSvc.imagens  : (staticSvc.imagens || []),
          days:     dynSvc.days     || staticSvc.days,
          // Preço vem do Supabase apenas se autenticado (RLS); caso null usa estático
          price:    dynSvc.price    ?? staticSvc.price,
          // "Só planejamento" só existe se o serviço tiver preço/prazo de planejamento no admin
          planOnly: dynSvc.planOnly
            ? {
                ...staticSvc.planOnly,
                ...dynSvc.planOnly,
                price: dynSvc.planOnly.price ?? staticSvc.planOnly?.price,
                days:  dynSvc.planOnly.days  ?? staticSvc.planOnly?.days,
                ...(fatiado === undefined ? {} : { offersSlicedFile: fatiado && (staticSvc.planOnly?.offersSlicedFile ?? dynSvc.planOnly.offersSlicedFile ?? true) }),
              }
            : null,
        };
      }),
    };
  });
}

// Serviço como o Wizard usa no cálculo: no modo "só planejamento" os dados do planOnly sobrescrevem
/** Quantidade do item para acréscimos "por arcada/dente": arcadas escolhidas ou dentes marcados */
export function quantidadeDoItem(service,sv){
  const arcadas=(sv.arch?.sup?1:0)+(sv.arch?.inf?1:0);
  if(service?.usesArch||service?.fluxo==="arch")return Math.max(1,arcadas);
  return Math.max(1,sv.teeth?.length||0);
}

/** Soma dos acréscimos das opções escolhidas nas etapas personalizadas cobradas */
export function acrescimoEtapas(service,sv){
  const defs=service?.etapasPers||{};
  const resp=sv?.etapas||{};
  let soma=0;
  for(const [id,escolhas] of Object.entries(resp)){
    const e=defs[id];
    if(!e||!e.cobrada||!Array.isArray(escolhas))continue;
    for(const opId of escolhas){
      const o=(e.opcoes||[]).find(x=>x.id===opId);
      if(!o||!(o.acrescimo>0))continue;
      soma+=o.acrescimo*(o.cobranca==="quantidade"?quantidadeDoItem(service,sv):1);
    }
  }
  return soma;
}

export function servicoParaCalculo(sv, serviceType){
  return {...sv,...(serviceType==="planOnly"&&sv.planOnly?sv.planOnly:{})};
}

export function calcularPrecoItem({ service, serviceType, discount }, sv){
    const nTeeth=sv.teeth?.length||0;
    const supCount=(sv.teeth||[]).filter(t=>SUP_ALL.includes(t)).length;
    const infCount=(sv.teeth||[]).filter(t=>!SUP_ALL.includes(t)).length;
    const archCount=(sv.arch?.sup?1:0)+(sv.arch?.inf?1:0)||1;

    // ── Regras de precificação do catálogo ─────────────────────────────────
    const pr=service?.pricing||{};
    const baseMode=pr.baseMode||(service?.priceByQty?'per_qty':service?.usesArch&&service?.archAffectsPrice?'per_arch':'fixed');
    const pbyq=baseMode==='per_qty'?(pr.priceByQty||service?.priceByQty||(serviceType==="planOnly"&&service?.planOnly?.priceByQty)||null):null;

    let t=0;
    if(service?.generico){
      // Fora da Implantodontia: arcada cobra por arcada se a unidade for arco/arcada; dentes cobram por dente se marcado no Admin
      // Tabela por quantidade (preço total para N arcadas/dentes) tem prioridade sobre a regra
      t=service?.price||0;
      const selArcadas=(sv.arch?.sup?1:0)+(sv.arch?.inf?1:0);
      const qtd=service.fluxo==="arch"?selArcadas:service.fluxo==="odonto"?nTeeth:0;
      const tab=serviceType==="planOnly"?service.planOnly?.priceByQty:(service.tabelaQtd||service.priceByQty);
      const daTabela=qtd>0&&tab?Number(tab[qtd]??tab[String(qtd)]):NaN;
      if(daTabela>0)t=daTabela;
      else if(service.fluxo==="arch"&&["arco","arcada"].includes(service.unidade)&&selArcadas>0)t*=selArcadas;
      else if(service.fluxo==="odonto"&&service.precoPorDente&&nTeeth>0)t*=nTeeth;
    } else if(pbyq){
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

    // ── Etapas personalizadas cobradas (acréscimo por opção: uma vez ou por arcada/dente) ──
    t+=acrescimoEtapas(service,sv);

    // ── Arquivo p/ impressão ───────────────────────────────────────────────
    if(sv.slicedFile&&serviceType==="planOnly"&&service?.planOnly?.offersSlicedFile){
      const slicedStep=Array.isArray(service?.steps)?service.steps.find(s=>s.type==='file'||s.k==='sliced'):null;
      t+=(slicedStep?.data?.price||P.slicedFile);
    }

    return parseFloat((t*(1-discount)).toFixed(2));
  }
