<template>
  <div class="mailchimp-signup">
    <div id="mc_embed_signup">
      <form
        :action="action"
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        class="validate"
        target="_blank"
        novalidate
      >
        <div id="mc_embed_signup_scroll">
          <h2 v-if="title">{{ title }}</h2>

          <div v-if="showRequiredNote" class="indicates-required">
            <span class="asterisk">*</span> indicates required
          </div>

          <div class="mc-field-group">
            <label for="mce-EMAIL">
              Email Address <span class="asterisk">*</span>
            </label>
            <input
              id="mce-EMAIL"
              type="email"
              name="EMAIL"
              class="required email"
              required
              autocomplete="email"
            >
          </div>

          <div
            id="mergeRow-gdpr"
            class="mergeRow gdpr-mergeRow content__gdprBlock mc-field-group"
          >
            <div class="content__gdpr">
              <label>Marketing Permissions</label>
              <p>
                {{ brandName }} will use the information you provide on this form to be in touch
                with you and to provide updates and marketing. Please let us know all the ways
                you would like to hear from us:
              </p>
              <fieldset class="mc_fieldset gdprRequired mc-field-group" name="interestgroup_field">
                <label class="checkbox subfield" for="gdpr_37">
                  <input
                    id="gdpr_37"
                    type="checkbox"
                    name="gdpr[37]"
                    class="gdpr"
                    value="Y"
                  >
                  <span>Email</span>
                </label>
              </fieldset>
              <p>
                You can change your mind at any time by clicking the unsubscribe link in the footer
                of any email you receive from us, or by contacting us at
                <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>.
                We will treat your information with respect. Our privacy policy here:
                <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer">
                  {{ privacyPolicyUrl }}
                </a>
              </p>
            </div>
            <div class="content__gdprLegal">
              <p>
                We use Mailchimp as our marketing platform. By clicking below to subscribe, you
                acknowledge that your information will be transferred to Mailchimp for processing.
                <a href="https://mailchimp.com/legal/terms" target="_blank" rel="noopener noreferrer">
                  Learn more
                </a>
                about Mailchimp's privacy practices.
              </p>
            </div>
          </div>

          <div id="mce-responses" class="clear">
            <div class="response" id="mce-error-response" style="display: none;" />
            <div class="response" id="mce-success-response" style="display: none;" />
          </div>

          <div aria-hidden="true" style="position: absolute; left: -5000px;">
            <input
              type="text"
              name="b_08cc39fe384e9191c5023a533_44500b04e4"
              tabindex="-1"
              value=""
            >
          </div>

          <div class="clear">
            <input
              type="submit"
              name="subscribe"
              id="mc-embedded-subscribe"
              class="button"
              :value="submitLabel"
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Subscribe',
  },
  submitLabel: {
    type: String,
    default: 'Subscribe',
  },
  showRequiredNote: {
    type: Boolean,
    default: true,
  },
  action: {
    type: String,
    default:
      'https://basedupon.us7.list-manage.com/subscribe/post?u=08cc39fe384e9191c5023a533&id=44500b04e4&f_id=00eba6e0f0',
  },
  brandName: {
    type: String,
    default: 'Studio Based Upon',
  },
  contactEmail: {
    type: String,
    default: 'ianandrichard@basedupon.com',
  },
  privacyPolicyUrl: {
    type: String,
    default: 'https://www.basedupon.com/privacy-policy/',
  },
})

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn-images.mailchimp.com/embedcode/classic-061523.css',
    },
  ],
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}

function initMailchimpValidation() {
  window.fnames = []
  window.ftypes = []
  window.fnames[0] = 'EMAIL'
  window.ftypes[0] = 'email'
}

onMounted(async () => {
  if (!process.client) return

  try {
    if (!window.jQuery) {
      await loadScript('https://code.jquery.com/jquery-3.7.1.min.js')
    }

    initMailchimpValidation()
    await loadScript('https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js')
  } catch (error) {
    console.warn('Mailchimp validation scripts failed to load', error)
  }
})
</script>

<style scoped>
.mailchimp-signup :deep(#mc_embed_signup) {
  background: transparent;
  clear: left;
  font: inherit;
  width: 100%;
  max-width: 600px;
}

.mailchimp-signup :deep(#mc-embedded-subscribe-form input[type='checkbox']) {
  display: inline;
  width: auto;
  margin-right: 10px;
}

.mailchimp-signup :deep(#mergeRow-gdpr) {
  margin-top: 20px;
}

.mailchimp-signup :deep(#mergeRow-gdpr fieldset label) {
  font-weight: normal;
}

.mailchimp-signup :deep(#mc-embedded-subscribe-form .mc_fieldset) {
  border: none;
  min-height: 0;
  padding-bottom: 0;
}

.mailchimp-signup :deep(.content__gdpr a) {
  text-decoration: underline;
}
</style>
