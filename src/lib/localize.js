import i18n from '@/i18n'

export function localized(obj, field) {
  if (!obj) return ''
  const enField = `${field}_en`
  if (i18n.language === 'en' && obj[enField]) return obj[enField]
  return obj[field] ?? ''
}
