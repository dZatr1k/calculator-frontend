<template>
  <div class="d-flex align-center justify-center h-100">
    <v-card max-width="400" width="100%" variant="text">
      <v-card-title>
        💪🏽 Вход в панель админа 💪🏽
      </v-card-title>
      <v-form @submit.prevent="submit" :disabled="isLoading">
        <v-text-field
          v-model="formData.login.value.value"
          label="Введите имя"
          :error-messages="formData.login.errorMessage.value"
        >
        </v-text-field>
        <v-text-field
          :append-inner-icon="isPasswordShowed ? 'mdi-eye' : 'mdi-eye-off'"
          :type="isPasswordShowed ? 'text' : 'password'"
          v-model="formData.password.value.value"
          label="Введите пароль"
          @click:append-inner="isPasswordShowed = !isPasswordShowed"
          :error-messages="formData.password.errorMessage.value"
        >
        </v-text-field>
        <v-btn
          :loading="isLoading"
          type="submit" color="primary" class="mt-2" block="true" variant="tonal" size="x-large">
          Войти
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useCalculatorStore} from "@/store/app"
import {useRoute, useRouter} from "vue-router";
import * as yup from 'yup';
import {useFormSchema} from "@/forms";

const {form, formData, schema} = useFormSchema(yup.object({
  login: yup.string()
    .trim()
    .required('Заполните логин'),
  password: yup.string()
    .trim()
    .required('Заполните пароль'),
}))
const {handleSubmit} = form

const store = useCalculatorStore()
const route = useRoute()
const router = useRouter()

const isPasswordShowed = ref(false)
const isLoading = ref(false)

const submit = handleSubmit(async rawValues => {
  const values = schema.cast(rawValues)
  isLoading.value = true;
  if (await store.setAuthData(values)) {
    const redirect = <string>(route.query['redirect'] ?? '/admin')
    await router.push({path: redirect})
  }
  isLoading.value = false
})
</script>
