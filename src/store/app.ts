// Utilities
import {defineStore} from 'pinia'
import {ElementResponse, CategoryResponse, DefaultApi, ElementTypeResponse, ExerciseResponse, Content, ResponseError} from "@/restAPI";
import {AuthorizationData, createApi, ErrorResponse} from "@/api";
import {Combo} from "@/types";
import Toastify from "toastify-js"
import {computed} from "vue";

const getErrorResponse = async (error: ResponseError) => {
  if (error?.response) {
    try {
      const json = await error.response.json()
      if ('name' in json && 'message' in json) {
        return <ErrorResponse>json;
      } else {
        return <ErrorResponse>{
          name: 'UNKNOWN_ERROR',
          message: 'Низвестная ошибка'
        }
      }
    } catch (e) {
      return <ErrorResponse>{
        name: 'UNKNOWN_ERROR',
        message: 'Низвестная ошибка'
      }
    }
  }
  return <ErrorResponse>{
    name: 'CONNECTION_ERROR',
    message: 'Отсутствует соединение с сервером.'
  }
}

export const handleError = async (e: any) => {
  let response: ErrorResponse
  if (e instanceof ResponseError) {
    response = await getErrorResponse(e)
  } else {
    response = <ErrorResponse>{
      name: 'UNKNOWN_ERROR',
      message: 'Неизвестная ошибка'
    }
  }

  console.error(response, e)

  Toastify({
    text: response.message,
    close: true,
    gravity: 'bottom',
    style: {
      background: 'red'
    }
  }).showToast()
}

export const useCalculatorStore = defineStore('apiData', {
  state: () => ({
    authData: null as AuthorizationData | null,
    userApi: createApi(),
    adminApi: null as DefaultApi | null,

    loadingCategories: true,
    categories: null as CategoryResponse[] | null,

    loadingElements: true,
    elements: null as ElementResponse[] | null,

    loadingElementTypes: true,
    elementTypes: null as ElementTypeResponse[] | null,

    loadingExercises: true,
    exercises: null as ExerciseResponse[] | null,

    loadingContent: true,
    content: null as Content | null,

    selectedCategory: null as CategoryResponse | null,
    combos: [[]] as Combo[],
    gender: 'male' as 'male' | 'female',
    elementsDict: new Map(),
    creditElements: [] as ElementResponse[],
    score: null as number | null
  }),
  getters: {
    isAuthorized: (store) => store.authData !== null,
    elementsDict: (store) => {
      const elements = store.content?.elements ?? []
      return new Map<number, ElementResponse>(elements.map(e => [e.id, e]))
    },
    creditElements(state) {
      return this.combos.flatMap(elements => elements
        .map(elementId => state.elementsDict.get(elementId))
        .filter(element => state.selectedCategory!.level - 1 <= element.level
          && state.selectedCategory!.level + 2 >= element.level))

      // const elements = [] as ElementResponse[]
      // state.combos.forEach(x => {
      //   x.forEach(y =>{
      //     const element = this.elementsDict.get(y)!
      //     if(state.){
      //       elements.push(element)
      //     }
      //   })
      // })
      // return elements
    },
    score(state){
      let count = 0
      this.creditElements.forEach(x => {
        count += x.score
      })

      return count
    }

  },
  actions: {
    async loadContent(force: boolean = false) {
      if (!force && this.content != null) {
        return
      }
      this.loadingContent = true
      try {
        this.content = await this.userApi.getContent()
      } catch (e: any) {
        await handleError(e)
      } finally {
        this.loadingContent = false
      }
    },

    async loadCategories(force: boolean = false) {
      if (!force && this.categories != null) {
        return
      }
      this.loadingCategories = true
      try {
        this.categories = await this.adminApi!.adminGetCategories()
      } catch (e: any) {
        await handleError(e)
      } finally {
        this.loadingCategories = false
      }
    },

    async loadElements(force: boolean = false) {
      if (!force && this.elements != null) {
        return
      }
      this.loadingElements = true
      try {
        this.elements = await this.adminApi!.adminGetElements()
      } catch (e: any) {
        await handleError(e)
      } finally {
        this.loadingElements = false
      }
    },
    async loadElementTypes(force: boolean = false) {
      if (!force && this.elementTypes != null) {
        return
      }
      this.loadingElementTypes = true
      try {
        this.elementTypes = await this.adminApi!.adminGetElementTypes()
      } catch (e: any) {
        await handleError(e)
      } finally {
        this.loadingElementTypes = false
      }
    },
    async loadExercises(force: boolean = false) {
      if (!force && this.exercises != null) {
        return
      }
      this.loadingExercises = true
      try {
        this.exercises = await this.adminApi!.adminGetExercises()
      } catch (e: any) {
        await handleError(e)
      } finally {
        this.loadingExercises = false
      }
    },
    async loadAuth() {
      if (this.isAuthorized) {
        return true
      }

      const savedAuthData = localStorage.getItem('auth-data')
      if (savedAuthData) {
        const authData = JSON.parse(savedAuthData)
        const result = await this.setAuthData(authData)
        if(!result){
          localStorage.removeItem('auth-data')
        }
        return result
      }
    },
    async setAuthData(authData: AuthorizationData) {
      try {
        const adminApi = createApi(authData)
        await adminApi.adminCheckAuth()

        localStorage.setItem('auth-data', JSON.stringify(authData))

        this.adminApi = adminApi
        this.authData = authData
        return true
      } catch (e: any) {
        await handleError(e)
        return false
      }
    },
    async logout() {
      localStorage.removeItem('auth-data')
      this.adminApi = null
      this.authData = null
    }
  }
})
