<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('users.title') }}</h1>
      <UButton icon="i-lucide-plus" to="/users/new">{{ t('users.newUser') }}</UButton>
    </div>

    <UCard>
      <p v-if="!users?.length" class="text-(--ui-text-muted) text-sm">{{ t('common.noData') }}</p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="u in users" :key="u.id" class="py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <UAvatar
              :src="u.photo || undefined"
              :alt="u.name"
              size="md"
              icon="i-lucide-user"
            />
            <div class="min-w-0">
              <p class="font-medium truncate">{{ u.name }}</p>
              <p class="text-xs text-(--ui-text-muted) truncate">{{ u.email }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton size="sm" variant="soft" icon="i-lucide-pencil" :to="`/users/${u.id}/edit`">
              {{ t('common.edit') }}
            </UButton>
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" @click="remove(u.id)">
              {{ t('common.delete') }}
            </UButton>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { StoredUser } from '~/types'

const { t } = useI18n()
const toast = useToast()

const { data: users, refresh } = await useFetch<StoredUser[]>('/api/users')

async function remove(id: number) {
  if (!confirm(t('users.deleteConfirm'))) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  toast.add({ title: t('users.deleted'), color: 'success' })
  await refresh()
}
</script>
