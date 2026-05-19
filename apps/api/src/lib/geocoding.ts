export async function geocodeAddress(address: {
  street: string
  number: string
  neighborhood?: string
  city: string
  state: string
  zip?: string
}): Promise<{ lat: number; lng: number } | null> {
  const query = [address.street, address.number, address.neighborhood, address.city, address.state, 'Brasil']
    .filter(Boolean)
    .join(', ')

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'Laboro/1.0 (contato@ethereontech.com.br)' } },
    )
    if (!res.ok) return null

    const data = await res.json() as { lat: string; lon: string }[]
    if (!data.length) return null

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
