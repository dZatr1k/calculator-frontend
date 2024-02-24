<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";
import {ref} from "vue";

const store = useCalculatorStore()

const headers = ref([
  {title: 'Требуемое упражнение', align: 'start', key: 'exercise.name', sortable: false},
  {title: 'Количество повторов', align: 'end', key: 'count', sortable: false}
])
</script>

<template>
  <v-card>
    <v-card-title>Требования</v-card-title>
    <v-data-table
      :items="store.selectedCategory!.exerciseRequirements"
      foo
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
  </v-card>
</template>
