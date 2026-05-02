<template>
  <div v-if="form" class="space-y-4 max-w-3xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ t('processes.newProcess') }}</h1>
        <p class="text-sm text-(--ui-text-muted)">{{ form.title }}</p>
      </div>
      <UButton variant="ghost" icon="i-lucide-arrow-left" to="/processes/new">{{ t('common.back') }}</UButton>
    </div>

    <UCard>
      <FormRenderer
        :schema="form.schema"
        v-model="data"
        @submit="onSubmit"
        @invalid="onInvalid"
      >
        <template #actions="{ submit }">
          <UButton :loading="submitting" icon="i-lucide-check" @click="submit">
            {{ t('processes.create') }}
          </UButton>
        </template>
      </FormRenderer>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm, StoredProcess } from '~/types'
import FormRenderer from '~/components/form-builder/FormRenderer.vue'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const formId = Number(route.params.formId)
const { data: form } = await useFetch<StoredForm>(`/api/forms/${formId}`)
const data = ref<Record<string, any>>({})
const submitting = ref(false)

async function onSubmit(values: Record<string, any>) {
  submitting.value = true
  try {
    const created = await $fetch<StoredProcess>('/api/processes', {
      method: 'POST',
      body: { formId, data: values }
    })
    toast.add({ title: t('processes.created'), color: 'success' })
    router.push(`/processes/${created.id}`)
  } finally {
    submitting.value = false
  }
}

function onInvalid() {
  toast.add({ title: t('forms.validationError'), color: 'error' })
}
</script>
