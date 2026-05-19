'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { getStoredToken } from '@/lib/api'
import { specialtyLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SPECIALTIES = [
  'garcom', 'bartender', 'aux_cozinha', 'promotor',
  'caixa', 'repositor', 'cuidador', 'aux_logistica',
]

const PIX_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'phone', label: 'Telefone' },
  { value: 'email', label: 'E-mail' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'random', label: 'Chave aleatória' },
]

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

const LEVEL_MAP: Record<string, { label: string; fg: string; bg: string; icon: string }> = {
  BEGINNER: { label: 'Iniciante', fg: C.textMute, bg: C.surface3, icon: '◐' },
  VERIFIED: { label: 'Verificado', fg: '#00805B', bg: '#E6FAF3', icon: '✓' },
  TOP_PRO:  { label: 'Top Pro', fg: '#C2511A', bg: '#FFF1E9', icon: '★' },
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', appearance: 'none' as const, outline: 0,
  border: `1.5px solid ${C.line}`, borderRadius: 12,
  padding: '12px 14px',
  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text,
  background: '#fff', transition: 'border-color 120ms',
}

export default function WorkerProfilePage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: () => api.get<WorkerProfile>('/workers/me'),
  })

  const [fullName, setFullName] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const token = getStoredToken('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/workers/me/photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Erro ao fazer upload da foto')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worker-profile'] }),
  })

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name)
    setPixKey(profile.pix_key ?? '')
    setPixKeyType(profile.pix_key_type ?? 'cpf')
    setSelectedSpecialties(profile.specialties)
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: () => api.put('/workers/me', { full_name: fullName, pix_key: pixKey || undefined, pix_key_type: pixKeyType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-profile'] })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    },
  })

  const specialtiesMutation = useMutation({
    mutationFn: () => api.put('/workers/me/specialties', { specialties: selectedSpecialties }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worker-profile'] }),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', background: C.surface2, minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!profile) return null

  const lv = LEVEL_MAP[profile.level] ?? LEVEL_MAP.BEGINNER
  const initials = (profile.full_name || '?').split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* navy header */}
      <div style={{
        background: C.navy, color: '#fff',
        padding: '40px 32px 72px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,196,140,0.22), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%, #000 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', position: 'relative',
              boxShadow: `0 0 0 3px ${C.jade}, 0 0 0 5px rgba(255,255,255,0.15)`,
            }}
          >
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="foto" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1B3FA0, #00C48C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22, color: '#fff',
              }}>
                {initials}
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 20, height: 20, borderRadius: '50%',
              background: photoMutation.isPending ? C.textMute : C.jade,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              {photoMutation.isPending ? (
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) photoMutation.mutate(file)
              e.target.value = ''
            }}
          />
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>
              {profile.full_name || 'Novo trabalhador'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: lv.bg, color: lv.fg,
                padding: '4px 10px', borderRadius: 999,
                fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700,
              }}>
                <span>{lv.icon}</span>{lv.label}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {profile.phone}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px',
      }}>
        {/* stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { value: Number(profile.score).toFixed(1), label: 'Score', suffix: '⭐' },
            { value: profile.total_shifts, label: 'Turnos' },
            { value: `${Number(profile.on_time_rate).toFixed(0)}%`, label: 'Pontualidade' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 16, padding: '14px 16px',
              border: `1px solid ${C.line}`, textAlign: 'center',
            }}>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: -0.6 }}>
                {s.value}{s.suffix}
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* personal data */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '22px 24px',
            border: `1px solid ${C.line}`,
            boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 18 }}>
              Dados pessoais
            </div>

            <FieldShell label="Nome completo">
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </FieldShell>

            <FieldShell label="Tipo de chave Pix">
              <select
                value={pixKeyType}
                onChange={e => setPixKeyType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              >
                {PIX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FieldShell>

            <FieldShell label="Chave Pix">
              <input
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="Sua chave para receber pagamentos"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </FieldShell>

            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              style={{
                width: '100%', appearance: 'none', border: 0,
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                background: saved ? C.jade : C.navy, color: '#fff',
                borderRadius: 12, padding: '13px 20px',
                fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                opacity: updateMutation.isPending ? 0.7 : 1,
                transition: 'all 200ms',
                boxShadow: saved ? '0 6px 14px rgba(0,196,140,0.25)' : '0 4px 12px rgba(14,42,120,0.2)',
              }}
            >
              {saved ? '✓ Salvo!' : updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          {/* specialties */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '22px 24px',
            border: `1px solid ${C.line}`,
            boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 18 }}>
              Especialidades
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SPECIALTIES.map(s => {
                const isSelected = selectedSpecialties.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSpecialties(prev =>
                      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                    )}
                    style={{
                      appearance: 'none', cursor: 'pointer',
                      background: isSelected ? '#E6FAF3' : C.surface3,
                      color: isSelected ? '#00805B' : C.textMute,
                      border: `1.5px solid ${isSelected ? C.jade : C.line}`,
                      borderRadius: 999, padding: '7px 14px',
                      fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 600,
                      transition: 'all 120ms',
                    }}
                  >
                    {isSelected && <span style={{ marginRight: 4 }}>✓</span>}
                    {specialtyLabel(s)}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => specialtiesMutation.mutate()}
              disabled={specialtiesMutation.isPending}
              style={{
                width: '100%', appearance: 'none', border: 0,
                cursor: specialtiesMutation.isPending ? 'not-allowed' : 'pointer',
                background: C.jade, color: C.jadeInk,
                borderRadius: 12, padding: '13px 20px',
                fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700,
                opacity: specialtiesMutation.isPending ? 0.7 : 1,
                boxShadow: '0 6px 14px rgba(0,196,140,0.25)',
                transition: 'all 200ms',
              }}
            >
              {specialtiesMutation.isPending ? 'Salvando...' : 'Atualizar especialidades'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
