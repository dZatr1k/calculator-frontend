<script setup lang="ts">
import Requirement from "@/components/Calculator/Requirement.vue";
import {useCalculatorStore} from "@/store/app";

const store = useCalculatorStore()
</script>

<template>
  <v-card>
    <v-card-title>Условия</v-card-title>

    <v-list>
      <requirement
        :text="store.selectedCategory.requirements.minCombo + ' Элементов в комбо'"
        :value="false"
      />
      <requirement
        :text="store.selectedCategory.requirements.minElementsOfSameLevel + ' Элементов этого уровня'"
        :value="false"
      />
      <requirement
        :text="(gender === 'female' ? store.selectedCategory.requirements.minFemaleScore : store.selectedCategory.requirements.minMaleScore) + ' Баллов'"
        :value="false"
      />
    </v-list>
  </v-card>
</template>

<style scoped>

</style>
