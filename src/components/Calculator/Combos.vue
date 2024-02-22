<script setup lang="ts">
import type {Combo} from "@/types";
import {useCalculatorStore} from "@/store/app";

const store = useCalculatorStore()

const removeCombo = (i: number) => {
  if (store.combos.length == 1) {
    store.combos[0] = []
  } else {
    store.combos.splice(i, 1)
  }
}

const addCombo = () => {
  if (store.combos.length < 4) {
    store.combos.push([])
  }
}

</script>

<template>
  <v-card>
    <v-card-title class="d-flex">
      <span>Связки</span>
      <v-spacer/>
      <v-btn
        variant="text"
        color="primary"
        append-icon="mdi-plus"
        @click="addCombo()"
      >
        Добавить
      </v-btn>
    </v-card-title>
    <v-container>
      <v-row>
        <v-col v-for="(combo, i) of store.combos" :key="i">
          <div class="text-subtitle-1 d-flex align-center mb-2">
            <span>Связка {{i + 1}}</span>
            <v-spacer />
            <v-btn
              variant="text"
              icon="mdi-close"
              size="sm"
              @click="removeCombo(i)"
            />
          </div>
          <combo :model-value="combo"/>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
