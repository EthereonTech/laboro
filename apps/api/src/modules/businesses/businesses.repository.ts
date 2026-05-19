import { BusinessSegment } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { BusinessAddress } from './businesses.types'

export async function findBusinessByUserId(userId: string) {
  return prisma.business.findFirst({
    where: { user_id: userId, deleted_at: null },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
    },
  })
}

export async function findBusinessById(businessId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, deleted_at: null },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
    },
  })
}

export async function isCnpjTaken(cnpj: string, excludeUserId?: string) {
  const business = await prisma.business.findFirst({ where: { cnpj, deleted_at: null } })
  if (!business) return false
  if (excludeUserId && business.user_id === excludeUserId) return false
  return true
}

export async function createBusiness(
  userId: string,
  data: {
    cnpj: string
    trade_name: string
    legal_name: string
    segment: BusinessSegment
    address: BusinessAddress
  },
) {
  return prisma.business.create({
    data: { ...data, user_id: userId, address: data.address as object },
    include: {
      user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
    },
  })
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  data: {
    full_name?: string
    trade_name?: string
    legal_name?: string
    segment?: BusinessSegment
    address?: BusinessAddress
  },
) {
  const { full_name, address, ...businessData } = data

  return prisma.$transaction(async (tx) => {
    if (full_name !== undefined) {
      await tx.user.update({ where: { id: userId }, data: { full_name } })
    }
    return tx.business.update({
      where: { id: businessId },
      data: { ...businessData, ...(address ? { address: address as object } : {}) },
      include: {
        user: { select: { id: true, full_name: true, phone: true, photo_url: true, is_verified: true } },
      },
    })
  })
}

export async function updateBusinessPhotoUrl(userId: string, photoUrl: string) {
  return prisma.user.update({ where: { id: userId }, data: { photo_url: photoUrl } })
}
