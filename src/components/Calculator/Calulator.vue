<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";
import {computed, onMounted, reactive, ref} from "vue";
import CategoryExerciseRequirements from "@/components/Calculator/CategoryExerciseRequirements.vue";
import Requirements from "@/components/Calculator/Requirements.vue";
import Combos from "@/components/Calculator/Combos.vue";
import LevelStats from "@/components/Calculator/LevelStats.vue";
import TypeStats from "@/components/Calculator/TypeStats.vue";

const store = useCalculatorStore()
const loading = computed(() => store.loadingContent)
const categories = computed(() => {
  return store.content?.categories ?? []
})

const elementsDict = computed(() => {
  const elements = store.content?.elements ?? []
  return new Map(elements.map(e => [e.id, e]))
})
const creditElements = reactive<Element[]>([])
const score = ref(0)

let calculateResult = () => {
  score.value = 0
  creditElements.length = 0
  let elements = [] as number[]
  store.combos.forEach(x => elements.push(...x))
  elements.forEach(x => {
    let level = elementsDict.value.get(x)!.level
    if(store.selectedCategory!.level - 1 <= level && store.selectedCategory!.level + 2 >= level){
      creditElements.push(elementsDict.value.get(x)!)
      score.value += elementsDict.value.get(x)!.score
    }
  })
}

const headers = ref([
  {title: 'Зачтённое упражнение', align: 'start', key: 'name', sortable: false},
  {title: 'Баллы', align: 'end', key: 'score', sortable: false}
])
const elementCount = ref(10)
const pageCount = computed(()=>{
  return Math.ceil( creditElements.length / elementCount.value)
})

onMounted(() => {
  store.loadContent()
})

</script>
<template>
  <v-container>
    <v-card>
      <v-card-title>Калькулятор</v-card-title>
      <v-card-text class="d-flex">
        <v-select
          v-model="store.selectedCategory"
          return-object=""
          :items="categories"
          item-title="name"
          item-value="id"
          :loading="loading"
          placeholder="Разряд"
        />
        <v-spacer/>
        <v-btn-toggle v-model="store.gender" mandatory color="primary">
          <v-btn icon="mdi-gender-female" value="female" />
          <v-btn icon="mdi-gender-male" value="male" />
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <template v-if="store.selectedCategory">
      <category-exercise-requirements />
      <requirements/>
      <level-stats/>
      <type-stats/>
      <combos/>

      <v-card>
        <v-card-title>Итоги</v-card-title>
          <v-card>
            <v-data-table :headers="headers" no-data-text="" items-per-page="10">
              <template v-slot:bottom>
                <div class="text-center pt-2">
                  <v-pagination
                    :length="pageCount"
                  ></v-pagination>
                </div>
              </template>
            </v-data-table>
            <v-list-item
              v-for="element in creditElements"
              :key="element.id"
              class="d-flex"
            >
              <v-card-text>
                {{element.name}} {{element.score}}
              </v-card-text>
            </v-list-item>
            <v-card-text>
              Итоговые очки: {{score}}
            </v-card-text>
          </v-card>
        <v-btn @click="calculateResult">Подвести итоги</v-btn>
      </v-card>
    </template>
  </v-container>
</template>
