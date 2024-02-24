<script setup lang="ts">
import Requirement from "@/components/Calculator/Requirement.vue";
import {useCalculatorStore} from "@/store/app";
import {computed} from "vue";

const store = useCalculatorStore()

const isMinCombosReached = computed(() =>{
  return store.combos.some(x => x.length >= store.selectedCategory!.requirements.minCombo)
})

const isMinElementsOftheSameLevelReached = computed(() =>{
  let count = 0
  store.combos.forEach(x => {
    x.forEach(y => {
      let element = store.content?.elements.find(z => z.id == y)
      if(element!.level == store.selectedCategory!.level){
        count++
      }
    })
  })
  return count >= store.selectedCategory!.requirements.minElementsOfSameLevel
})

const isMinScoreReached = computed(() =>{
  if(store.gender === 'female')
    return store.score! >= store.selectedCategory!.requirements.minFemaleScore
  else
    return store.score! >= store.selectedCategory!.requirements.minMaleScore
})

const scoreText = computed(() =>{
  if(store.gender === 'female')
    return 'Минимальное количество баллов для женщин ' + store.selectedCategory!.requirements.minFemaleScore
  else
    return 'Минимальное количество баллов для мужчин ' + store.selectedCategory!.requirements.minMaleScore
})

</script>

<template>
  <v-card>
    <v-card-title>Условия</v-card-title>

    <v-list>
      <requirement
        :text="'От ' + store.selectedCategory!.requirements.minCombo + ' элементов в одном из комбо'"
        :value="isMinCombosReached"
      />
      <requirement
        :text="store.selectedCategory!.requirements.minElementsOfSameLevel + ' элементов этого уровня'"
        :value="isMinElementsOftheSameLevelReached"
      />
      <requirement
        :text="scoreText"
        :value="isMinScoreReached"
      />
    </v-list>
  </v-card>
</template>

<style scoped>

</style>
