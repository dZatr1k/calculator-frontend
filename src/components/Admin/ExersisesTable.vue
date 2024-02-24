<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {handleError, useCalculatorStore} from "@/store/app";
import {ExerciseRequest, ExerciseResponse} from "@/restAPI";
import {useFormSchema} from "@/forms";
import * as yup from "yup";

const loadingDialog = ref(false)

const {form, formData, schema} = useFormSchema(yup.object({
  name: yup.string()
    .trim()
    .required('Заполните имя')
}))
const {handleSubmit} = form

interface EditorState {
  id: number | null
}

const initialEditorState: EditorState = {
  id: null
}

const editorState = reactive<EditorState>({...initialEditorState})

const editItem = (item: ExerciseResponse) => {
  formData.name.value.value = item.name

  editorState.id = item.id
  dialog.value = true
};

const isEditing = computed(() => editorState.id !== null)
const deleteItem = async (item: ExerciseResponse) => {
  await api?.adminDeleteExercise({
    exerciseId: item.id!
  })
  store.loadExercises(true)
  store.loadCategories(true)
}

const createItem = () => {
  formData.name.value.value = ''

  Object.assign(editorState, initialEditorState)

  dialog.value = true
}

const save = handleSubmit(async rawValues => {
  const values = schema.cast(rawValues)
  loadingDialog.value = true
  try {
    const requestBody: ExerciseRequest = {
      name: values.name
    }

    if (isEditing.value) {
      await api?.adminUpdateExercise({
        exerciseId: editorState.id!,
        exerciseRequest: requestBody
      })
    } else {
      await api?.adminCreateExercise({
        exerciseRequest: requestBody
      })
    }
    store.loadExercises(true)
    store.loadCategories(true)
    dialog.value = false
  }  catch(e) {
    handleError(e)
  } finally {
    loadingDialog.value = false
  }
})

const exercises = computed(() => {
  return store.exercises ?? []
})
const store = useCalculatorStore()
const api = store.adminApi

onMounted(() => {
  store.loadExercises()
})

const dialog = ref(false)

const headers = ref([
  {
    title: 'id', align: 'start', sortable: false, key: 'id',
  },
  {title: 'Название', align: 'start', key: 'name'},
  {title: 'Действия', align: 'end', key: 'actions', sortable: false}
])
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
        <v-data-table :loading="store.loadingExercises && store.exercises == null" :items="exercises" :headers="headers">
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
            <v-skeleton-loader type="table-row@3"></v-skeleton-loader>
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
