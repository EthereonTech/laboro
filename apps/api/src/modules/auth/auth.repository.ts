import { UserType } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: email.toLowerCase(), deleted_at: null },
    include: { worker: true, business: true },
  })
}

export async function isEmailTaken(email: string) {
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase(), deleted_at: null } })
  return !!user
}

export async function createUserWithProfile(data: {
  email: string
  password_hash: string
  full_name: string
  phone?: string
  type: UserType
}) {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      full_name: data.full_name,
      phone: data.phone,
      type: data.type,
      worker: data.type === UserType.worker ? { create: {} } : undefined,
    },
    include: { worker: true, business: true },
  })
}
