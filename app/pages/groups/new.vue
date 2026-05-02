<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('groups.newGroup') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/groups">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <GroupsGroupForm v-model="draft" />
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const saving = ref(false)

const draft = ref({ name: '', description: '', userIds: [] as number[] })

async function save() {
  if (!draft.value.name) {
    toast.add({ title: t('groups.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await $fetch('/api/groups', { method: 'POST', body: draft.value })
    toast.add({ title: t('groups.saved'), color: 'success' })
    router.push('/groups')
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || t('groups.validationError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
