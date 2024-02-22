<template>
  <v-layout full-height>
    <v-navigation-drawer :permanent="true">
      <div class="pa-4 d-flex flex-column" style="gap: 1rem">
        <v-btn variant="tonal" color="primary" to="/">На главную</v-btn>
        <v-btn variant="tonal" color="primary" @click="logout">Выход</v-btn>
      </div>

      <v-list nav>
        <v-list-subheader title="Таблички"></v-list-subheader>
        <v-list-item
          :to="'/admin/' + item.id"
          v-for="item in items"
          :key="item.id"
          :value="item.id"
          :title="item.name"
          :prepend-icon="item.icon"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view/>
    </v-main>

  </v-layout>
</template>

<script setup lang="ts">
import {useCalculatorStore} from "@/store/app";
import {useRouter} from "vue-router";

const store = useCalculatorStore()
const router = useRouter()

const items = [
  {id: 'types', name: 'Типы', icon: 'mdi-plus'},
  {id: 'elements', name: 'Элементы', icon: 'mdi-plus'},
  {id: 'exercises', name: 'Упражнения', icon: 'mdi-plus'},
  {id: 'categories', name: 'Разряд', icon: 'mdi-plus'}
]

const logout = async () => {
  await store.logout()
  await router.push('/')
}
</script>
