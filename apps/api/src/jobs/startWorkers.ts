import { Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { shiftProcessor } from './processors/shift.processor'
import { escrowProcessor } from './processors/escrow.processor'
import { scoreProcessor } from './processors/score.processor'
import { notificationsProcessor } from './processors/notifications.processor'

const connection = { connection: redis }

export function startWorkers(): void {
  new Worker('shift-queue', shiftProcessor, connection)
  new Worker('escrow-queue', escrowProcessor, {
    ...connection,
    // Retry: 3 attempts with exponential backoff (10min, 30min, 2h)
    settings: {
      backoffStrategy: (attemptsMade: number) => {
        const delays = [10 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000]
        return delays[Math.min(attemptsMade - 1, delays.length - 1)]
      },
    },
  })
  new Worker('score-queue', scoreProcessor, connection)
  new Worker('notifications-queue', notificationsProcessor, connection)

  console.info('[jobs] BullMQ workers started')
}
