<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <UAvatar
          :src="modelValue.photo || undefined"
          :alt="modelValue.name || 'user'"
          size="3xl"
          icon="i-lucide-user"
        />
        <div class="space-y-2">
          <UButton
            size="sm"
            variant="soft"
            icon="i-lucide-upload"
            @click="fileInput?.click()"
          >
            {{ t('users.uploadPhoto') }}
          </UButton>
          <UButton
            v-if="modelValue.photo"
            size="sm"
            variant="ghost"
            color="error"
            icon="i-lucide-x"
            @click="clearPhoto"
          >
            {{ t('common.remove') }}
          </UButton>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFile"
          />
          <p class="text-xs text-(--ui-text-muted)">{{ t('users.photoHint') }}</p>
        </div>
      </div>

      <UFormField :label="t('common.name')" required>
        <UInput
          :model-value="modelValue.name"
          class="w-full"
          @update:model-value="update('name', String($event))"
        />
      </UFormField>

      <UFormField :label="t('users.email')" required>
        <UInput
          :model-value="modelValue.email"
          type="email"
          class="w-full"
          @update:model-value="update('email', String($event))"
        />
      </UFormField>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
interface UserDraft {
  name: string
  email: string
  photo: string | null
}

const props = defineProps<{ modelValue: UserDraft }>()
const emit = defineEmits<{ 'update:modelValue': [value: UserDraft] }>()

const { t } = useI18n()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

function update<K extends keyof UserDraft>(key: K, value: UserDraft[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function clearPhoto() {
  update('photo', null)
  if (fileInput.value) fileInput.value.value = ''
}

function onFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: t('users.photoTooLarge'), color: 'error' })
    target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => update('photo', String(reader.result))
  reader.readAsDataURL(file)
}
</script>
