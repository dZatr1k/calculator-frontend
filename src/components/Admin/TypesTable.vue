<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {handleError, useCalculatorStore} from "@/store/app";
import {ElementTypeRequest, ElementTypeResponse} from "@/restAPI";
import {validateText} from "@/validation";

const loadingDialog = ref(false)

interface EditingElementType {
  id: number | null,
  name: string
}

const initialState: EditingElementType = {
  id: null,
  name: ''
}

const editedItem = reactive<EditingElementType>({...initialState})

const editItem = (item: ElementTypeResponse) => {
  Object.assign(editedItem, item);
  dialog.value = true
};

const isEditing = computed(() => editedItem.id !== null)
const deleteItem = async (item: ElementTypeResponse) => {
  await api?.adminDeleteElementType({
    elementTypeId: item.id!
  })
  store.loadElementTypes(true)
}

const createItem = () => {
  Object.assign(editedItem, initialState)
  dialog.value = true
}

const save = async () => {
  loadingDialog.value = true
  try {
    const requestBody: ElementTypeRequest = {
      name: editedItem.name
    }

    if (isEditing.value) {
      await api?.adminUpdateElementType({
        elementTypeId: editedItem.id!,
        elementTypeRequest: requestBody
      })
    } else {
      await api?.adminCreateElementType({
        elementTypeRequest: requestBody
      })
    }
    store.loadElementTypes(true)
    dialog.value = false
  }  catch(e) {
    handleError(e)
  } finally {
    loadingDialog.value = false
  }
}

const types = computed(() => {
  return store.elementTypes ?? []
})
const store = useCalculatorStore()
const api = store.adminApi

onMounted(() => {
  store.loadElementTypes()
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
        <v-data-table :loading="store.loadingElementTypes && store.elementTypes == null" :items="types" :headers="headers">
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
            v-model="editedItem.name"
            label="Имя"
            :rules="validateText"
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
