import { createHash } from 'node:crypto'

const MAILCHIMP_USER_ID = '08cc39fe384e9191c5023a533'
const MAILCHIMP_LIST_ID = '44500b04e4'
const MAILCHIMP_FORM_ID = '00eba6e0f0'
const MAILCHIMP_FORM_VERSION_ID = '3128'
const MAILCHIMP_TAG_ID = '3531655'
const MAILCHIMP_GDPR_FIELD_ID = '37'
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

function subscriberHash(email: string) {
  return createHash('md5').update(email.toLowerCase()).digest('hex')
}

function buildSubscribeParams(email: string, firstName: string, lastName: string) {
  const params = new URLSearchParams({
    c: '?',
    u: MAILCHIMP_USER_ID,
    id: MAILCHIMP_LIST_ID,
    f_id: MAILCHIMP_FORM_ID,
    v_id: MAILCHIMP_FORM_VERSION_ID,
    EMAIL: email,
    [`gdpr[${MAILCHIMP_GDPR_FIELD_ID}]`]: 'Y',
    [MAILCHIMP_HONEYPOT]: '',
  })

  // Audience "First Name" / "Last Name" columns use MMERGE2 / MMERGE1 on this list.
  if (firstName) {
    params.set('MMERGE2', firstName)
    params.set('FNAME', firstName)
  }

  if (lastName) {
    params.set('MMERGE1', lastName)
    params.set('LNAME', lastName)
  }

  // Included for parity with the embed form; tags are applied via Marketing API below.
  params.set('tags', MAILCHIMP_TAG_ID)

  return params
}

function mailchimpHeaders(apiKey: string) {
  return { Authorization: `apikey ${apiKey}` }
}

async function resolveTagName(apiKey: string, tagId: string, fallbackName?: string) {
  if (fallbackName?.trim()) {
    return fallbackName.trim()
  }

  try {
    const result = await $fetch<{ tags?: Array<{ id?: number; name?: string }> } }>(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/tag-search`,
      {
        headers: mailchimpHeaders(apiKey),
        query: { count: 1000 },
      },
    )

    const match = result.tags?.find((tag) => String(tag.id) === tagId)
    if (match?.name?.trim()) {
      return match.name.trim()
    }
  } catch {
    // Fall through to segment lookup.
  }

  try {
    const segment = await $fetch<{ name?: string }>(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/segments/${tagId}`,
      {
        headers: mailchimpHeaders(apiKey),
      },
    )

    return segment?.name?.trim() || null
  } catch {
    return null
  }
}

async function applyTagViaMarketingApi(
  email: string,
  apiKey: string,
  tagId: string,
  tagName?: string,
) {
  const name = await resolveTagName(apiKey, tagId, tagName)
  if (!name) {
    return
  }

  const hash = subscriberHash(email)

  await $fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${hash}/tags`,
    {
      method: 'POST',
      headers: mailchimpHeaders(apiKey),
      body: {
        tags: [{ name, status: 'active' }],
      },
    },
  )
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  let body: {
    firstName?: string
    lastName?: string
    email?: string
  }
  try {
    body = (await readBody(event)) || {}
  } catch {
    body = {}
  }

  const email = body.email?.trim()
  const firstName = body.firstName?.trim() || ''
  const lastName = body.lastName?.trim() || ''

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required',
    })
  }

  const params = buildSubscribeParams(email, firstName, lastName)
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

    let tagApplied = false
    const apiKey = config.mailchimpApiKey

    if (apiKey) {
      try {
        await applyTagViaMarketingApi(
          email,
          apiKey,
          config.mailchimpTagId || MAILCHIMP_TAG_ID,
          config.mailchimpTagName,
        )
        tagApplied = true
      } catch {
        // Subscription succeeded; tag sync is best-effort.
      }
    }

    const message = response.msg || 'Thank you for subscribing.'
    const needsConfirmation = /confirm|confirmation|check your email|almost finished/i.test(message)

    return {
      success: true,
      message,
      needsConfirmation,
      tagApplied,
    }
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
