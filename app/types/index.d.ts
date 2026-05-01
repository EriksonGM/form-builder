export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'object'
  | 'array'
  | 'file'

export interface StoredFile {
  name: string
  type: string
  size: number
  dataUrl: string
}

export interface FieldOption {
  label: string
  value: string
}

export interface FormField {
  id: string
  name: string
  displayName: string
  type: FieldType
  required?: boolean
  // text / textarea length / array length / file count
  min?: number
  max?: number
  // regex pattern for text/textarea, or to validate file names/extensions
  pattern?: string
  // for select / radio / checkbox
  options?: FieldOption[]
  // for object / array(of objects)
  fields?: FormField[]
  // default value
  defaultValue?: any
}

export interface FormSchema {
  title: string
  description?: string
  fields: FormField[]
}

export interface StoredForm {
  id: number
  title: string
  description?: string
  schema: FormSchema
  createdAt: string
  updatedAt: string
}

export interface StoredSubmission {
  id: number
  formId: number
  data: Record<string, any>
  createdAt: string
}
