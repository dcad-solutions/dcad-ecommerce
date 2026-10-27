/**
 * catalog.ts — Busca serviços do Supabase e retorna no mesmo formato
 * do array CATALOG estático usado pelo Wizard.jsx.
 *
 * Preços NUNCA são expostos sem login (RLS via preco_po = null para não-autenticados
 * e o fetch aqui usa o client anônimo — se preco for null na resposta, o Wizard
 * usa o valor do CATALOG estático como fallback, mas NUNCA exibe ao usuário não logado).
 */

import { supabase } from './supabase'

export interface PlanOnly {
  name: string
  desc?: string
  fullDesc?: string
  price: number | null
  days: number | null
  exams?: string[]
  offersSlicedFile?: boolean
  priceByQty?: Record<string, number>
}

export interface CatalogService {
  id: string
  type: string
  groupLabel?: string
  name: string
  desc: string
  fullDesc: string
  exams: string[]
  includes: string[]
  price: number | null
  days: number
  built: boolean
  videoUrl: string | null
  // Implantodontia
  usesOdontogram?: boolean
  maxTeeth?: number
  usesArch?: boolean
  archAffectsPrice?: boolean
  usesBrand?: boolean
  usesKit?: boolean
  offersUpsell?: boolean
  offersSlicedFile?: boolean
  priceByQty?: Record<string, number>
  planOnly?: PlanOnly | null
  // Imagens do serviço (Storage Supabase)
  imagens?: string[]
  // Metadados do Supabase
  _supabaseId?: number
}

export interface CatalogSpecialty {
  id: string
  name: string
  color: string
  icon: string
  desc: string
  imagem?: string
  services: CatalogService[]
}

/** Mapeamento de especialidade (coluna `especialidade` no Supabase) → metadados visuais */
const SPECIALTY_META: Record<string, { color: string; icon: string; desc: string }> = {
  'Implantodontia':       { color: '#E52229', icon: 'ti-tooth',         desc: 'Cirurgia guiada de implantes' },
  'Estética Dental':      { color: '#EA580C', icon: 'ti-sparkles',      desc: 'Planejamento digital do sorriso' },
  'Reabilitação Oral':    { color: '#16A34A', icon: 'ti-dental',        desc: 'Planejamento funcional 3D' },
  'DTM e Bruxismo':       { color: '#CA8A04', icon: 'ti-shield',        desc: 'Placa oclusal digital' },
  'Periodontia':          { color: '#6B7280', icon: 'ti-plant',         desc: 'Perioguide' },
  'Endodontia':           { color: '#2563EB', icon: 'ti-microscope',    desc: 'Guia de acesso endodôntico' },
  'Impressão 3D':         { color: '#0D9488', icon: 'ti-3d-cube-sphere',desc: 'Modelos e biomodelos' },
  'Consultoria Digital':  { color: '#DC2626', icon: 'ti-bulb',          desc: 'Suporte especializado' },
}

/** Mapeamento de id de especialidade (formato URL-safe) */
function especialidadeToId(esp: string): string {
  const map: Record<string, string> = {
    'Implantodontia':      'implanto',
    'Estética Dental':     'estetica',
    'Reabilitação Oral':   'reab',
    'DTM e Bruxismo':      'dtm',
    'Periodontia':         'perio',
    'Endodontia':          'endo',
    'Impressão 3D':        'imp3d',
    'Consultoria Digital': 'consult',
  }
  return map[esp] || esp.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

/** Converte wizard_steps JSONB → flags booleanas do Wizard */
function wizardStepsToFlags(ws: Record<string, boolean> | null) {
  if (!ws) return {}
  return {
    usesOdontogram: false,  // determinado pelo tipo, não pelo wizard_steps
    usesArch:        ws.preplan === false ? false : undefined, // arcada = protocolo
    usesBrand:       ws.marca    ?? false,
    usesKit:         ws.marca    ?? false,  // kit sempre junto com marca
    offersUpsell:    ws.adicionais ?? false,
    offersSlicedFile: ws.sliced  ?? false,
  }
}

/** Converte uma linha do Supabase para CatalogService */
function rowToService(row: Record<string, unknown>): CatalogService {
  const ws = row.wizard_steps as Record<string, boolean> | null
  const tipo = String(row.tipo || '')
  const flags = wizardStepsToFlags(ws)

  // Odontograma: apenas cirurgias guiadas
  const usesOdontogram = tipo === 'cirurgia_guiada_unitaria' || tipo === 'cirurgia_guiada_parcial'
  // Arcada: protocolos e stackable
  const usesArch = tipo === 'protocolo' || tipo === 'stackable'

  // planOnly: só existe se preco_po ou prazo_po estiverem preenchidos
  let planOnly: PlanOnly | null = null
  if (row.preco_po !== null || row.prazo_po !== null) {
    planOnly = {
      name:          `Planejamento — ${String(row.nome)}`,
      price:         row.preco_po as number | null,
      days:          row.prazo_po as number | null,
      exams:         (row.exames as string[]) || [],
      offersSlicedFile: ws?.sliced ?? false,
    }
  }

  const service: CatalogService = {
    id:            String(row.tipo || row.id),
    _supabaseId:   row.id as number,
    type:          tipo,
    groupLabel:    row.grupo as string | undefined,
    name:          String(row.nome),
    desc:          String(row.descricao || ''),
    fullDesc:      String(row.desc_completa || row.descricao || ''),
    exams:         (row.exames as string[]) || [],
    includes:      (row.inclui as string[]) || [],
    price:         row.preco as number | null,
    days:          Number(row.prazo_padrao) || 7,
    built:         false,
    videoUrl:      null,
    planOnly,
    imagens: (row.imagens as string[]) || [],
    // Flags do wizard
    usesOdontogram,
    usesArch,
    archAffectsPrice: usesArch,
    ...flags,
    maxTeeth:      row.max_dentes as number | undefined,
  }

  return service
}

/** Busca o catálogo do Supabase e retorna no formato CatalogSpecialty[] */
export async function fetchCatalog(): Promise<CatalogSpecialty[]> {
  // Busca serviços e imagens das especialidades em paralelo
  const [servicosResult, especialidadesResult] = await Promise.all([
    supabase.from('servicos').select('*').eq('ativo', true).order('especialidade').order('nome'),
    supabase.from('especialidades').select('nome, imagem').eq('ativo', true),
  ])

  const { data, error } = servicosResult

  if (error || !data || data.length === 0) {
    console.warn('[D-CAD] fetchCatalog: usando fallback estático.', error?.message)
    return [] // Wizard.jsx usará CATALOG estático
  }

  // Mapa nome da especialidade → imagem
  const imagemMap: Record<string, string> = {}
  for (const esp of (especialidadesResult.data || [])) {
    if (esp.imagem) imagemMap[String(esp.nome)] = String(esp.imagem)
  }

  // Agrupar por especialidade
  const grouped: Record<string, { rows: Record<string, unknown>[] }> = {}
  for (const row of data) {
    const esp = String(row.especialidade || 'Outros')
    if (!grouped[esp]) grouped[esp] = { rows: [] }
    grouped[esp].rows.push(row as Record<string, unknown>)
  }

  const catalog: CatalogSpecialty[] = Object.entries(grouped).map(([esp, { rows }]) => {
    const meta = SPECIALTY_META[esp] || { color: '#6B7280', icon: 'ti-star', desc: esp }
    const specId = especialidadeToId(esp)
    return {
      id:       specId,
      name:     esp,
      color:    meta.color,
      icon:     meta.icon,
      desc:     meta.desc,
      imagem:   imagemMap[esp],
      services: rows.map(rowToService),
    }
  })

  return catalog
}
