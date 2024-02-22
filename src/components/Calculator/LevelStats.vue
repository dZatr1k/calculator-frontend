<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";

const store = useCalculatorStore()
</script>

<template>
<v-card>
  <v-card-title>Допустимые уровни</v-card-title>
  <v-list>
    <v-list-item v-for="i in [...Array(4).keys()]">
      {{i + store.selectedCategory!.level - 1}}
    </v-list-item>
  </v-list>
</v-card>
</template>

<style scoped>

</style>
