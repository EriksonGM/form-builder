<template>
  <div class="space-y-4">
    <UCard>
      <div class="space-y-3">
        <UFormField :label="t('common.name')" required>
          <UInput
            :model-value="modelValue.name"
            class="w-full"
            @update:model-value="update('name', String($event))"
          />
        </UFormField>
        <UFormField :label="t('common.description')">
          <UInput
            :model-value="modelValue.description"
            class="w-full"
            @update:model-value="update('description', String($event))"
          />
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">{{ t('groups.members') }}</h3>
          <UButton size="sm" variant="soft" icon="i-lucide-user-plus" @click="openPicker">
            {{ t('steps.addUsers') }}
          </UButton>
        </div>
      </template>

      <p v-if="!modelValue.userIds.length" class="text-sm text-(--ui-text-muted)">
        {{ t('groups.noMembers') }}
      </p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li
          v-for="uid in modelValue.userIds"
          :key="uid"
          class="py-2 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2 min-w-0">
            <UAvatar
              :src="findUser(uid)?.photo || undefined"
              :alt="findUser(uid)?.name || ''"
              size="xs"
              icon="i-lucide-user"
            />
            <div class="min-w-0">
              <p class="text-sm truncate">{{ findUser(uid)?.name ?? `#${uid}` }}</p>
              <p class="text-xs text-(--ui-text-muted) truncate">{{ findUser(uid)?.email ?? '' }}</p>
            </div>
          </div>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-x"
            @click="removeUser(uid)"
          />
        </li>
      </ul>
    </UCard>

    <UModal v-model:open="pickerOpen" :title="t('steps.addUsers')">
      <template #body>
        <div class="space-y-3">
          <UInput
            v-model="pickerSearch"
            icon="i-lucide-search"
            :placeholder="t('common.search')"
            class="w-full"
          />
          <p v-if="!available.length" class="text-sm text-(--ui-text-muted)">
            {{ t('steps.noUsersAvailable') }}
          </p>
          <ul v-else class="max-h-80 overflow-y-auto divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
            <li
              v-for="u in available"
              :key="u.id"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-(--ui-bg-elevated)"
              @click="togglePick(u.id)"
            >
              <UCheckbox :model-value="pickerSelected.includes(u.id)" @click.stop @update:model-value="togglePick(u.id)" />
              <UAvatar :src="u.photo || undefined" :alt="u.name" size="xs" icon="i-lucide-user" />
              <div class="min-w-0">
                <p class="text-sm truncate">{{ u.name }}</p>
                <p class="text-xs text-(--ui-text-muted) truncate">{{ u.email }}</p>
              </div>
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" @click="closePicker">{{ t('common.cancel') }}</UButton>
          <UButton icon="i-lucide-check" :disabled="!pickerSelected.length" @click="confirmPicker">
            {{ t('common.save') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { StoredUser } from '~/types'

interface GroupDraft {
  name: string
  description: string
  userIds: number[]
}

const props = defineProps<{ modelValue: GroupDraft }>()
const emit = defineEmits<{ 'update:modelValue': [v: GroupDraft] }>()
const { t } = useI18n()

const { data: users } = await useFetch<StoredUser[]>('/api/users')

function findUser(id: number) {
  return users.value?.find(u => u.id === id)
}

function update<K extends keyof GroupDraft>(key: K, value: GroupDraft[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function removeUser(id: number) {
  update('userIds', props.modelValue.userIds.filter(x => x !== id))
}

const pickerOpen = ref(false)
const pickerSelected = ref<number[]>([])
const pickerSearch = ref('')

const available = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return (users.value ?? [])
    .filter(u => !props.modelValue.userIds.includes(u.id))
    .filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

function openPicker() {
  pickerSelected.value = []
  pickerSearch.value = ''
  pickerOpen.value = true
}
function togglePick(id: number) {
  const arr = pickerSelected.value
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
}
function closePicker() {
  pickerOpen.value = false
  pickerSelected.value = []
  pickerSearch.value = ''
}
function confirmPicker() {
  update('userIds', [...props.modelValue.userIds, ...pickerSelected.value])
  closePicker()
}
</script>
