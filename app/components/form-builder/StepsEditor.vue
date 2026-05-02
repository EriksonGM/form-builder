<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ t('forms.sections.steps') }}</h3>
      <UButton icon="i-lucide-plus" @click="addStep">{{ t('steps.addStep') }}</UButton>
    </div>

    <p v-if="!steps.length" class="text-(--ui-text-muted) text-sm">{{ t('steps.noSteps') }}</p>

    <UCard v-for="(s, i) in steps" :key="s.id">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm text-(--ui-text-muted)">#{{ i + 1 }}</span>
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" icon="i-lucide-arrow-up" :disabled="i === 0" @click="move(i, -1)" />
            <UButton size="xs" variant="ghost" icon="i-lucide-arrow-down" :disabled="i === steps.length - 1" @click="move(i, 1)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove(i)" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormField :label="t('steps.name')" required>
            <UInput
              :model-value="s.name"
              class="w-full"
              @update:model-value="update(i, { name: String($event) })"
            />
          </UFormField>
          <UFormField :label="t('steps.mode')" required>
            <USelect
              :model-value="s.mode"
              :items="modeItems"
              class="w-full"
              @update:model-value="update(i, { mode: $event as StepMode })"
            />
          </UFormField>
        </div>

        <UFormField
          :label="t('steps.users')"
          :error="effectiveCount(s) === 0 ? t('steps.atLeastOneUserOrGroup') : undefined"
        >
          <div class="space-y-2">
            <ul v-if="s.userIds.length" class="divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
              <li
                v-for="uid in s.userIds"
                :key="uid"
                class="flex items-center justify-between gap-2 px-3 py-2"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <UAvatar
                    :src="userPhoto(uid) || undefined"
                    :alt="userName(uid)"
                    size="xs"
                    icon="i-lucide-user"
                  />
                  <div class="min-w-0">
                    <p class="text-sm truncate">{{ userName(uid) }}</p>
                    <p class="text-xs text-(--ui-text-muted) truncate">{{ userEmail(uid) }}</p>
                  </div>
                </div>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-x" @click="removeUser(i, uid)" />
              </li>
            </ul>
            <UButton size="sm" variant="soft" icon="i-lucide-user-plus" @click="openUserPicker(i)">
              {{ t('steps.addUsers') }}
            </UButton>
          </div>
        </UFormField>

        <UFormField :label="t('steps.groups')">
          <div class="space-y-2">
            <ul v-if="(s.groupIds ?? []).length" class="divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
              <li
                v-for="gid in s.groupIds"
                :key="gid"
                class="flex items-center justify-between gap-2 px-3 py-2"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <UIcon name="i-lucide-users" />
                  <div class="min-w-0">
                    <p class="text-sm truncate">{{ groupName(gid) }}</p>
                    <p class="text-xs text-(--ui-text-muted)">{{ groupMembers(gid) }} {{ t('groups.members').toLowerCase() }}</p>
                  </div>
                </div>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-x" @click="removeGroup(i, gid)" />
              </li>
            </ul>
            <UButton size="sm" variant="soft" icon="i-lucide-users" @click="openGroupPicker(i)">
              {{ t('steps.addGroups') }}
            </UButton>
          </div>
        </UFormField>
      </div>
    </UCard>

    <UModal v-model:open="userPickerOpen" :title="t('steps.addUsers')">
      <template #body>
        <div class="space-y-3">
          <UInput v-model="userSearch" icon="i-lucide-search" :placeholder="t('common.search')" class="w-full" />
          <p v-if="!availableUsers.length" class="text-sm text-(--ui-text-muted)">{{ t('steps.noUsersAvailable') }}</p>
          <ul v-else class="max-h-80 overflow-y-auto divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
            <li
              v-for="u in availableUsers"
              :key="u.id"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-(--ui-bg-elevated)"
              @click="toggleUserPick(u.id)"
            >
              <UCheckbox :model-value="userSelected.includes(u.id)" @click.stop @update:model-value="toggleUserPick(u.id)" />
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
          <UButton variant="ghost" @click="closeUserPicker">{{ t('common.cancel') }}</UButton>
          <UButton icon="i-lucide-check" :disabled="!userSelected.length" @click="confirmUserPicker">
            {{ t('common.save') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="groupPickerOpen" :title="t('steps.addGroups')">
      <template #body>
        <div class="space-y-3">
          <UInput v-model="groupSearch" icon="i-lucide-search" :placeholder="t('common.search')" class="w-full" />
          <p v-if="!availableGroups.length" class="text-sm text-(--ui-text-muted)">{{ t('steps.noGroupsAvailable') }}</p>
          <ul v-else class="max-h-80 overflow-y-auto divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
            <li
              v-for="g in availableGroups"
              :key="g.id"
              class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-(--ui-bg-elevated)"
              @click="toggleGroupPick(g.id)"
            >
              <UCheckbox :model-value="groupSelected.includes(g.id)" @click.stop @update:model-value="toggleGroupPick(g.id)" />
              <UIcon name="i-lucide-users" />
              <div class="min-w-0">
                <p class="text-sm truncate">{{ g.name }}</p>
                <p class="text-xs text-(--ui-text-muted) truncate">
                  {{ g.userIds.length }} {{ t('groups.members').toLowerCase() }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" @click="closeGroupPicker">{{ t('common.cancel') }}</UButton>
          <UButton icon="i-lucide-check" :disabled="!groupSelected.length" @click="confirmGroupPicker">
            {{ t('common.save') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema, FormStep, StepMode, StoredGroup, StoredUser } from '~/types'

const props = defineProps<{ modelValue: FormSchema }>()
const emit = defineEmits<{ 'update:modelValue': [v: FormSchema] }>()
const { t } = useI18n()

const { data: users } = await useFetch<StoredUser[]>('/api/users')
const { data: groups } = await useFetch<StoredGroup[]>('/api/groups')

const steps = computed<FormStep[]>(() => props.modelValue.steps ?? [])

const modeItems = computed(() => [
  { label: t('steps.modeAll'), value: 'all' },
  { label: t('steps.modeAny'), value: 'any' }
])

function findUser(id: number) { return users.value?.find(u => u.id === id) }
function userName(id: number) { return findUser(id)?.name ?? `#${id}` }
function userEmail(id: number) { return findUser(id)?.email ?? '' }
function userPhoto(id: number) { return findUser(id)?.photo ?? null }
function findGroup(id: number) { return groups.value?.find(g => g.id === id) }
function groupName(id: number) { return findGroup(id)?.name ?? `#${id}` }
function groupMembers(id: number) { return findGroup(id)?.userIds.length ?? 0 }
function effectiveCount(s: FormStep) {
  return (s.userIds?.length ?? 0) + ((s.groupIds ?? []).length)
}

function setSteps(next: FormStep[]) {
  emit('update:modelValue', { ...props.modelValue, steps: next })
}

function addStep() {
  const id = `step_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  setSteps([...steps.value, { id, name: '', mode: 'all', userIds: [], groupIds: [] }])
}

function update(i: number, patch: Partial<FormStep>) {
  const next = steps.value.slice()
  next[i] = { ...next[i]!, ...patch }
  setSteps(next)
}

function remove(i: number) {
  const next = steps.value.slice()
  next.splice(i, 1)
  setSteps(next)
}

function move(i: number, delta: number) {
  const next = steps.value.slice()
  const j = i + delta
  if (j < 0 || j >= next.length) return
  const [item] = next.splice(i, 1)
  next.splice(j, 0, item!)
  setSteps(next)
}

function removeUser(stepIdx: number, userId: number) {
  const step = steps.value[stepIdx]!
  update(stepIdx, { userIds: step.userIds.filter(id => id !== userId) })
}

function removeGroup(stepIdx: number, groupId: number) {
  const step = steps.value[stepIdx]!
  update(stepIdx, { groupIds: (step.groupIds ?? []).filter(id => id !== groupId) })
}

// User picker
const userPickerOpen = ref(false)
const userPickerStepIdx = ref<number | null>(null)
const userSelected = ref<number[]>([])
const userSearch = ref('')

const availableUsers = computed(() => {
  if (userPickerStepIdx.value == null) return []
  const already = steps.value[userPickerStepIdx.value]?.userIds ?? []
  const q = userSearch.value.trim().toLowerCase()
  return (users.value ?? [])
    .filter(u => !already.includes(u.id))
    .filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

function openUserPicker(stepIdx: number) {
  userPickerStepIdx.value = stepIdx
  userSelected.value = []
  userSearch.value = ''
  userPickerOpen.value = true
}
function toggleUserPick(id: number) {
  const arr = userSelected.value
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
}
function closeUserPicker() {
  userPickerOpen.value = false
  userPickerStepIdx.value = null
  userSelected.value = []
  userSearch.value = ''
}
function confirmUserPicker() {
  if (userPickerStepIdx.value == null) return closeUserPicker()
  const step = steps.value[userPickerStepIdx.value]!
  update(userPickerStepIdx.value, { userIds: [...step.userIds, ...userSelected.value] })
  closeUserPicker()
}

// Group picker
const groupPickerOpen = ref(false)
const groupPickerStepIdx = ref<number | null>(null)
const groupSelected = ref<number[]>([])
const groupSearch = ref('')

const availableGroups = computed(() => {
  if (groupPickerStepIdx.value == null) return []
  const already = steps.value[groupPickerStepIdx.value]?.groupIds ?? []
  const q = groupSearch.value.trim().toLowerCase()
  return (groups.value ?? [])
    .filter(g => !already.includes(g.id))
    .filter(g => !q || g.name.toLowerCase().includes(q))
})

function openGroupPicker(stepIdx: number) {
  groupPickerStepIdx.value = stepIdx
  groupSelected.value = []
  groupSearch.value = ''
  groupPickerOpen.value = true
}
function toggleGroupPick(id: number) {
  const arr = groupSelected.value
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
}
function closeGroupPicker() {
  groupPickerOpen.value = false
  groupPickerStepIdx.value = null
  groupSelected.value = []
  groupSearch.value = ''
}
function confirmGroupPicker() {
  if (groupPickerStepIdx.value == null) return closeGroupPicker()
  const step = steps.value[groupPickerStepIdx.value]!
  update(groupPickerStepIdx.value, { groupIds: [...(step.groupIds ?? []), ...groupSelected.value] })
  closeGroupPicker()
}
</script>
