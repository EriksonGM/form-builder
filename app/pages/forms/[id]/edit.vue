<template>
  <div v-if="schema" class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('forms.editForm') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" :to="`/forms/${route.params.id}`">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <SchemaEditor v-model="schema" />

    <UCard>
      <template #header>
        <h3 class="font-semibold">{{ t('common.preview') }}</h3>
      </template>
      <FormRenderer :schema="schema" />
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema, StoredForm } from '~/types'
import SchemaEditor from '~/components/form-builder/SchemaEditor.vue'
import FormRenderer from '~/components/form-builder/FormRenderer.vue'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const saving = ref(false)

const { data: form } = await useFetch<StoredForm>(`/api/forms/${route.params.id}`)
const schema = ref<FormSchema | null>(form.value?.schema ?? null)

async function save() {
  if (!schema.value?.title) {
    toast.add({ title: t('forms.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/forms/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: schema.value.title,
        description: schema.value.description,
        schema: schema.value
      }
    })
    toast.add({ title: t('forms.saved'), color: 'success' })
    router.push(`/forms/${route.params.id}`)
  } finally {
    saving.value = false
  }
}
</script>
