'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { segmentLabel } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SEGMENTS = ['bar', 'restaurante', 'evento', 'hotel', 'varejo', 'saude', 'logistica', 'outro']

type BusinessProfile = {
  id: string
  trade_name: string
  legal_name: string
  cnpj: string
  segment: string
  score: number
  address: { street: string; number: string; neighborhood: string; city: string; state: string; zip: string }
  user: { full_name: string; phone: string }
}

const inputStyle: React.CSSProperties = {
  width: '100%', appearance: 'none', outline: 0,
  border: `1.5px solid ${C.line}`, borderRadius: 12,
  padding: '12px 14px',
  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text,
  background: '#fff', transition: 'border-color 120ms', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  )
}

function SetupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    cnpj: '', trade_name: '', legal_name: '', segment: 'restaurante',
    street: '', number: '', neighborhood: '', city: '', state: '', zip: '',
  })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: () => api.post('/businesses/me', {
      cnpj: form.cnpj.replace(/\D/g, ''),
      trade_name: form.trade_name,
      legal_name: form.legal_name,
      segment: form.segment,
      address: {
        street: form.street, number: form.number,
        neighborhood: form.neighborhood, city: form.city,
        state: form.state.toUpperCase(),
        zip: form.zip.replace(/\D/g, ''),
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      router.replace('/business')
    },
    onError: (e: any) => setError(e.message),
  })

  function set(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleSubmit() {
    setError('')
    const cnpjDigits = form.cnpj.replace(/\D/g, '')
    if (cnpjDigits.length !== 14) { setError('CNPJ deve ter 14 dígitos'); return }
    if (!form.trade_name.trim()) { setError('Nome fantasia obrigatório'); return }
    if (!form.legal_name.trim()) { setError('Razão social obrigatória'); return }
    const zipDigits = form.zip.replace(/\D/g, '')
    if (zipDigits.length !== 8) { setError('CEP deve ter 8 dígitos'); return }
    if (!form.street.trim() || !form.number.trim() || !form.city.trim() || form.state.length < 2) {
      setError('Preencha todos os campos de endereço'); return
    }
    createMutation.mutate()
  }

  return (
    <div style={{ background: C.surface2, minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 26, fontWeight: 800,
            color: C.navy, letterSpacing: -0.8, marginBottom: 8,
          }}>
            Configure sua empresa
          </div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.textMute }}>
            Preencha os dados para começar a publicar vagas
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 32px', border: `1px solid ${C.line}`, boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)' }}>
          <Field label="CNPJ (somente números)">
            <input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00000000000000"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
          </Field>

          <Field label="Nome fantasia">
            <input value={form.trade_name} onChange={e => set('trade_name', e.target.value)} placeholder="Ex: Bar do João"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
          </Field>

          <Field label="Razão social">
            <input value={form.legal_name} onChange={e => set('legal_name', e.target.value)} placeholder="Ex: João Silva ME"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
          </Field>

          <Field label="Segmento">
            <select value={form.segment} onChange={e => set('segment', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            >
              {SEGMENTS.map(s => <option key={s} value={s}>{segmentLabel(s)}</option>)}
            </select>
          </Field>

          <div style={{ height: 1, background: C.line, margin: '20px 0' }} />

          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>
            Endereço
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <Field label="Rua">
              <input value={form.street} onChange={e => set('street', e.target.value)} placeholder="Rua das Flores"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
            <Field label="Número">
              <input value={form.number} onChange={e => set('number', e.target.value)} placeholder="123"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Bairro">
              <input value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Centro"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
            <Field label="CEP (somente números)">
              <input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="85501000"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
            <Field label="Cidade">
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pato Branco"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
            <Field label="UF">
              <input value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} placeholder="PR"
                style={{ ...inputStyle, textTransform: 'uppercase' }}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0,
              cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
              background: C.jade, color: C.jadeInk,
              borderRadius: 12, padding: '15px 20px',
              fontFamily: '"DM Sans", system-ui', fontSize: 15, fontWeight: 700,
              opacity: createMutation.isPending ? 0.7 : 1,
              boxShadow: '0 6px 14px rgba(0,196,140,0.25)', marginTop: 8,
            }}
          >
            {createMutation.isPending ? 'Criando...' : 'Criar perfil da empresa'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BusinessProfilePage() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === '1'

  const { data: profile, isLoading, error: profileError } = useQuery({
    queryKey: ['business-profile'],
    queryFn: () => api.get<BusinessProfile>('/businesses/me'),
    retry: false,
  })

  const [form, setForm] = useState({
    trade_name: '', legal_name: '', segment: 'restaurante',
    street: '', number: '', neighborhood: '', city: '', state: '', zip: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    const p = profile as any
    setForm({
      trade_name: p.trade_name ?? '',
      legal_name: p.legal_name ?? '',
      segment: p.segment ?? 'restaurante',
      street: p.address?.street ?? '',
      number: p.address?.number ?? '',
      neighborhood: p.address?.neighborhood ?? '',
      city: p.address?.city ?? '',
      state: p.address?.state ?? '',
      zip: p.address?.zip ?? '',
    })
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: () => api.put('/businesses/me', {
      trade_name: form.trade_name,
      legal_name: form.legal_name,
      segment: form.segment,
      address: { street: form.street, number: form.number, neighborhood: form.neighborhood, city: form.city, state: form.state, zip: form.zip },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    },
  })

  function set(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', background: C.surface2, minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.jade}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (profileError || (!profile && isSetup)) {
    return <SetupPage />
  }

  if (!profile) return null

  const p = profile as any
  const firstLetter = p.trade_name?.[0] ?? 'E'

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
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: C.orange, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Bricolage Grotesque", system-ui', fontWeight: 700, fontSize: 22,
            boxShadow: '0 4px 14px rgba(255,107,53,0.4)', flexShrink: 0,
          }}>
            {firstLetter}
          </div>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>
              {p.trade_name}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              {p.cnpj} · {segmentLabel(p.segment)}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: -32, background: C.surface2,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 32px 40px',
      }}>
        {/* score + cnpj */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1px solid ${C.line}`, textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: -0.6 }}>
              {Number(p.score).toFixed(1)} ⭐
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 4 }}>Score</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1px solid ${C.line}`, textAlign: 'center' }}>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 700, color: C.text }}>
              {p.cnpj}
            </div>
            <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textSoft, marginTop: 4 }}>CNPJ</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* company data */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '22px 24px',
            border: `1px solid ${C.line}`,
            boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 18 }}>
              Dados da empresa
            </div>

            <Field label="Nome fantasia">
              <input value={form.trade_name} onChange={e => set('trade_name', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>

            <Field label="Razão social">
              <input value={form.legal_name} onChange={e => set('legal_name', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>

            <Field label="Segmento">
              <select value={form.segment} onChange={e => set('segment', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              >
                {SEGMENTS.map(s => <option key={s} value={s}>{segmentLabel(s)}</option>)}
              </select>
            </Field>

            {updateMutation.isError && (
              <div style={{
                background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px',
                fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', marginBottom: 12,
              }}>
                {(updateMutation.error as any)?.message}
              </div>
            )}

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

          {/* address */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '22px 24px',
            border: `1px solid ${C.line}`,
            boxShadow: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 18 }}>
              Endereço
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
              <Field label="Rua">
                <input value={form.street} onChange={e => set('street', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
              <Field label="Número">
                <input value={form.number} onChange={e => set('number', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <Field label="Bairro">
                <input value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
              <Field label="CEP">
                <input value={form.zip} onChange={e => set('zip', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
              <Field label="Cidade">
                <input value={form.city} onChange={e => set('city', e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
              <Field label="UF">
                <input value={form.state} onChange={e => set('state', e.target.value)} maxLength={2}
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                  onFocus={e => (e.target.style.borderColor = C.navy)}
                  onBlur={e => (e.target.style.borderColor = C.line)}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
