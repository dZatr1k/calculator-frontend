<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {handleError, useCalculatorStore} from "@/store/app";
import {ElementRequest, ElementResponse} from "@/restAPI";
import {useFormSchema} from "@/forms";
import * as yup from "yup";

const loadingDialog = ref(false)

const {form, formData, schema} = useFormSchema(yup.object({
  name: yup.string()
    .trim()
    .required('Заполните имя'),
  level: yup.number()
    .integer('Только целый числа')
    .min(1,'Число должно быть >= 1')
    .required()
    .typeError('Некорректное число'),
  score: yup.number()
    .integer('Только целый числа')
    .min(1,'Число должно быть >= 1')
    .required()
    .typeError('Некорректное число'),
  type: yup.number()
    .required('Выберите тип')
}))
const {handleSubmit} = form

interface EditorState {
  id: number | null
}

const initialEditorState: EditorState = {
  id: null
}

const editorState = reactive<EditorState>({...initialEditorState})

const editItem = (item: ElementResponse) => {
  formData.name.value.value = item.name
  formData.score.value.value = item.score
  formData.level.value.value = item.level
  formData.type.value.value = item.type.id

  editorState.id = item.id
  dialog.value = true
};

const isEditing = computed(() => editorState.id !== null)
const deleteItem = async (item: ElementResponse) => {
  await api?.adminDeleteElement({
    elementId: item.id!
  })
  await store.loadElements(true)
}

const createItem = () => {
  formData.name.value.value = ''
  formData.score.value.value = 1
  formData.level.value.value = 1
  formData.type.value.value = null
  dialog.value = true
}

const save = handleSubmit(async rawValues => {
  const values = schema.cast(rawValues)
  loadingDialog.value = true
  try {
    const requestBody: ElementRequest = {
      name: values.name,
      level: values.level,
      score: values.score,
      typeId: values.type!
    }

    if (isEditing.value) {
      await api?.adminUpdateElement({
        elementId: editorState.id!,
        elementRequest: requestBody
      })
    } else {
      await api?.adminCreateElement({
        elementRequest: requestBody
      })
    }
    await store.loadElements(true)
    dialog.value = false
  } catch(e) {
    handleError(e)
  } finally {
    loadingDialog.value = false
  }
})

const elements = computed(() => {
  return store.elements ?? []
})
const elementsType = computed(() => {
  return store.elementTypes ?? []
})
const store = useCalculatorStore()
const api = store.adminApi

onMounted(() => {
  store.loadElements()
})

const dialog = ref(false)

const headers = ref([
  {title: 'id', align: 'start', sortable: false, key: 'id',},
  {title: 'Название', align: 'start', key: 'name'},
  {title: 'Уровень', align: 'start', key: 'level'},
  {title: 'Очки', align: 'start', key: 'score'},
  {title: 'Тип элемента', align: 'start', key: 'type.name'},
  {title: 'Действия', align: 'end', key: 'actions', sortable: false}
])
</script>

<template>
  <v-container>
    <v-row class="mt-2">
      <v-card rounded width="100%">
        <v-card-title>
          Элементы
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
        <v-data-table :loading="store.loadingElements && store.elements == null" :items="elements" :headers="headers">
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
            <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
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
            label="Уровень"
          ></v-text-field>
          <v-text-field
            v-model="formData.score.value.value"
            :error-messages="formData.score.errorMessage.value"
            label="Очки"
          ></v-text-field>

          <v-select
            label="Тип упражнения"
            v-model="formData.type.value.value"
            :error-messages="formData.type.errorMessage.value"
            :items="elementsType"
            item-title="name"
            item-value="id"
          ></v-select>
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
