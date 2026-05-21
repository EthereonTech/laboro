'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { specialtyLabel, formatCurrency } from '@/lib/format'

const C = {
  navy: '#0E2A78', navyLight: '#1B3FA0',
  jade: '#00C48C', jadeDeep: '#00A372', jadeInk: '#0A2A1E',
  orange: '#FF6B35',
  text: '#1A1A2E', textMute: '#5C6079', textSoft: '#8A8FA6',
  line: '#E6E8F0', lineSoft: '#EFF1F7', surface2: '#F8F9FC', surface3: '#F1F3F9',
}

const SPECIALTIES = [
  'garcom', 'bartender', 'aux_cozinha', 'promotor',
  'caixa', 'repositor', 'cuidador', 'aux_logistica',
]

const inputStyle: React.CSSProperties = {
  width: '100%', appearance: 'none', outline: 0,
  border: `1.5px solid ${C.line}`, borderRadius: 10,
  padding: '11px 13px',
  fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 500, color: C.text,
  background: '#fff', transition: 'border-color 120ms', boxSizing: 'border-box',
}

function Field({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700,
        color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
      {sub && (
        <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 16, fontWeight: 700,
      color: C.text, letterSpacing: -0.3, margin: '28px 0 14px',
    }}>
      {children}
    </h2>
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
      {/* Header */}
      <div style={{
        background: '#fff', padding: '24px 40px 20px',
        borderBottom: `1px solid ${C.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            width: 34, height: 34, borderRadius: 9, background: C.surface3,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={C.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 11.5, fontWeight: 700, color: C.textSoft, letterSpacing: 0.6, textTransform: 'uppercase', margin: 0 }}>
            Nova vaga
          </p>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5, margin: '2px 0 0' }}>
            Postar turno
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '8px 40px 120px' }}>

        {/* ── O Turno ── */}
        <SectionTitle>O turno</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Função">
            <select
              value={form.specialty}
              onChange={e => set('specialty', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            >
              {SPECIALTIES.map(s => <option key={s} value={s}>{specialtyLabel(s)}</option>)}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Início">
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={e => set('starts_at', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
            <Field label="Término">
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => set('ends_at', e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.navy)}
                onBlur={e => (e.target.style.borderColor = C.line)}
              />
            </Field>
          </div>

          {hours > 0 && (
            <div style={{
              background: '#E6FAF3', borderRadius: 9, padding: '8px 13px',
              fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: '#00805B',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#00805B" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Duração: {hours.toFixed(1)} horas
            </div>
          )}
        </div>

        {/* ── Detalhes ── */}
        <SectionTitle>Detalhes</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Slots stepper */}
          <div style={{
            background: '#fff', borderRadius: 12, padding: '13px 16px',
            border: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, fontWeight: 700, color: C.textSoft, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 2px' }}>
                Número de vagas
              </p>
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute, margin: 0 }}>
                Quantos trabalhadores você precisa
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => set('slots', Math.max(1, form.slots - 1))}
                style={{
                  appearance: 'none', cursor: 'pointer',
                  width: 32, height: 32, borderRadius: 8,
                  border: `1.5px solid ${C.line}`, background: '#fff',
                  fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700,
                  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 120ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.navy }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.line }}
              >–</button>
              <span style={{
                minWidth: 36, textAlign: 'center',
                fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 18, fontWeight: 800, color: C.text,
              }}>
                {form.slots}
              </span>
              <button
                onClick={() => set('slots', Math.min(20, form.slots + 1))}
                style={{
                  appearance: 'none', cursor: 'pointer',
                  width: 32, height: 32, borderRadius: 8,
                  border: `1.5px solid ${C.line}`, background: '#fff',
                  fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 17, fontWeight: 700,
                  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 120ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.navy }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.line }}
              >+</button>
            </div>
          </div>

          {/* Instructions */}
          <Field label="Instruções para o trabalhador">
            <textarea
              value={form.instructions}
              onChange={e => set('instructions', e.target.value)}
              placeholder="Ex.: Camisa preta lisa, sapato fechado, RG com foto. Apresentar-se 15 min antes."
              rows={3}
              maxLength={500}
              style={{
                ...inputStyle,
                resize: 'none', lineHeight: 1.5,
                padding: '11px 13px',
              }}
              onFocus={e => (e.target.style.borderColor = C.navy)}
              onBlur={e => (e.target.style.borderColor = C.line)}
            />
          </Field>

          {/* Urgent toggle */}
          <label style={{
            background: '#fff', borderRadius: 12, padding: '13px 16px',
            border: `1.5px solid ${form.is_urgent ? C.orange : C.line}`,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            transition: 'border-color 120ms',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 14, fontWeight: 600, color: form.is_urgent ? C.orange : C.text, margin: '0 0 1px', transition: 'color 120ms' }}>
                Marcar como urgente
              </p>
              <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12.5, color: C.textMute, margin: 0 }}>
                Aparece em destaque para os trabalhadores
              </p>
            </div>
            {/* Custom toggle */}
            <div style={{
              width: 42, height: 24, borderRadius: 12, flexShrink: 0,
              background: form.is_urgent ? C.orange : C.surface3,
              position: 'relative', transition: 'background 160ms',
            }}>
              <div style={{
                position: 'absolute', top: 3, borderRadius: '50%',
                width: 18, height: 18, background: '#fff',
                left: form.is_urgent ? 21 : 3,
                transition: 'left 160ms',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
              <input
                type="checkbox"
                checked={form.is_urgent}
                onChange={e => set('is_urgent', e.target.checked)}
                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', margin: 0 }}
              />
            </div>
          </label>
        </div>

        {/* ── Pagamento ── */}
        <SectionTitle>Pagamento</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Valor por hora (R$)">
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
          </Field>

          {total > 0 && (
            <>
              {/* Breakdown */}
              <div style={{
                background: '#fff', borderRadius: 12, padding: '14px 16px',
                border: `1px solid ${C.line}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>
                    {hours.toFixed(1)}h × {form.slots} vaga{form.slots > 1 ? 's' : ''} × R${form.rate_per_hour}/h
                  </span>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.textMute }}>R$ {fmt(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, color: C.textMute }}>Comissão Laboro · 18%</span>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 600, color: C.textMute }}>R$ {fmt(fee)}</span>
                </div>
                <div style={{ height: 1, background: C.lineSoft, margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13.5, fontWeight: 700, color: C.text }}>Total em escrow</span>
                  <span style={{ fontFamily: '"Bricolage Grotesque", system-ui', fontSize: 20, fontWeight: 800, color: C.jadeDeep, letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums' }}>
                    R$ {fmt(total)}
                  </span>
                </div>
              </div>

              {/* Escrow note */}
              <div style={{
                background: '#F4FDF9',
                border: `1px solid rgba(0,163,114,0.20)`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" stroke={C.jadeDeep} strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 13, fontWeight: 700, color: '#0A2A1E', margin: '0 0 2px' }}>
                    Valor protegido via escrow
                  </p>
                  <p style={{ fontFamily: '"DM Sans", system-ui', fontSize: 12, color: C.textMute, margin: 0, lineHeight: 1.5 }}>
                    Reservamos R$ {fmt(total)} e só cobramos quando o turno é concluído. O trabalhador recebe R$ {fmt(workerAmount)} via Pix.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {mutation.isError && (() => {
          const err = mutation.error as any
          const details: { field: string; message: string }[] = err?.details ?? []
          return (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '11px 14px',
              fontFamily: '"DM Sans", system-ui', fontSize: 13, color: '#991B1B', marginTop: 16,
            }}>
              <div style={{ fontWeight: 600, marginBottom: details.length ? 6 : 0 }}>
                {err?.message ?? 'Erro ao publicar vaga'}
              </div>
              {details.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {details.map((d, i) => (
                    <li key={i} style={{ marginTop: 2 }}>{d.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })()}
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 240, right: 0,
        padding: '12px 40px 24px',
        background: 'linear-gradient(180deg, rgba(248,249,252,0) 0%, #F8F9FC 28%)',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            style={{
              width: '100%', appearance: 'none', border: 0,
              cursor: !canSubmit || mutation.isPending ? 'not-allowed' : 'pointer',
              background: canSubmit ? C.jade : C.surface3,
              color: canSubmit ? C.jadeInk : C.textSoft,
              borderRadius: 14, padding: '15px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: '"DM Sans", system-ui', fontWeight: 700,
              boxShadow: canSubmit ? '0 8px 24px rgba(0,196,140,0.30)' : 'none',
              transition: 'all 200ms',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, letterSpacing: -0.2 }}>
                {mutation.isPending ? 'Publicando...' : 'Publicar e reservar'}
              </div>
              {total > 0 && canSubmit && (
                <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
                  R$ {fmt(total)} em escrow
                </div>
              )}
            </div>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
