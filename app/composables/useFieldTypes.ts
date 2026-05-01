import type { FieldType } from '~/types'

export function useFieldTypes() {
  const { t } = useI18n()
  const types = computed<{ label: string, value: FieldType }[]>(() => ([
    { label: t('fieldTypes.text'), value: 'text' },
    { label: t('fieldTypes.textarea'), value: 'textarea' },
    { label: t('fieldTypes.number'), value: 'number' },
    { label: t('fieldTypes.date'), value: 'date' },
    { label: t('fieldTypes.select'), value: 'select' },
    { label: t('fieldTypes.radio'), value: 'radio' },
    { label: t('fieldTypes.checkbox'), value: 'checkbox' },
    { label: t('fieldTypes.boolean'), value: 'boolean' },
    { label: t('fieldTypes.object'), value: 'object' },
    { label: t('fieldTypes.array'), value: 'array' }
  ]))
  return { types }
}

export function newField(): import('~/types').FormField {
  return {
    id: crypto.randomUUID(),
    name: '',
    displayName: '',
    type: 'text',
    required: false
  }
}

export function fieldHasOptions(type: FieldType) {
  return type === 'select' || type === 'radio' || type === 'checkbox'
}

export function fieldHasChildren(type: FieldType) {
  return type === 'object' || type === 'array'
}

export function fieldHasMinMax(type: FieldType) {
  return type === 'number' || type === 'text' || type === 'textarea' || type === 'array'
}

export function fieldHasPattern(type: FieldType) {
  return type === 'text' || type === 'textarea'
}
