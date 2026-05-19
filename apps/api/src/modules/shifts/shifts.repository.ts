import { Specialty, ShiftStatus, ApplicationStatus, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { ShiftAddress } from './shifts.types'

const shiftWithBusiness = {
  business: {
    select: {
      id: true,
      trade_name: true,
      address: true,
      user: { select: { full_name: true } },
    },
  },
  applications: {
    where: { status: { in: [ApplicationStatus.CONFIRMED] } },
    select: { id: true },
  },
} satisfies Prisma.ShiftInclude

const shiftDetailInclude = {
  business: {
    select: {
      id: true,
      trade_name: true,
      address: true,
      user: { select: { full_name: true } },
    },
  },
  applications: {
    where: { status: { notIn: [ApplicationStatus.CANCELLED] } },
    select: {
      id: true,
      status: true,
      worker: {
        select: {
          id: true,
          score: true,
          level: true,
          total_shifts: true,
          user: { select: { full_name: true, photo_url: true } },
        },
      },
    },
    orderBy: { created_at: 'asc' as const },
  },
} satisfies Prisma.ShiftInclude

export async function findShiftById(id: string) {
  return prisma.shift.findFirst({
    where: { id, deleted_at: null },
    include: shiftWithBusiness,
  })
}

export async function findShiftByIdWithDetail(id: string) {
  return prisma.shift.findFirst({
    where: { id, deleted_at: null },
    include: shiftDetailInclude,
  })
}

export async function findShiftsByBusiness(businessId: string) {
  return prisma.shift.findMany({
    where: { business_id: businessId, deleted_at: null },
    include: shiftWithBusiness,
    orderBy: { starts_at: 'asc' },
  })
}

export async function findOpenShifts(filters: { specialty?: Specialty; date?: Date }) {
  const where: Prisma.ShiftWhereInput = {
    status: ShiftStatus.OPEN,
    deleted_at: null,
    starts_at: { gt: new Date() },
  }
  if (filters.specialty) where.specialty = filters.specialty
  if (filters.date) {
    const start = new Date(filters.date)
    const end = new Date(filters.date)
    end.setDate(end.getDate() + 1)
    where.starts_at = { gte: start, lt: end }
  }

  return prisma.shift.findMany({
    where,
    include: shiftWithBusiness,
    orderBy: [{ is_urgent: 'desc' }, { starts_at: 'asc' }],
  })
}

export async function createShift(
  businessId: string,
  data: {
    specialty: Specialty
    starts_at: Date
    ends_at: Date
    slots: number
    rate_per_hour: number
    total_value: number
    laboro_fee: number
    instructions?: string
    address?: ShiftAddress
    is_urgent: boolean
  },
) {
  return prisma.shift.create({
    data: {
      business_id: businessId,
      ...data,
      address: data.address ? (data.address as object) : Prisma.JsonNull,
    },
    include: shiftWithBusiness,
  })
}

export async function updateShift(
  id: string,
  data: { instructions?: string; is_urgent?: boolean },
) {
  return prisma.shift.update({
    where: { id },
    data,
    include: shiftWithBusiness,
  })
}

export async function updateShiftStatus(id: string, status: ShiftStatus) {
  return prisma.shift.update({ where: { id }, data: { status } })
}

export async function softDeleteShift(id: string) {
  return prisma.shift.update({ where: { id }, data: { deleted_at: new Date(), status: ShiftStatus.CANCELLED } })
}

export async function findApplication(shiftId: string, workerId: string) {
  return prisma.shiftApplication.findUnique({
    where: { shift_id_worker_id: { shift_id: shiftId, worker_id: workerId } },
  })
}

export async function findApplicationsByShift(shiftId: string) {
  return prisma.shiftApplication.findMany({
    where: { shift_id: shiftId },
    include: {
      worker: {
        include: {
          user: { select: { full_name: true } },
          specialties: { select: { specialty: true } },
        },
      },
    },
    orderBy: { created_at: 'asc' },
  })
}

export async function createApplication(shiftId: string, workerId: string) {
  return prisma.shiftApplication.create({
    data: { shift_id: shiftId, worker_id: workerId },
  })
}

export async function updateApplicationStatus(
  shiftId: string,
  workerId: string,
  status: ApplicationStatus,
) {
  return prisma.shiftApplication.update({
    where: { shift_id_worker_id: { shift_id: shiftId, worker_id: workerId } },
    data: { status },
  })
}

export async function countConfirmedApplications(shiftId: string) {
  return prisma.shiftApplication.count({
    where: { shift_id: shiftId, status: ApplicationStatus.CONFIRMED },
  })
}
