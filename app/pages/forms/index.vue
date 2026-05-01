<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('forms.title') }}</h1>
      <UButton icon="i-lucide-plus" to="/forms/new">{{ t('forms.newForm') }}</UButton>
    </div>

    <UCard>
      <p v-if="!forms?.length" class="text-(--ui-text-muted) text-sm">{{ t('common.noData') }}</p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="f in forms" :key="f.id" class="py-3 flex items-center justify-between">
          <div>
            <NuxtLink :to="`/forms/${f.id}`" class="font-medium hover:text-(--ui-primary)">
              {{ f.title }}
            </NuxtLink>
            <p class="text-xs text-(--ui-text-muted)">
              {{ f.description || '' }}
            </p>
            <p class="text-xs text-(--ui-text-muted)">{{ formatDate(f.updatedAt) }}</p>
          </div>
          <div class="flex gap-2">
            <UButton size="sm" variant="soft" icon="i-lucide-eye" :to="`/forms/${f.id}/fill`">
              {{ t('common.fill') }}
            </UButton>
            <UButton size="sm" variant="soft" icon="i-lucide-pencil" :to="`/forms/${f.id}/edit`">
              {{ t('common.edit') }}
            </UButton>
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" @click="remove(f.id)">
              {{ t('common.delete') }}
            </UButton>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm } from '~/types'

const { t, locale } = useI18n()
const toast = useToast()

const { data: forms, refresh } = await useFetch<StoredForm[]>('/api/forms')

async function remove(id: number) {
  if (!confirm(t('forms.deleteConfirm'))) return
  await $fetch(`/api/forms/${id}`, { method: 'DELETE' })
  toast.add({ title: t('forms.deleted'), color: 'success' })
  await refresh()
}

function formatDate(s: string) {
  return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(locale.value)
}
</script>
