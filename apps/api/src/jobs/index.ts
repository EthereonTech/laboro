import { Queue } from 'bullmq'
import { redis } from '../lib/redis.js'

const connection = { connection: redis }

export const notificationsQueue = new Queue('notifications-queue', connection)
export const escrowQueue = new Queue('escrow-queue', connection)
export const scoreQueue = new Queue('score-queue', connection)
export const shiftQueue = new Queue('shift-queue', connection)
export const cleanupQueue = new Queue('cleanup-queue', connection)
