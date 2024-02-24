<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";
import {computed, onMounted, reactive, ref, watch} from "vue";
import CategoryExerciseRequirements from "@/components/Calculator/CategoryExerciseRequirements.vue";
import Requirements from "@/components/Calculator/Requirements.vue";
import Combos from "@/components/Calculator/Combos.vue";
import LevelStats from "@/components/Calculator/LevelStats.vue";
import TypeStats from "@/components/Calculator/TypeStats.vue";
import {ElementResponse} from "@/restAPI";

const store = useCalculatorStore()
const loading = computed(() => store.loadingContent)
const categories = computed(() => {
  return store.content?.categories ?? []
})

const headers = ref([
  {title: 'Зачтённое упражнение', align: 'start', key: 'name', sortable: false},
  {title: 'Баллы', align: 'end', key: 'score', sortable: false}
])

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
            <v-data-table
              :items="store.creditElements"
              :headers="headers"
              :hide-no-data="true"
            >
              <template v-slot:bottom>
                <div class="text-center pt-2">
                  <v-pagination
                    hidden
                    ></v-pagination>
                </div>
              </template>

            </v-data-table>

            <v-card-text>
              Итоговые очки: {{store.score}}
            </v-card-text>
          </v-card>
      </v-card>
    </template>
  </v-container>
</template>
