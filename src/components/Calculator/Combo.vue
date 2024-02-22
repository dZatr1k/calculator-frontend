<script setup lang="ts">
import {Combo} from "@/types";
import {useCalculatorStore} from "@/store/app";
import {computed} from "vue";

const store = useCalculatorStore()
const model = defineModel<Combo>()

const items = computed(() => store.content?.elements ?? [])

const updateElement = (i: number, item: string | null) => {

}

</script>

<template>
  <v-select
    v-for="(element, i) of model"
    :model-value="element"
    @update:model-value="value => updateElement(i, value)"
    :items="items"
    item-value="id"
    item-title="name"
    clearable=""
  />
  <v-select
    @update:model-value="value => model.push(value)"
    :model-value="null"
    :items="items"
    item-value="id"
    item-title="name"
    placeholder="Добавить элемент"
  />
</template>

<style scoped>

</style>
