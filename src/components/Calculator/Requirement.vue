<script setup lang="ts">
const props = defineProps<{
  text: string,
  value: boolean
}>()
</script>

<template>
  <v-list-item>
    <v-list-item-title>{{ props.text }}</v-list-item-title>
    <template v-slot:append>
      <v-icon
        :color="props.value ? 'green' : 'red'"
      >{{ props.value ? 'mdi-check' : 'mdi-close' }}</v-icon>
    </template>
  </v-list-item>
</template>

<style scoped>

</style>
