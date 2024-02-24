<script setup lang="ts">
import {computed} from "vue";
import {useCalculatorStore} from "@/store/app";
import {ElementTypeResponse} from "@/restAPI";

const store = useCalculatorStore()

const elementsDict = computed(() => {
  const elements = store.content?.elements ?? []
  return new Map(elements.map(e => [e.id, e]))
})

const elementStats = computed(() => {
  const fm = new Map<string, number>()
  store.combos.flatMap(it => it).forEach(id => {
    const type = elementsDict.value.get(id)!.type
    fm.set(type.name, (fm.get(type.name) ?? 0) + 1)
  })
  return fm
})

const versatility = computed(() =>{
  if(elementStats.value.size < 2)
    return 0
  let first = elementStats.value.get(store.content!.elements[0].type.name)!
  let second = elementStats.value.get(store.content!.elements[1].type.name)!
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
      <v-list-item v-for="[name, count] in elementStats.entries()"
        :key="name"
      >
        <v-list-item-title>{{ name }}</v-list-item-title>
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
