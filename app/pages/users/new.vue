<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('users.newUser') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/users">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <UsersUserForm v-model="draft" />
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const saving = ref(false)

const draft = ref({ name: '', email: '', photo: null as string | null })

async function save() {
  if (!draft.value.name || !draft.value.email) {
    toast.add({ title: t('users.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    const created = await $fetch('/api/users', { method: 'POST', body: draft.value })
    toast.add({ title: t('users.saved'), color: 'success' })
    router.push(`/users`)
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || t('users.validationError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
