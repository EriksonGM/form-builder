<template>
  <div>
    <UHeader :title="t('app.name')">
      <template #title>
        <NuxtLink to="/" class="font-bold text-lg flex items-center gap-2">
          <UIcon name="i-lucide-form-input" class="text-(--ui-primary)" />
          {{ t('app.name') }}
        </NuxtLink>
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #right>
        <USelect
          :model-value="locale"
          :items="localeItems"
          size="sm"
          @update:model-value="setLocale($event as any)"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </UMain>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locale, locales, setLocale } = useI18n()

const items = computed<NavigationMenuItem[]>(() => [
  { label: t('nav.home'), icon: 'i-lucide-home', to: '/' },
  { label: t('nav.list'), icon: 'i-lucide-list', to: '/forms' },
  { label: t('nav.create'), icon: 'i-lucide-plus', to: '/forms/new' }
])

const localeItems = computed(() =>
  (locales.value as any[]).map(l => ({ label: l.name, value: l.code }))
)
</script>
