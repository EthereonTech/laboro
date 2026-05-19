import * as Sentry from '@sentry/node'
import { EscrowStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { logger } from '../../lib/logger'

export async function listEscrows(limit: number, status?: string) {
  const where = status ? { status: status as EscrowStatus } : {}
  return prisma.escrowTransaction.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      shift_id: true,
      worker_id: true,
      business_id: true,
      gross_amount: true,
      laboro_fee: true,
      worker_amount: true,
      status: true,
      asaas_payment_id: true,
      reserved_at: true,
      confirmed_at: true,
      released_at: true,
      refunded_at: true,
      created_at: true,
    },
  })
}

export async function listUsers(limit: number, search?: string) {
  const where = search
    ? { OR: [{ full_name: { contains: search } }, { phone: { contains: search } }] }
    : {}
  return prisma.user.findMany({
    where: { deleted_at: null, ...where },
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      phone: true,
      full_name: true,
      type: true,
      is_verified: true,
      created_at: true,
      worker: { select: { id: true, score: true, level: true, total_shifts: true } },
    },
  })
}

export async function suspendUser(userId: string, hours: number) {
  const suspendedUntil = new Date(Date.now() + hours * 3600 * 1000)
  await prisma.worker.updateMany({
    where: { user_id: userId },
    data: { suspended_until: suspendedUntil },
  })
  logger.warn({ event: 'admin.user.suspended', userId, hours, suspendedUntil })
  Sentry.addBreadcrumb({ message: `Admin suspended user ${userId} for ${hours}h`, level: 'warning' })
}

export async function unsuspendUser(userId: string) {
  await prisma.worker.updateMany({
    where: { user_id: userId },
    data: { suspended_until: null },
  })
  logger.info({ event: 'admin.user.unsuspended', userId })
}

export async function getMetrics(from: Date, to: Date) {
  const dateFilter = { gte: from, lte: to }

  const [
    revenueAgg,
    escrowCounts,
    applicationCounts,
    noShowCount,
    workerRatings,
    businessRatings,
    newUsers,
    shiftsCompleted,
  ] = await Promise.all([
    // Receita Laboro: soma das fees em escrows liberados no período
    prisma.escrowTransaction.aggregate({
      where: { status: EscrowStatus.RELEASED, released_at: dateFilter },
      _sum: { laboro_fee: true, gross_amount: true, worker_amount: true },
      _count: true,
    }),

    // Contagem de escrows por status
    prisma.escrowTransaction.groupBy({
      by: ['status'],
      where: { created_at: dateFilter },
      _count: true,
    }),

    // Total de candidaturas no período
    prisma.shiftApplication.count({
      where: { created_at: dateFilter },
    }),

    // No-shows no período
    prisma.shiftApplication.count({
      where: { status: 'NO_SHOW', updated_at: dateFilter },
    }),

    // NPS via ratings de trabalhadores (empresa → trabalhador)
    prisma.rating.aggregate({
      where: {
        created_at: dateFilter,
        to_worker: { isNot: null },
      },
      _avg: { score: true },
      _count: true,
    }),

    // NPS via ratings de empresas (trabalhador → empresa)
    prisma.rating.aggregate({
      where: {
        created_at: dateFilter,
        to_worker: { is: null },
      },
      _avg: { score: true },
      _count: true,
    }),

    // Novos usuários
    prisma.user.count({
      where: { created_at: dateFilter, deleted_at: null },
    }),

    // Turnos concluídos
    prisma.shift.count({
      where: { status: 'DONE', updated_at: dateFilter },
    }),
  ])

  const noShowRate =
    applicationCounts > 0
      ? parseFloat(((noShowCount / applicationCounts) * 100).toFixed(2))
      : 0

  // Score médio como proxy de NPS (1–5 → NPS aproximado: (avg-3)/2*100)
  const workerNps = workerRatings._avg.score
    ? parseFloat((((workerRatings._avg.score - 3) / 2) * 100).toFixed(1))
    : null
  const businessNps = businessRatings._avg.score
    ? parseFloat((((businessRatings._avg.score - 3) / 2) * 100).toFixed(1))
    : null

  return {
    period: { from, to },
    revenue: {
      laboro_fee: revenueAgg._sum.laboro_fee ?? 0,
      gross_volume: revenueAgg._sum.gross_amount ?? 0,
      worker_payouts: revenueAgg._sum.worker_amount ?? 0,
      transactions: revenueAgg._count,
    },
    escrows: Object.fromEntries(escrowCounts.map((e) => [e.status, e._count])),
    shifts: {
      completed: shiftsCompleted,
      applications: applicationCounts,
      no_shows: noShowCount,
      no_show_rate_pct: noShowRate,
    },
    ratings: {
      worker_avg_score: workerRatings._avg.score
        ? parseFloat((workerRatings._avg.score).toFixed(2))
        : null,
      worker_nps: workerNps,
      worker_count: workerRatings._count,
      business_avg_score: businessRatings._avg.score
        ? parseFloat((businessRatings._avg.score).toFixed(2))
        : null,
      business_nps: businessNps,
      business_count: businessRatings._count,
    },
    users: { new_registrations: newUsers },
  }
}
