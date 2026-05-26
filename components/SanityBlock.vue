<script>
import { h, defineComponent, computed } from 'vue'

const DECORATOR_TAGS = {
  strong: 'strong',
  em: 'em',
  underline: 'u',
  code: 'code',
}

function isExternalHref(href) {
  if (!href || typeof href !== 'string') return false
  return /^https?:\/\//i.test(href) || href.startsWith('//')
}

function wrapMarks(text, marks, markDefs) {
  if (!marks?.length) return text
  return marks.reduce((inner, markKey) => {
    const decTag = DECORATOR_TAGS[markKey]
    if (decTag) return h(decTag, inner)

    const def = (markDefs || []).find((d) => d._key === markKey)
    if (def?._type === 'link' && def.href) {
      const href = def.href
      const openBlank =
        def.target === '_blank' ||
        (def.target !== '_self' && isExternalHref(href))
      return h(
        'a',
        {
          href,
          class: 'sanity-link',
          target: openBlank ? '_blank' : undefined,
          rel: openBlank ? 'noopener noreferrer' : undefined,
        },
        inner,
      )
    }
    return inner
  }, text)
}

export default defineComponent({
  name: 'SanityBlock',
  props: {
    block: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const tag = computed(() => {
      const style = props.block.style || 'normal'
      const tagMap = {
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        blockquote: 'blockquote',
        normal: 'p',
      }
      return tagMap[style] || 'p'
    })

    return () => {
      const markDefs = props.block.markDefs || []
      const children = (props.block.children || [])
        .filter((c) => c._type === 'span')
        .map((child, index) =>
          wrapMarks(child.text, child.marks, markDefs),
        )

      return h(tag.value, { class: 'sanity-block' }, children)
    }
  },
})
</script>
