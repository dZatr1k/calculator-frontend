<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {
  AdminDeleteExerciseRequirementRequest,
  AdminSetExerciseRequirementRequest,
  CategoryRequest, CategoryResponse,
} from "@/restAPI";
import "../../restAPI/apis/DefaultApi";
import {handleError, useCalculatorStore} from "@/store/app";

const loadingDialog = ref(false)

interface EditingCategory {
  id: number | null,
  name: string,
  level: number,
  minCombo: number,
  minElementsOfSameLevel: number,
  minFemaleScore: number,
  minMaleScore: number,
  exerciseRequirementIds: number[],
  exerciseRequirements: Record<number, number>
}

const initialState: EditingCategory = {
  id: null,
  name: '',
  level: 0,
  minCombo: 0,
  minElementsOfSameLevel: 0,
  minFemaleScore: 0,
  minMaleScore: 0,
  exerciseRequirementIds: [],
  exerciseRequirements: {}
}

const editedItem = reactive<EditingCategory>({...initialState})
const constEditedItem = reactive<EditingCategory>({...initialState})

const editItem = (item: CategoryResponse) => {
  item.exerciseRequirements
  let subItem = {
    id: item.id,
    name: item.name,
    level: item.level,
    minCombo: item.requirements.minCombo,
    minElementsOfSameLevel: item.requirements.minElementsOfSameLevel,
    minFemaleScore: item.requirements.minFemaleScore,
    minMaleScore: item.requirements.minMaleScore,
    exerciseRequirementIds: item.exerciseRequirements.map(it => it.exercise.id),
    exerciseRequirements: Object.fromEntries(item.exerciseRequirements.map(it => [it.exercise.id, it.count]))
  }
  Object.assign(editedItem, subItem);
  Object.assign(constEditedItem, subItem);
  dialog.value = true
};

const isEditing = computed(() => editedItem.id !== null)

const deleteItem = async (item: CategoryResponse) => {
  await api?.adminDeleteCategory({
    categoryId: item.id!
  })

  store.loadCategories(true)
}

const createItem = () => {
  Object.assign(editedItem, initialState)
  dialog.value = true
}

const updateExerciseRequirementIds = (value: number[]) => {
  for (const id of value) {
    if (!(id in editedItem.exerciseRequirements)) {
      editedItem.exerciseRequirements[id] = 1
    }
  }
  editedItem.exerciseRequirementIds = value
}

const save = async () => {
  loadingDialog.value = true
  try {
    const requestBody: CategoryRequest = {
      name: editedItem.name,
      level: editedItem.level,
      requirements: {
        minMaleScore: editedItem.minMaleScore,
        minFemaleScore: editedItem.minFemaleScore,
        minElementsOfSameLevel: editedItem.minElementsOfSameLevel,
        minCombo: editedItem.minCombo
      }
    }

    let response: CategoryResponse
    if (isEditing.value) {
      response = await api.adminUpdateCategory({
        categoryId: editedItem.id!,
        categoryRequest: requestBody
      })
    } else {
      response = await api.adminCreateCategory({
        categoryRequest: requestBody
      })
    }
    let newIds = new Set(editedItem.exerciseRequirementIds)
    let toDeleteIds = constEditedItem.exerciseRequirementIds.filter(x => !newIds.has(x))

    await Promise.all(toDeleteIds.map(x => {
      delete editedItem.exerciseRequirements[x]
      return api?.adminDeleteExerciseRequirement({
        categoryId: response.id,
        exerciseId: x
      })
    }))

    await Promise.all(Object.entries(editedItem.exerciseRequirements).map(([exerciseId, count]) => {
      return api?.adminSetExerciseRequirement({
        categoryId: response.id,
        exerciseId: Number(exerciseId),
        categoryExerciseRequirementRequest: {
          count: Number(count)
        }
      })
    }))

    await store.loadCategories(true)
    await store.loadExercises(true)
    dialog.value = false
  } catch(e){
    handleError(e)
  } finally {
    loadingDialog.value = false
  }
}

const exercises = computed(() => {
  return store.exercises ?? []
})
const categories = computed(() => {
  return store.categories ?? []
})
const store = useCalculatorStore()
const api = store.adminApi!

onMounted(() => {
  store.loadCategories()
  store.loadExercises()
})

const saveButtonDisabled = computed(() =>{
  return !editedItem.name || editedItem.minCombo < 0
    || editedItem.minElementsOfSameLevel < 0 || editedItem.minFemaleScore < 0
    || editedItem.minMaleScore < 0 || editedItem.level < 0
})
const dialog = ref(false)

const headers = ref([
  {
    title: 'id', align: 'start', sortable: false, key: 'id',
  },
  {title: 'Название категории', align: 'center', key: 'name'},
  {title: 'Уровень', align: 'center', key: 'level'},
  {title: 'Требования', align: 'center', key: 'requirements', sortable: false, children:[
      {title: 'Минимальное комбо', align: 'center', key: 'requirements.minCombo'},
      {title: 'Минимальное количество элементов того же уровня', align: 'center', key: 'requirements.minElementsOfSameLevel'},
      {title: 'Минимальные очки для Женщин', align: 'center', key: 'requirements.minFemaleScore'},
      {title: 'Минимальные очки для Мужчин', align: 'center', key: 'requirements.minMaleScore'},
    ]},

  {title: 'Требуемые упражнения', align: 'center', key: 'exerciseRequirements', sortable: false},
  {title: 'Действия', align: 'end', key: 'actions', sortable: false}
])

const rule = (v: number) => v >= 0 || 'Отрицательные числа недопустимы'

</script>

<template>
  <v-container>
    <v-row class="mt-2">
      <v-card rounded width="100%">
        <v-card-title>
          Типы
        </v-card-title>
        <v-card-text>
          <v-btn variant="tonal" prepend-icon="mdi-plus" color="primary" @click="createItem">
            Создать
          </v-btn>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row class="mt-8">
      <v-sheet rounded width="100%">
        <v-data-table :loading="store.loadingCategories && store.categories == null" :items="categories" :headers="headers">
          <template v-slot:item.exerciseRequirements="{ item }">
            <v-chip-group>
              <v-chip
                v-for="requirements in item.exerciseRequirements"
                :key="requirements.id">
                {{requirements.exercise.name}}: {{requirements.count}}
              </v-chip>
            </v-chip-group>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              size="small"
              class="me-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              size="small"
              @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
          </template>
        </v-data-table>
      </v-sheet>
    </v-row>
  </v-container>
  <v-dialog v-model="dialog" max-width="400px" persistent>
    <v-card>
      <v-card-title>
        {{ isEditing ? 'Изменить' : 'Создать' }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="save" :disabled="loadingDialog">
          <v-text-field
            v-model="editedItem.name"
            label="Имя"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.level"
            type="number"
            label="Уровень"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.minCombo"
            type="number"
            label="Минимальное комбо"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.minElementsOfSameLevel"
            type="number"
            label="Минимальное количество элементов того же уровня"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.minFemaleScore"
            type="number"
            label="Минимальные очки для женщин"
          ></v-text-field>

          <v-text-field
            v-model="editedItem.minMaleScore"
            type="number"
            label="Минимальные очки для мужчин"
          ></v-text-field>

          <v-select
            chips
            multiple
            label="Требуемые упражнения"
            :model-value="editedItem.exerciseRequirementIds"
            @update:model-value="updateExerciseRequirementIds"
            :items="exercises"
            item-title="name"
            item-value="id"
          ></v-select>

          {{editedItem.exerciseRequirementIds}}

          <v-list>
            <v-list-subheader title="Настройка требований упражнений"></v-list-subheader>
            <v-list-item
              v-for="exercise in exercises.filter(ex => editedItem.exerciseRequirementIds.includes(ex.id))"
              :key="exercise.id"
            >
              <v-text-field
                :model-value="editedItem.exerciseRequirements[exercise.id]"
                @update:model-value="value => editedItem.exerciseRequirements[exercise.id] = Number(value)"
                :rules="rule"
                type="number"
                :label="exercise.name"
              ></v-text-field>
            </v-list-item>
          </v-list>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" variant="text" @click="dialog = false" :disabled="loadingDialog">
          Отменить
        </v-btn>
        <v-btn color="primary" variant="text" @click="save" :loading="loadingDialog" :disabled="saveButtonDisabled">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
