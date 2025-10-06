<template>
  <div>
    <h2>Olá, como estas?</h2>
    <FormRender :form="form" />
    <pre>{{ form }}</pre>
  </div>
</template>

<script lang="ts" setup>
import FormRender from '@/components/form-builder/FormRender.vue'

const form = ref({
  title: 'Contact Us',
  sections: [
    {
      title: 'Informação Pessoal',
      controls: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          value: ''
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          value: ''
        }
      ]
    },
    {
      title: 'Mensagem',
      controls: [
        {
          name: 'message',
          label: 'Message',
          type: 'textarea',
          value: ''
        },
        {
          name: 'message',
          label: 'Message',
          type: 'select',
          options: [
            {
              label: 'Option 1',
              value: 'option1'
            },
            {
              label: 'Option 2',
              value: 'option2'
            }
          ],
          value: ''
        }
      ]
    }
  ]
})

const toast = useToast();
const loading = ref(false)

function showToast() {
  loading.value = true;
  toast.add({
    title: 'Success',
    description: 'Your action was completed successfully.',
    color: 'success',

  })
}
</script>

<style></style>