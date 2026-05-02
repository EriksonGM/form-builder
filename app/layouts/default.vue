<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:open="sidebarOpen"
      collapsible
      resizable
      :ui="{ header: 'h-16', footer: 'gap-2' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
          <UIcon name="i-lucide-form-input" class="text-(--ui-primary) shrink-0 size-6" />
          <span v-if="!collapsed">{{ t('app.name') }}</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          orientation="vertical"
          :collapsed="collapsed"
          :items="navItems"
        />
      </template>

      <template #footer="{ collapsed }">
        <USelect
          v-if="!collapsed"
          :model-value="locale"
          :items="localeItems"
          size="sm"
          class="w-full"
          @update:model-value="setLocale($event as any)"
        />
        <UTooltip v-else :text="t('nav.language') ?? 'Language'">
          <UButton
            icon="i-lucide-languages"
            color="neutral"
            variant="ghost"
            block
          />
        </UTooltip>
        <UColorModeButton />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="main">
      <UDashboardNavbar :title="t('app.name')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UContainer class="py-6">
        <slot />
      </UContainer>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locale, locales, setLocale } = useI18n()

const sidebarOpen = ref(false)

const navItems = computed<NavigationMenuItem[][]>(() => [[
  { label: t('nav.home'), icon: 'i-lucide-home', to: '/' },
  { label: t('nav.processes'), icon: 'i-lucide-folder-kanban', to: '/processes' },
  { label: t('nav.list'), icon: 'i-lucide-list', to: '/forms' },
  { label: t('nav.create'), icon: 'i-lucide-plus', to: '/forms/new' },
  { label: t('nav.users'), icon: 'i-lucide-user', to: '/users' },
  { label: t('nav.groups'), icon: 'i-lucide-users', to: '/groups' }
]])

const localeItems = computed(() =>
  (locales.value as any[]).map(l => ({ label: l.name, value: l.code }))
)
</script>
