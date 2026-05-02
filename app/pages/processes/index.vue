<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('processes.title') }}</h1>
      <UButton icon="i-lucide-plus" to="/processes/new">{{ t('processes.newProcess') }}</UButton>
    </div>

    <UCard>
      <p v-if="!processes?.length" class="text-(--ui-text-muted) text-sm">{{ t('common.noData') }}</p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="p in processes" :key="p.id" class="py-3 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <NuxtLink :to="`/processes/${p.id}`" class="font-mono font-medium hover:text-(--ui-primary)">
                {{ p.code }}
              </NuxtLink>
              <UBadge :color="statusColor(p.status)" variant="soft" size="sm">
                {{ t(`processes.status_${p.status}`) }}
              </UBadge>
            </div>
            <p class="text-sm truncate">{{ p.formTitle || '—' }}</p>
            <p class="text-xs text-(--ui-text-muted)">{{ formatDate(p.createdAt) }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton size="sm" variant="soft" icon="i-lucide-eye" :to="`/processes/${p.id}`">
              {{ t('common.preview') }}
            </UButton>
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" @click="remove(p.id)">
              {{ t('common.delete') }}
            </UButton>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredProcess } from '~/types'

const { t, locale } = useI18n()
const toast = useToast()

type Row = StoredProcess & { formTitle?: string }
const { data: processes, refresh } = await useFetch<Row[]>('/api/processes')

async function remove(id: number) {
  if (!confirm(t('processes.deleteConfirm'))) return
  await $fetch(`/api/processes/${id}`, { method: 'DELETE' })
  toast.add({ title: t('processes.deleted'), color: 'success' })
  await refresh()
}

function statusColor(s: string) {
  if (s === 'finalized') return 'success'
  if (s === 'cancelled') return 'error'
  return 'info'
}

function formatDate(s: string) {
  return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(locale.value)
}
</script>
