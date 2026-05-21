'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { api, getStoredToken } from '@/lib/api'
import { specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface: '#FFFFFF', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SPECIALTIES = ['garcom', 'bartender', 'aux_cozinha', 'promotor', 'caixa', 'repositor', 'cuidador', 'aux_logistica']
const PIX_TYPES   = [
  { value: 'cpf',    label: 'CPF' },
  { value: 'phone',  label: 'Telefone' },
  { value: 'email',  label: 'E-mail' },
  { value: 'cnpj',   label: 'CNPJ' },
  { value: 'random', label: 'Chave aleatória' },
]

const LEVEL: Record<string, { label: string; fg: string; bg: string }> = {
  BEGINNER: { label: 'Iniciante', fg: C.textMute,  bg: C.surface3  },
  VERIFIED: { label: 'Verificado', fg: '#00805B', bg: '#E6FAF3' },
  TOP_PRO:  { label: 'Top Pro',   fg: '#C2511A', bg: '#FFF1E9' },
}

type WorkerProfile = {
  id: string
  user_id: string
  full_name: string
  phone: string
  photo_url: string | null
  score: number
  level: string
  total_shifts: number
  on_time_rate: number
  pix_key: string | null
  pix_key_type: string | null
  specialties: string[]
  is_verified: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%', appearance: 'none', outline: 0,
  border: `1.5px solid ${C.line}`, borderRadius: 11,
  padding: '11px 13px',
  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text,
  background: C.surface, transition: 'border-color 120ms', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontFamily: '"DM Sans", system-ui', fontSize: 11, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function WorkerProfilePage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
    placeholderData: (prev) => prev,
  })

  const [fullName, setFullName]       = useState('')
  const [pixKey, setPixKey]           = useState('')
  const [pixKeyType, setPixKeyType]   = useState('cpf')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [savedProfile, setSavedProfile]   = useState(false)
  const [savedSpec, setSavedSpec]         = useState(false)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setPixKey(profile.pix_key ?? '')
    setPixKeyType(profile.pix_key_type ?? 'cpf')
    setSpecialties(profile.specialties ?? [])
  }, [profile])

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const token = getStoredToken('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/workers/me/photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      if (!res.ok) throw new Error('Erro ao fazer upload da foto')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worker-profile'] }),
  })

  const updateMutation = useMutation({
    mutationFn: () => api.put('/workers/me', { full_name: fullName, pix_key: pixKey || undefined, pix_key_type: pixKeyType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-profile'] })
      setSavedProfile(true)
      setTimeout(() => setSavedProfile(false), 2500)
    },
  })

  const specMutation = useMutation({
    mutationFn: () => api.put('/workers/me/specialties', { specialties }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-profile'] })
      setSavedSpec(true)
      setTimeout(() => setSavedSpec(false), 2500)
    },
  })

  if (isLoading && !profile) {
    return (
      <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ height: 26, width: 200, borderRadius: 7, background: C.surface3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ height: 14, width: 150, borderRadius: 5, background: C.surface3, marginTop: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
      </div>
    )
  }
  if (!profile) return null

  const lv = LEVEL[profile.level] ?? LEVEL.BEGINNER
  const initials = (profile.full_name || '?')
    .split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '32px 40px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        {/* Avatar */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.line}` }}>
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="foto" style={{ width: 60, height: 60, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 60, height: 60, background: 'linear-gradient(135deg, #1B3FA0, #00C48C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22, color: '#fff',
              }}>
                {initials}
              </div>
            )}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 20, height: 20, borderRadius: '50%',
            background: photoMutation.isPending ? C.textSoft : C.jade,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${C.surface2}`,
          }}>
            {photoMutation.isPending ? (
              <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
            )}
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) photoMutation.mutate(f); e.target.value = '' }}
        />

        <div>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.6, margin: '0 0 6px' }}>
            {profile.full_name || 'Novo trabalhador'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-block', background: lv.bg, color: lv.fg,
              padding: '4px 10px', borderRadius: 999,
              fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700,
            }}>
              {lv.label}
            </span>
            <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textSoft }}>
              {profile.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { value: Number(profile.score).toFixed(1), label: 'Score' },
          { value: String(profile.total_shifts),     label: 'Turnos realizados' },
          { value: `${Number(profile.on_time_rate).toFixed(0)}%`, label: 'Pontualidade' },
        ].map(s => (
          <div key={s.label} style={{ background: C.surface, borderRadius: 13, padding: '14px 16px', border: `1px solid ${C.line}`, textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* Personal data */}
        <div style={{ background: C.surface, borderRadius: 18, padding: '22px 24px', border: `1px solid ${C.line}` }}>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3, margin: '0 0 18px' }}>
            Dados pessoais
          </h2>

          <Field label="Nome completo">
            <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e  => (e.target.style.borderColor = C.line)}
            />
          </Field>

          <Field label="Tipo de chave Pix">
            <div style={{ position: 'relative' }}>
              <select value={pixKeyType} onChange={e => setPixKeyType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', paddingRight: 36 }}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e  => (e.target.style.borderColor = C.line)}
              >
                {PIX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path d="M6 9l6 6 6-6" stroke={C.textSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Field>

          <Field label="Chave Pix">
            <input value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Sua chave para receber pagamentos" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e  => (e.target.style.borderColor = C.line)}
            />
          </Field>

          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0, cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
              background: C.navy, color: '#fff',
              borderRadius: 11, padding: '12px 20px',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
              opacity: updateMutation.isPending ? 0.7 : 1,
            }}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 8,
            opacity: savedProfile ? 1 : 0,
            transition: 'opacity 300ms',
            fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.jadeDeep, fontWeight: 600,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.jadeDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dados salvos com sucesso
          </div>
        </div>

        {/* Specialties */}
        <div style={{ background: C.surface, borderRadius: 18, padding: '22px 24px', border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3, margin: '0 0 18px' }}>
            Especialidades
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, flex: 1, alignContent: 'flex-start' }}>
            {SPECIALTIES.map(s => {
              const on = specialties.includes(s)
              return (
                <button
                  key={s}
                  onClick={() => setSpecialties(prev => on ? prev.filter(x => x !== s) : [...prev, s])}
                  style={{
                    appearance: 'none', cursor: 'pointer',
                    background: on ? '#E6FAF3' : C.surface3,
                    color: on ? '#00805B' : C.textMute,
                    border: `1.5px solid ${on ? C.jade : C.line}`,
                    borderRadius: 999, padding: '6px 13px',
                    fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600,
                    transition: 'all 100ms',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {on && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#00805B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  {specialtyLabel(s)}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => specMutation.mutate()}
            disabled={specMutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0, cursor: specMutation.isPending ? 'not-allowed' : 'pointer',
              background: C.navy, color: '#fff',
              borderRadius: 11, padding: '12px 20px',
              fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
              opacity: specMutation.isPending ? 0.7 : 1,
            }}
          >
            {specMutation.isPending ? 'Salvando...' : 'Atualizar especialidades'}
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 8,
            opacity: savedSpec ? 1 : 0,
            transition: 'opacity 300ms',
            fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.jadeDeep, fontWeight: 600,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.jadeDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Especialidades atualizadas
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
