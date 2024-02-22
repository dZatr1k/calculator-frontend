<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";

const store = useCalculatorStore()
</script>

<template>
  <v-card>
    <v-card-title>Требования</v-card-title>
    <v-table>
      <tbody>
      <tr
        v-for="requirement in store.selectedCategory!.exerciseRequirements"
        :key="requirement.exercise.id"
      >
        <td>
          {{ requirement.exercise.name }}
        </td>
        <td>
          {{ requirement.count }}
        </td>
      </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
