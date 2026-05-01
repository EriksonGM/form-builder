<template>
  <div v-if="form" class="space-y-4 max-w-3xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('forms.fillForm') }}</h1>
      <UButton variant="ghost" icon="i-lucide-arrow-left" :to="`/forms/${form.id}`">{{ t('common.back') }}</UButton>
    </div>

    <UCard>
      <FormRenderer
        :schema="form.schema"
        v-model="data"
        @submit="onSubmit"
        @invalid="onInvalid"
      >
        <template #actions="{ submit }">
          <UButton :loading="submitting" icon="i-lucide-send" @click="submit">
            {{ t('common.submit') }}
          </UButton>
        </template>
      </FormRenderer>
    </UCard>

    <UCard v-if="lastSubmission">
      <template #header>
        <h3 class="font-semibold">{{ t('forms.submitSuccess') }}</h3>
      </template>
      <pre class="text-xs overflow-auto">{{ lastSubmission }}</pre>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm } from '~/types'
import FormRenderer from '~/components/form-builder/FormRenderer.vue'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()

const { data: form } = await useFetch<StoredForm>(`/api/forms/${route.params.id}`)
const data = ref<Record<string, any>>({})
const submitting = ref(false)
const lastSubmission = ref<any>(null)

async function onSubmit(values: Record<string, any>) {
  submitting.value = true
  try {
    const created = await $fetch(`/api/forms/${route.params.id}/submissions`, {
      method: 'POST',
      body: { data: values }
    })
    lastSubmission.value = created
    toast.add({ title: t('forms.submitSuccess'), color: 'success' })
    data.value = {}
  } finally {
    submitting.value = false
  }
}

function onInvalid() {
  toast.add({ title: t('forms.validationError'), color: 'error' })
}
</script>
