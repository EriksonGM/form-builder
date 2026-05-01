<template>
  <div v-if="form" class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ form.title }}</h1>
        <p v-if="form.description" class="text-(--ui-text-muted)">{{ form.description }}</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="ghost" icon="i-lucide-arrow-left" to="/forms">{{ t('common.back') }}</UButton>
        <UButton variant="soft" icon="i-lucide-pencil" :to="`/forms/${form.id}/edit`">{{ t('common.edit') }}</UButton>
        <UButton icon="i-lucide-eye" :to="`/forms/${form.id}/fill`">{{ t('common.fill') }}</UButton>
      </div>
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold">{{ t('common.preview') }}</h3>
      </template>
      <FormRenderer :schema="form.schema" />
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Schema</h3>
      </template>
      <pre class="text-xs overflow-auto">{{ form.schema }}</pre>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm } from '~/types'
import FormRenderer from '~/components/form-builder/FormRenderer.vue'

const { t } = useI18n()
const route = useRoute()
const { data: form } = await useFetch<StoredForm>(`/api/forms/${route.params.id}`)
</script>
