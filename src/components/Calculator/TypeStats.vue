<script setup lang="ts">
import {computed} from "vue";
import {useCalculatorStore} from "@/store/app";
import {ElementType} from "@/restAPI";

const store = useCalculatorStore()

const elementsDict = computed(() => {
  const elements = store.content?.elements ?? []
  return new Map(elements.map(e => [e.id, e]))
})

const elementStats = computed(() => {
  const fm = new Map<ElementType, number>()
  store.combos.flatMap(it => it).forEach(id => {
    const type = elementsDict.value.get(id).type
    fm.set(type, (fm.get(type) ?? 0) + 1)
  })
  return fm
})

const versatility = computed(() =>{
  let first = elementStats.value.get(store.content?.elements[0].type as ElementType) as number
  let second = elementStats.value.get(store.content?.elements[1].type as ElementType) as number
  if(first == 0 || second == 0)
    return 0
  let result = first/second
  if(result > 1)
    result = 1 / result
  return result.toFixed(2);
})
</script>

<template>
  <v-card>
    <v-card-title>Статистика</v-card-title>
    <v-list>
      <v-list-item v-for="[type, count] in elementStats.entries()">
        <v-list-item-title>{{ type.name }}</v-list-item-title>
        <template v-slot:append>{{ count }}</template>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>Универсальность</v-list-item-title>
        <template v-slot:append>{{versatility}}</template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped>

</style>
