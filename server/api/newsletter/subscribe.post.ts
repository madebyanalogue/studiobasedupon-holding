const MAILCHIMP_USER_ID = '08cc39fe384e9191c5023a533'
const MAILCHIMP_LIST_ID = '44500b04e4'
const MAILCHIMP_FORM_ID = '00eba6e0f0'
const MAILCHIMP_DC = 'us7'
const MAILCHIMP_HONEYPOT = `b_${MAILCHIMP_USER_ID}_${MAILCHIMP_LIST_ID}`

type MailchimpResponse = {
  result?: string
  msg?: string
}

function parseMailchimpResponse(raw: unknown): MailchimpResponse {
  if (raw && typeof raw === 'object' && 'result' in raw) {
    return raw as MailchimpResponse
  }

  if (typeof raw !== 'string') {
    return {}
  }

  const trimmed = raw.trim()
  if (!trimmed.startsWith('{')) {
    return {}
  }

  try {
    return JSON.parse(trimmed) as MailchimpResponse
  } catch {
    return {}
  }
}

export default defineEventHandler(async (event) => {
  let body: { name?: string; email?: string }
  try {
    body = (await readBody(event)) || {}
  } catch {
    body = {}
  }

  const email = body.email?.trim()
  const name = body.name?.trim() || ''

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required',
    })
  }

  const params = new URLSearchParams({
    c: '?',
    u: MAILCHIMP_USER_ID,
    id: MAILCHIMP_LIST_ID,
    f_id: MAILCHIMP_FORM_ID,
    EMAIL: email,
    FNAME: name,
    'gdpr[37]': 'Y',
    [MAILCHIMP_HONEYPOT]: '',
  })

  const url = `https://${MAILCHIMP_DC}.list-manage.com/subscribe/post-json?${params.toString()}`

  try {
    const raw = await $fetch<unknown>(url)
    const response = parseMailchimpResponse(raw)

    if (response.result !== 'success') {
      throw createError({
        statusCode: 400,
        message: response.msg || 'Subscription failed',
      })
    }

    return { success: true, message: response.msg }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Unable to subscribe right now. Please try again.',
    })
  }
})
