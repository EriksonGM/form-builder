<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('groups.title') }}</h1>
      <UButton icon="i-lucide-plus" to="/groups/new">{{ t('groups.newGroup') }}</UButton>
    </div>

    <UCard>
      <p v-if="!groups?.length" class="text-(--ui-text-muted) text-sm">{{ t('common.noData') }}</p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="g in groups" :key="g.id" class="py-3 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium truncate">{{ g.name }}</p>
            <p v-if="g.description" class="text-xs text-(--ui-text-muted) truncate">{{ g.description }}</p>
            <p class="text-xs text-(--ui-text-muted)">{{ g.userIds.length }} {{ t('groups.members').toLowerCase() }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton size="sm" variant="soft" icon="i-lucide-pencil" :to="`/groups/${g.id}/edit`">
              {{ t('common.edit') }}
            </UButton>
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" @click="remove(g.id)">
              {{ t('common.delete') }}
            </UButton>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredGroup } from '~/types'

const { t } = useI18n()
const toast = useToast()

const { data: groups, refresh } = await useFetch<StoredGroup[]>('/api/groups')

async function remove(id: number) {
  if (!confirm(t('groups.deleteConfirm'))) return
  await $fetch(`/api/groups/${id}`, { method: 'DELETE' })
  toast.add({ title: t('groups.deleted'), color: 'success' })
  await refresh()
}
</script>
