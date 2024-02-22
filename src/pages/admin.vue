<template>
    <AdminPanel />
</template>

<script setup lang="ts">
import { definePage } from 'vue-router/auto'

import AdminPanel from "@/components/Admin/AdminPanel.vue";

definePage({
  meta: {
    requiresAuth: true
  },
  redirect: _ => "/admin/categories"
})
</script>
