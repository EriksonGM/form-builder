<template>
  <div class="space-y-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('processes.newProcess') }}</h1>
      <UButton variant="ghost" to="/processes">{{ t('common.cancel') }}</UButton>
    </div>

    <UCard>
      <p class="text-sm mb-4">{{ t('processes.pickType') }}</p>
      <p v-if="!types?.length" class="text-(--ui-text-muted) text-sm">{{ t('processes.noTypes') }}</p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="f in types" :key="f.id" class="py-3 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium truncate">{{ f.title }}</p>
            <p class="text-xs text-(--ui-text-muted) truncate">{{ f.description || '' }}</p>
          </div>
          <UButton size="sm" icon="i-lucide-arrow-right" :to="`/processes/new/${f.id}`">
            {{ t('common.add') }}
          </UButton>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm } from '~/types'

const { t } = useI18n()
const { data: types } = await useFetch<StoredForm[]>('/api/forms')
</script>
