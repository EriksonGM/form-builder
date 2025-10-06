<template>

  <div>
    <UHeader title="Demo Store">
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>
    <UMain class="">
      <UContainer class="mx-auto">
        <slot />
      </UContainer>
    </UMain>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui';

const items: NavigationMenuItem[] = [
  {
    label: 'Figma Kit',
    to: 'https://go.nuxt.com/figma-ui',
    target: '_blank'
  },
  {
    label: 'Playground',
    to: 'https://stackblitz.com/edit/nuxt-ui',
    target: '_blank'
  },
  {
    label: 'Releases',
    to: 'https://github.com/nuxt/ui/releases',
    target: '_blank'
  }
]
</script>

<style></style>