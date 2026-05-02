<template>
  <div v-if="proc" class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono">{{ proc.code }}</h1>
        <p class="text-sm text-(--ui-text-muted)">{{ proc.formTitle || '—' }}</p>
      </div>
      <UButton variant="ghost" icon="i-lucide-arrow-left" to="/processes">{{ t('common.back') }}</UButton>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <UCard>
        <p class="text-xs text-(--ui-text-muted)">{{ t('processes.code') }}</p>
        <p class="font-mono">{{ proc.code }}</p>
      </UCard>
      <UCard>
        <p class="text-xs text-(--ui-text-muted)">{{ t('processes.type') }}</p>
        <p>{{ proc.formTitle || '—' }}</p>
      </UCard>
      <UCard>
        <p class="text-xs text-(--ui-text-muted)">{{ t('processes.status') }}</p>
        <UBadge :color="statusColor" variant="soft">{{ t(`processes.status_${proc.status}`) }}</UBadge>
      </UCard>
      <UCard>
        <p class="text-xs text-(--ui-text-muted)">{{ t('processes.createdAt') }}</p>
        <p>{{ formatDate(proc.createdAt) }}</p>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">{{ t('processes.workflow') }}</h3>
          <UButton
            v-if="proc.status === 'in_progress'"
            size="sm"
            color="error"
            variant="soft"
            icon="i-lucide-x"
            @click="cancel"
          >
            {{ t('processes.cancelProcess') }}
          </UButton>
        </div>
      </template>

      <p v-if="!proc.steps.length" class="text-sm text-(--ui-text-muted)">
        {{ t('processes.noStepsConfigured') }}
      </p>

      <ol v-else class="space-y-3">
        <li
          v-for="(s, i) in proc.steps"
          :key="s.id"
          class="border border-(--ui-border) rounded-(--ui-radius) p-3"
          :class="s.id === proc.currentStepId ? 'border-(--ui-primary) bg-(--ui-bg-elevated)' : ''"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <UIcon
                :name="stepIcon(s, i)"
                :class="stepIconClass(s, i)"
              />
              <span class="font-medium">{{ i + 1 }}. {{ s.name }}</span>
              <UBadge variant="outline" size="sm">{{ t(`steps.mode_${s.mode}`) }}</UBadge>
            </div>
            <span v-if="s.id === proc.currentStepId" class="text-xs text-(--ui-primary)">
              {{ t('processes.currentStep') }}
            </span>
          </div>

          <ul class="space-y-1">
            <li
              v-for="uid in s.userIds"
              :key="uid"
              class="flex items-center justify-between gap-2 text-sm"
            >
              <div class="flex items-center gap-2 min-w-0">
                <UAvatar
                  :src="userPhoto(uid) || undefined"
                  :alt="userName(uid)"
                  size="xs"
                  icon="i-lucide-user"
                />
                <span class="truncate">{{ userName(uid) }}</span>
                <UIcon
                  v-if="hasApproved(s.id, uid)"
                  name="i-lucide-check-circle-2"
                  class="text-(--ui-success)"
                />
              </div>
              <UButton
                v-if="canApprove(s, uid)"
                size="xs"
                icon="i-lucide-check"
                @click="approve(uid)"
              >
                {{ t('processes.approve') }}
              </UButton>
            </li>
          </ul>
        </li>
      </ol>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">{{ t('processes.renderedDocs') }}</h3>
      </template>
      <p v-if="!proc.documents.length" class="text-sm text-(--ui-text-muted)">
        {{ t('processes.noRenderedDocs') }}
      </p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="(d, i) in proc.documents" :key="i" class="py-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UIcon name="i-lucide-file-text" />
            <span class="truncate">{{ d.name }}</span>
            <span class="text-xs text-(--ui-text-muted) shrink-0">{{ formatSize(d.size) }}</span>
          </div>
          <UButton size="sm" variant="soft" icon="i-lucide-download" :href="d.dataUrl" :download="d.name" />
        </li>
      </ul>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">{{ t('processes.attachedFiles') }}</h3>
      </template>
      <p v-if="!attached.length" class="text-sm text-(--ui-text-muted)">
        {{ t('processes.noAttachedFiles') }}
      </p>
      <ul v-else class="divide-y divide-(--ui-border)">
        <li v-for="(d, i) in attached" :key="i" class="py-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UIcon name="i-lucide-paperclip" />
            <div class="min-w-0">
              <p class="truncate">{{ d.name }}</p>
              <p class="text-xs text-(--ui-text-muted) truncate">{{ d.fieldPath }}</p>
            </div>
            <span class="text-xs text-(--ui-text-muted) shrink-0">{{ formatSize(d.size) }}</span>
          </div>
          <UButton size="sm" variant="soft" icon="i-lucide-download" :href="d.dataUrl" :download="d.name" />
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema, FormStep, StoredProcess, StoredUser } from '~/types'
import { collectAttachedFiles } from '~/composables/useProcessFiles'

const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

type Detail = StoredProcess & { formTitle?: string, formSchema?: FormSchema | null }
const { data: proc, refresh } = await useFetch<Detail>(`/api/processes/${route.params.id}`)
const { data: users } = await useFetch<StoredUser[]>('/api/users')

const attached = computed(() =>
  proc.value ? collectAttachedFiles(proc.value.formSchema ?? null, proc.value.data) : []
)

const statusColor = computed(() => {
  switch (proc.value?.status) {
    case 'finalized': return 'success'
    case 'cancelled': return 'error'
    default: return 'info'
  }
})

function userName(id: number) {
  return users.value?.find(u => u.id === id)?.name ?? `#${id}`
}
function userPhoto(id: number) {
  return users.value?.find(u => u.id === id)?.photo ?? null
}
function hasApproved(stepId: string, userId: number) {
  return !!proc.value?.approvals.find(a => a.stepId === stepId && a.userId === userId)
}
function canApprove(step: FormStep, userId: number) {
  return proc.value?.status === 'in_progress'
    && step.id === proc.value.currentStepId
    && !hasApproved(step.id, userId)
}
function stepIcon(step: FormStep, i: number) {
  if (!proc.value) return 'i-lucide-circle'
  const idx = proc.value.steps.findIndex(s => s.id === proc.value!.currentStepId)
  if (proc.value.status === 'finalized') return 'i-lucide-check-circle-2'
  if (proc.value.status === 'cancelled') return 'i-lucide-x-circle'
  if (idx < 0) return 'i-lucide-circle'
  if (i < idx) return 'i-lucide-check-circle-2'
  if (i === idx) return 'i-lucide-loader'
  return 'i-lucide-circle'
}
function stepIconClass(step: FormStep, i: number) {
  if (!proc.value) return ''
  if (proc.value.status === 'cancelled') return 'text-(--ui-error)'
  const idx = proc.value.steps.findIndex(s => s.id === proc.value!.currentStepId)
  if (proc.value.status === 'finalized' || (idx >= 0 && i < idx)) return 'text-(--ui-success)'
  if (i === idx) return 'text-(--ui-primary)'
  return 'text-(--ui-text-muted)'
}

async function approve(userId: number) {
  try {
    await $fetch(`/api/processes/${route.params.id}/approve`, {
      method: 'POST',
      body: { userId }
    })
    await refresh()
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || 'Error', color: 'error' })
  }
}

async function cancel() {
  if (!confirm(t('processes.cancelConfirm'))) return
  try {
    await $fetch(`/api/processes/${route.params.id}/cancel`, { method: 'POST' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: e?.statusMessage || 'Error', color: 'error' })
  }
}

function formatDate(s: string) {
  return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(locale.value)
}
function formatSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
</script>
