import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env')
  }

  return createClient(url, key)
}

export async function uploadPhoto(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Falha no upload: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
