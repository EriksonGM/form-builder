<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('users.editUser') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/users">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <UsersUserForm v-if="draft" v-model="draft" />
  </div>
</template>

<script lang="ts" setup>
import type { StoredUser } from '~/types'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const saving = ref(false)

const id = Number(route.params.id)
const { data: user } = await useFetch<StoredUser>(`/api/users/${id}`)

const draft = ref(user.value
  ? { name: user.value.name, email: user.value.email, photo: user.value.photo }
  : null)

async function save() {
  if (!draft.value || !draft.value.name || !draft.value.email) {
    toast.add({ title: t('users.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/users/${id}`, { method: 'PUT', body: draft.value })
    toast.add({ title: t('users.saved'), color: 'success' })
    router.push('/users')
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || t('users.validationError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
