<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {
  AdminDeleteExerciseRequirementRequest,
  AdminSetExerciseRequirementRequest,
  CategoryRequest, CategoryResponse,
} from "@/restAPI";
import "../../restAPI/apis/DefaultApi";
import {handleError, useCalculatorStore} from "@/store/app";
import {useFormSchema} from "@/forms";
import * as yup from "yup";
import {InferType, Schema} from "yup";
import {FieldContext, useField} from "vee-validate";

const loadingDialog = ref(false)

const {form, formData, schema} = useFormSchema(yup.object({
  name: yup.string()
    .trim()
    .required('sosi'),
  level: yup.number()
    .integer()
    .min(1)
    .required('sosi'),
  minCombo: yup.number()
    .integer()
    .min(1)
    .required('sosi'),
  minElementsOfSameLevel: yup.number()
    .integer()
    .min(1)
    .required('sosi'),
  minFemaleScore: yup.number()
    .integer()
    .min(1)
    .required('sosi'),
  minMaleScore: yup.number()
    .integer()
    .min(1)
    .required('sosi'),
}))
const {handleSubmit} = form

interface EditorState {
  id: number | null,
  initialExerciseRequirementIds: number[],
  exerciseRequirementIds: number[],
  exerciseRequirements: Record<number, number>,
}
const initialEditorState: EditorState = {
  id: 0,
  initialExerciseRequirementIds: [],
  exerciseRequirementIds: [],
  exerciseRequirements: {},
}

const editorState = reactive<EditorState>({...initialEditorState})

const editItem = (item: CategoryResponse) => {
  formData.name.value.value = item.name
  formData.level.value.value = item.level
  formData.minCombo.value.value = item.requirements.minCombo
  formData.minElementsOfSameLevel.value.value = item.requirements.minElementsOfSameLevel
  formData.minFemaleScore.value.value = item.requirements.minFemaleScore
  formData.minMaleScore.value.value = item.requirements.minMaleScore

  editorState.id = item.id
  editorState.initialExerciseRequirementIds = item.exerciseRequirements.map(it => it.exercise.id)
  editorState.exerciseRequirementIds = item.exerciseRequirements.map(it => it.exercise.id)
  editorState.exerciseRequirements = Object.fromEntries(item.exerciseRequirements.map(it => {
    return [it.exercise.id, it.count];
  }))

  console.info(editorState.exerciseRequirements)

  dialog.value = true
};

const isEditing = computed(() => editorState.id !== null)

const deleteItem = async (item: CategoryResponse) => {
  await api?.adminDeleteCategory({
    categoryId: item.id!
  })

  store.loadCategories(true)
}

const createItem = () => {
  formData.name.value.value = ''
  formData.level.value.value = 1
  formData.minCombo.value.value = 1
  formData.minElementsOfSameLevel.value.value = 1
  formData.minFemaleScore.value.value = 1
  formData.minMaleScore.value.value = 1

  Object.assign(editorState, initialEditorState)

  dialog.value = true
}

const updateExerciseRequirementIds = (value: number[]) => {
  for (const id of value) {
    if (!(id in editorState.exerciseRequirements)) {
      editorState.exerciseRequirements[id] = 1
    }
  }
  editorState.exerciseRequirementIds = value
}

const save = handleSubmit(async rawValues => {
  const values = schema.cast(rawValues)

  // Array.from(Object.values(editorState.exerciseRequirements)).map(async it => {
  //   await it.validate()
  //   console.log(it.value.value)
  //   console.log(await it.validate())
  // })

  loadingDialog.value = true
  try {
    const requestBody: CategoryRequest = {
      name: values.name,
      level: values.level,
      requirements: {
        minMaleScore: values.minMaleScore,
        minFemaleScore: values.minFemaleScore,
        minElementsOfSameLevel: values.minElementsOfSameLevel,
        minCombo: values.minCombo
      }
    }

    let response: CategoryResponse
    if (isEditing.value) {
      response = await api.adminUpdateCategory({
        categoryId: editorState.id!,
        categoryRequest: requestBody
      })
    } else {
      response = await api.adminCreateCategory({
        categoryRequest: requestBody
      })
    }
    let newIds = new Set(editorState.exerciseRequirementIds)
    let toDeleteIds = editorState.initialExerciseRequirementIds.filter(x => !newIds.has(x))

    await Promise.all(toDeleteIds.map(x => {
      delete editorState.exerciseRequirements[x]
      return api?.adminDeleteExerciseRequirement({
        categoryId: response.id,
        exerciseId: x
      })
    }))

    await Promise.all(Object.entries(editorState.exerciseRequirements).map(([exerciseId, count]) => {
      return api?.adminSetExerciseRequirement({
        categoryId: response.id,
        exerciseId,
        categoryExerciseRequirementRequest: {
          count
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
})

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
            v-model="formData.name.value.value"
            :error-messages="formData.name.errorMessage.value"
            label="Имя"
          ></v-text-field>
          <v-text-field
            v-model="formData.level.value.value"
            :error-messages="formData.level.errorMessage.value"
            type="number"
            label="Уровень"
          ></v-text-field>
          <v-text-field
            v-model="formData.minCombo.value.value"
            :error-messages="formData.minCombo.errorMessage.value"
            type="number"
            label="Минимальное комбо"
          ></v-text-field>
          <v-text-field
            v-model="formData.minElementsOfSameLevel.value.value"
            :error-messages="formData.minElementsOfSameLevel.errorMessage.value"
            type="number"
            label="Минимальное количество элементов того же уровня"
          ></v-text-field>
          <v-text-field
            v-model="formData.minFemaleScore.value.value"
            :error-messages="formData.minFemaleScore.errorMessage.value"
            type="number"
            label="Минимальные очки для женщин"
          ></v-text-field>

          <v-text-field
            v-model="formData.minMaleScore.value.value"
            :error-messages="formData.minMaleScore.errorMessage.value"
            type="number"
            label="Минимальные очки для мужчин"
          ></v-text-field>

          <v-select
            chips
            multiple
            label="Требуемые упражнения"
            :model-value="editorState.exerciseRequirementIds"
            @update:model-value="updateExerciseRequirementIds"
            :items="exercises"
            item-title="name"
            item-value="id"
          ></v-select>

          {{editorState.exerciseRequirementIds}}

          <v-list>
            <v-list-subheader title="Настройка требований упражнений"></v-list-subheader>
            <v-list-item
              v-for="exercise in exercises.filter(ex => editorState.exerciseRequirementIds.includes(ex.id))"
              :key="exercise.id"
            >
              <v-text-field
                v-model="editorState.exerciseRequirements[exercise.id]"
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
        <v-btn color="primary" variant="text" @click="save" :loading="loadingDialog">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
