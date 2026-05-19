import { Job } from 'bullmq'
import { Specialty } from '@prisma/client'
import { notifyUser } from '../../modules/notifications/notifications.service'
import { findWorkersBySpecialty } from '../../modules/notifications/notifications.repository'
import { notificationsQueue } from '../../jobs'

export async function notificationsProcessor(job: Job): Promise<void> {
  // Notificação genérica de push/WhatsApp para um usuário
  if (job.name === 'notify-user') {
    const { userId, title, body, data } = job.data as {
      userId: string
      title: string
      body: string
      data?: Record<string, unknown>
    }
    await notifyUser(userId, { title, body, data })
    return
  }

  // Nova vaga: notificar todos os trabalhadores com a especialidade
  if (job.name === 'new-shift') {
    const { specialty, shiftId, tradeName, startsAt, ratePerHour } = job.data as {
      specialty: Specialty
      shiftId: string
      tradeName: string
      startsAt: string
      ratePerHour: number
    }

    const workers = await findWorkersBySpecialty(specialty)
    const startDate = new Date(startsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

    for (const worker of workers) {
      await notificationsQueue.add(
        'notify-user',
        {
          userId: worker.user.id,
          title: '🔔 Nova vaga disponível',
          body: `${tradeName} — ${startDate} | R$${ratePerHour}/h`,
          data: { shiftId, type: 'new-shift' },
        },
        { jobId: `notify-new-shift-${shiftId}-${worker.id}` },
      )
    }
    return
  }

  // Turno confirmado — avisar trabalhador e agendar lembrete 2h antes
  if (job.name === 'shift-confirmed') {
    const { workerId, shiftId, startsAt, tradeName } = job.data as {
      workerId: string
      shiftId: string
      startsAt: string
      tradeName: string
    }

    await notifyUser(workerId, {
      title: '✅ Turno confirmado!',
      body: `Você foi confirmado para o turno em ${tradeName}. Prepare-se!`,
      data: { shiftId, type: 'shift-confirmed' },
    })

    // Lembrete 2h antes do início
    const reminderDelay = new Date(startsAt).getTime() - Date.now() - 2 * 60 * 60 * 1000
    if (reminderDelay > 0) {
      await notificationsQueue.add(
        'shift-reminder',
        { workerId, shiftId, tradeName },
        { delay: reminderDelay, jobId: `shift-reminder-${shiftId}-${workerId}` },
      )
    }
    return
  }

  // Lembrete 2h antes do turno
  if (job.name === 'shift-reminder') {
    const { workerId, shiftId, tradeName } = job.data as { workerId: string; shiftId: string; tradeName: string }
    await notifyUser(workerId, {
      title: '⏰ Lembrete de turno',
      body: `Seu turno em ${tradeName} começa em 2 horas. Não esqueça!`,
      data: { shiftId, type: 'shift-reminder' },
    })
    return
  }

  // Check-in confirmado — avisar empresa
  if (job.name === 'checkin-confirmed') {
    const { businessUserId, workerName, shiftId } = job.data as {
      businessUserId: string
      workerName: string
      shiftId: string
    }
    await notifyUser(businessUserId, {
      title: '📍 Trabalhador chegou',
      body: `${workerName} realizou o check-in no turno.`,
      data: { shiftId, type: 'checkin-confirmed' },
    })
    return
  }

  // Pagamento liberado — avisar trabalhador
  if (job.name === 'payment-released') {
    const { workerId, amount } = job.data as { workerId: string; amount: number }
    await notifyUser(workerId, {
      title: '💰 Pagamento liberado!',
      body: `R$ ${amount.toFixed(2)} foi transferido para sua chave Pix.`,
      data: { type: 'payment-released' },
    })
    return
  }

  // Avaliação pendente — avisar ambas as partes
  if (job.name === 'pending-rating') {
    const { shiftId, workerId } = job.data as { shiftId: string; workerId: string }
    await notifyUser(workerId, {
      title: '⭐ Avalie seu turno',
      body: 'Como foi sua experiência? Avalie a empresa e ajude a comunidade Laboro.',
      data: { shiftId, type: 'pending-rating' },
    })
    return
  }
}
