<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">{{ t('home.title') }}</h1>
      <p class="text-(--ui-text-muted)">{{ t('app.tagline') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-file-text" class="text-3xl text-(--ui-primary)" />
          <div>
            <div class="text-2xl font-bold">{{ stats?.totalForms ?? 0 }}</div>
            <div class="text-sm text-(--ui-text-muted)">{{ t('home.totalForms') }}</div>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-inbox" class="text-3xl text-(--ui-primary)" />
          <div>
            <div class="text-2xl font-bold">{{ stats?.totalSubmissions ?? 0 }}</div>
            <div class="text-sm text-(--ui-text-muted)">{{ t('home.totalSubmissions') }}</div>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-list-tree" class="text-3xl text-(--ui-primary)" />
          <div>
            <div class="text-2xl font-bold">{{ stats?.totalFields ?? 0 }}</div>
            <div class="text-sm text-(--ui-text-muted)">{{ t('home.totalFields') }}</div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="font-semibold">{{ t('home.recent') }}</h2>
            <UButton icon="i-lucide-plus" size="sm" to="/forms/new">
              {{ t('home.createNew') }}
            </UButton>
          </div>
        </template>
        <p v-if="!recent?.length" class="text-(--ui-text-muted) text-sm">{{ t('common.noData') }}</p>
        <ul v-else class="divide-y divide-(--ui-border)">
          <li v-for="f in recent" :key="f.id" class="py-3 flex items-center justify-between">
            <div>
              <NuxtLink :to="`/forms/${f.id}`" class="font-medium hover:text-(--ui-primary)">
                {{ f.title }}
              </NuxtLink>
              <p class="text-xs text-(--ui-text-muted)">{{ formatDate(f.updatedAt) }}</p>
            </div>
            <div class="flex gap-2">
              <UButton size="xs" variant="soft" icon="i-lucide-eye" :to="`/forms/${f.id}/fill`" />
              <UButton size="xs" variant="soft" icon="i-lucide-pencil" :to="`/forms/${f.id}/edit`" />
            </div>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ t('home.systemInfo') }}</h2>
        </template>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-(--ui-text-muted)">{{ t('home.version') }}</dt>
            <dd>1.0.0</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-(--ui-text-muted)">{{ t('home.language') }}</dt>
            <dd>{{ locale }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-(--ui-text-muted)">{{ t('home.theme') }}</dt>
            <dd>{{ colorMode.preference }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-(--ui-text-muted)">{{ t('home.storage') }}</dt>
            <dd>{{ t('home.sqlite') }}</dd>
          </div>
        </dl>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { StoredForm } from '~/types'

const { t, locale } = useI18n()
const colorMode = useColorMode()

const { data: stats } = await useFetch('/api/stats')
const { data: forms } = await useFetch<StoredForm[]>('/api/forms')

const recent = computed(() => (forms.value ?? []).slice(0, 5))

function formatDate(s: string) {
  return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(locale.value)
}
</script>
