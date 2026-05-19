'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { specialtyLabel, formatCurrency } from '@/lib/format'

const C = {
  navy: '#0E2A78', jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35', text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SPECIALTIES = [
  'garcom', 'bartender', 'aux_cozinha', 'promotor',
  'caixa', 'repositor', 'cuidador', 'aux_logistica',
]

const inputStyle: React.CSSProperties = {
  width: '100%', appearance: 'none', outline: 0,
  border: `1.5px solid ${C.line}`, borderRadius: 12,
  padding: '12px 14px',
  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text,
  background: '#fff', transition: 'border-color 120ms',
}

function FieldShell({ icon, label, sub, children }: { icon: string; label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 14,
      border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: C.surface3,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d={icon} stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </div>
        {children}
        {sub && <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, color: C.textMute, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700,
      color: C.text, letterSpacing: -0.3, marginBottom: 10, marginTop: 24,
    }}>
      {children}
    </div>
  )
}

export default function CreateShiftPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    specialty: 'garcom',
    starts_at: '',
    ends_at: '',
    rate_per_hour: '',
    slots: 1,
    is_urgent: false,
    instructions: '',
  })

  function set(field: string, value: string | boolean | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const hours = form.starts_at && form.ends_at
    ? Math.max(0, (new Date(form.ends_at).getTime() - new Date(form.starts_at).getTime()) / 3600000)
    : 0
  const rateNum = Number(form.rate_per_hour || 0)
  const total = hours * rateNum * form.slots
  const fee = total * 0.18
  const workerAmount = total - fee

  const mutation = useMutation({
    mutationFn: () => api.post('/shifts', {
      specialty: form.specialty,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      rate_per_hour: rateNum,
      slots: form.slots,
      is_urgent: form.is_urgent,
      instructions: form.instructions || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] })
      router.push('/business/shifts')
    },
  })

  const canSubmit = form.specialty && form.starts_at && form.ends_at && rateNum > 0 && hours > 0

  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ background: C.surface2, minHeight: '100vh' }}>
      {/* header */}
      <div style={{
        background: '#fff', padding: '28px 32px 20px',
        borderBottom: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            width: 36, height: 36, borderRadius: 10, background: C.surface3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={C.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Nova vaga
          </div>
          <div style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>
            Postar turno
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 32px 120px' }}>
        <SectionTitle>O turno</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FieldShell icon="M4 8h16v12H4zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 14h18" label="Função">
            <select
              value={form.specialty}
              onChange={e => set('specialty', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            >
              {SPECIALTIES.map(s => <option key={s} value={s}>{specialtyLabel(s)}</option>)}
            </select>
          </FieldShell>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldShell icon="M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4" label="Início">
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={e => set('starts_at', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </FieldShell>
            <FieldShell icon="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" label="Término">
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => set('ends_at', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </FieldShell>
          </div>

          {hours > 0 && (
            <div style={{
              background: '#E6FAF3', borderRadius: 10, padding: '9px 14px',
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: '#00805B',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#00805B" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Duração: {hours.toFixed(1)} horas
            </div>
          )}
        </div>

        <SectionTitle>Detalhes</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* slots stepper */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '12px 14px',
            border: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: C.surface3,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-15 9a6 6 0 0 1 12 0M16 14a5 5 0 0 1 5 6" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Número de vagas
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute, marginTop: 1 }}>
                Quantos trabalhadores você precisa
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.surface2, borderRadius: 12, padding: 4,
            }}>
              <button
                onClick={() => set('slots', Math.max(1, form.slots - 1))}
                style={{
                  appearance: 'none', cursor: 'pointer', border: 0,
                  width: 32, height: 32, borderRadius: 8, background: '#fff',
                  fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700,
                  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >–</button>
              <div style={{
                minWidth: 28, textAlign: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 800, color: C.text,
              }}>
                {form.slots}
              </div>
              <button
                onClick={() => set('slots', Math.min(20, form.slots + 1))}
                style={{
                  appearance: 'none', cursor: 'pointer', border: 0,
                  width: 32, height: 32, borderRadius: 8, background: '#fff',
                  fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 700,
                  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >+</button>
            </div>
          </div>

          {/* instructions */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: 14,
            border: `1px solid ${C.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: C.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 5h14M5 12h14M5 19h9" stroke={C.navy} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Instruções para o trabalhador
              </div>
            </div>
            <textarea
              value={form.instructions}
              onChange={e => set('instructions', e.target.value)}
              placeholder="Ex.: Camisa preta lisa, sapato fechado, RG com foto. Apresentar-se 15 min antes."
              rows={3}
              maxLength={500}
              style={{
                width: '100%', appearance: 'none', border: 0, outline: 0,
                fontFamily: '"DM Sans", system-ui', fontSize: 14, color: C.text,
                background: 'transparent', resize: 'none', lineHeight: 1.45, padding: 0,
              }}
            />
          </div>

          {/* urgent toggle */}
          <label style={{
            background: '#fff', borderRadius: 14, padding: '12px 14px',
            border: `1px solid ${form.is_urgent ? C.orange : C.line}`,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            transition: 'border-color 120ms',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: form.is_urgent ? '#FFF1E9' : C.surface3,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 120ms',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill={form.is_urgent ? C.orange : 'none'}>
                <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7Z" stroke={form.is_urgent ? C.orange : C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600, color: form.is_urgent ? C.orange : C.text }}>
                Marcar como urgente
              </div>
              <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, marginTop: 1 }}>
                Aparece em destaque para os trabalhadores
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.is_urgent}
              onChange={e => set('is_urgent', e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.orange }}
            />
          </label>
        </div>

        <SectionTitle>Pagamento</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FieldShell icon="M12 6v12M9 9h4a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h4" label="Valor por hora (R$)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rate_per_hour}
              onChange={e => set('rate_per_hour', e.target.value)}
              placeholder="Ex: 25.00"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
          </FieldShell>

          {total > 0 && (
            <>
              <div style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: `1px solid ${C.line}`,
              }}>
                {[
                  { label: `${hours.toFixed(1)}h × ${form.slots} vaga${form.slots > 1 ? 's' : ''} × R$${form.rate_per_hour}/h`, value: `R$ ${fmt(total)}`, bold: false },
                  { label: 'Comissão Laboro · 18%', value: `R$ ${fmt(fee)}`, muted: true, bold: false },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>{row.label}</span>
                    <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.textMute }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: C.lineSoft, margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700, color: C.text }}>Total reservado em escrow</span>
                  <span style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.4 }}>
                    R$ {fmt(total)}
                  </span>
                </div>
              </div>

              {/* escrow explainer */}
              <div style={{
                background: 'linear-gradient(180deg, #F7FFFB, #F1FBF6)',
                border: `1px solid rgba(0,196,140,0.3)`,
                borderRadius: 14, padding: 14,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, background: '#fff',
                  border: `1px solid rgba(0,196,140,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" stroke={C.jadeDeep} strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700, color: '#0A2A1E' }}>
                    O valor fica protegido no escrow
                  </div>
                  <div style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, marginTop: 3, lineHeight: 1.4 }}>
                    Reservamos R$ {fmt(total)} e só cobramos quando o turno é concluído. O trabalhador recebe R$ {fmt(workerAmount)} via Pix.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {mutation.isError && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '12px 16px',
            fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', marginTop: 16,
          }}>
            {(mutation.error as any)?.message ?? 'Erro ao publicar vaga'}
          </div>
        )}
      </div>

      {/* sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 240, right: 0,
        padding: '16px 32px 24px',
        background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 30%)',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0,
              cursor: !canSubmit || mutation.isPending ? 'not-allowed' : 'pointer',
              background: C.jade, color: C.jadeInk, borderRadius: 16,
              padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: '"DM Sans", system-ui', fontWeight: 700,
              boxShadow: '0 14px 30px rgba(0,196,140,0.35)',
              opacity: !canSubmit || mutation.isPending ? 0.6 : 1,
              transition: 'all 200ms',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, letterSpacing: -0.3 }}>
                {mutation.isPending ? 'Publicando...' : 'Publicar e reservar'}
              </div>
              {total > 0 && (
                <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
                  R$ {fmt(total)} em escrow
                </div>
              )}
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke={C.jadeInk} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
