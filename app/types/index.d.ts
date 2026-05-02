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

export type StepMode = 'all' | 'any'

export interface FormStep {
  id: string
  name: string
  mode: StepMode
  userIds: number[]
  groupIds?: number[]
}

export interface FormSchema {
  title: string
  description?: string
  fields: FormField[]
  templates?: StoredFile[]
  steps?: FormStep[]
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

export type ProcessStatus = 'in_progress' | 'finalized' | 'cancelled'

export interface ProcessApproval {
  stepId: string
  userId: number
  at: string
}

export interface StoredProcess {
  id: number
  code: string
  formId: number
  data: Record<string, any>
  documents: StoredFile[]
  status: ProcessStatus
  currentStepId: string | null
  steps: FormStep[]
  approvals: ProcessApproval[]
  createdAt: string
}

export interface StoredGroup {
  id: number
  name: string
  description: string | null
  userIds: number[]
  createdAt: string
  updatedAt: string
}

export interface StoredUser {
  id: number
  name: string
  email: string
  photo: string | null
  createdAt: string
  updatedAt: string
}
