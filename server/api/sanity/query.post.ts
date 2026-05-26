export default defineEventHandler(async (event) => {
  let body: Record<string, unknown>
  try {
    body = (await readBody(event)) || {}
  } catch {
    body = {}
  }
  const { query, params = {}, useCdn = true, perspective } = body as { query?: string; params?: Record<string, unknown>; useCdn?: boolean; perspective?: string }

  if (!query || typeof query !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Query is required and must be a string'
    })
  }

  const config = useRuntimeConfig()
  const projectId = config.public.sanity?.projectId || 'uuzbe0e0'
  const dataset = config.public.sanity?.dataset || 'production'
  const apiVersion = config.public.sanity?.apiVersion || '2024-03-19'
  // Perspectives require non-CDN endpoint
  const effectiveUseCdn = perspective ? false : useCdn
  let baseUrl = effectiveUseCdn
    ? `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
    : `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`
  if (perspective) {
    baseUrl += `?perspective=${encodeURIComponent(perspective)}`
  }

  try {
    const result = await $fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        params,
      }),
      timeout: 30000,
    })
    
    return result
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to query Sanity'
    })
  }
})

