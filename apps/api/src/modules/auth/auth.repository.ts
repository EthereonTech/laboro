import { UserType } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function findUserByPhone(phone: string) {
  return prisma.user.findFirst({
    where: { phone, deleted_at: null },
    include: { worker: true, business: true },
  })
}

export async function createUserWithProfile(phone: string, type: UserType) {
  return prisma.user.create({
    data: {
      phone,
      type,
      full_name: '',
      worker: type === UserType.worker ? { create: {} } : undefined,
    },
    include: { worker: true, business: true },
  })
}
