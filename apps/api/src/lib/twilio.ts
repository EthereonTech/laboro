import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
)

const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!

export async function sendVerification(to: string) {
  await client.verify.v2.services(SERVICE_SID).verifications.create({ to, channel: 'sms' })
}

export async function checkVerification(to: string, code: string): Promise<boolean> {
  const result = await client.verify.v2.services(SERVICE_SID).verificationChecks.create({ to, code })
  return result.status === 'approved'
}
