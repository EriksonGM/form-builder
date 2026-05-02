<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('groups.editGroup') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/groups">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <GroupsGroupForm v-if="draft" v-model="draft" />
  </div>
</template>

<script lang="ts" setup>
import type { StoredGroup } from '~/types'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const saving = ref(false)

const id = Number(route.params.id)
const { data: group } = await useFetch<StoredGroup>(`/api/groups/${id}`)

const draft = ref(group.value
  ? { name: group.value.name, description: group.value.description ?? '', userIds: [...group.value.userIds] }
  : null)

async function save() {
  if (!draft.value || !draft.value.name) {
    toast.add({ title: t('groups.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/groups/${id}`, { method: 'PUT', body: draft.value })
    toast.add({ title: t('groups.saved'), color: 'success' })
    router.push('/groups')
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || t('groups.validationError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
