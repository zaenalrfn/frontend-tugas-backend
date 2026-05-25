<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  type: 'success' | 'error' | 'warning'
  message: string
}>()

const icon = computed(() => {
  if (props.type === 'success') return CheckCircle2
  if (props.type === 'error') return XCircle
  return AlertTriangle
})

const styles = computed(() => {
  if (props.type === 'success') {
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }
  if (props.type === 'error') {
    return 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  }
  return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
})
</script>

<template>
  <div :class="['flex items-center gap-3 px-4 py-3.5 border rounded-xl backdrop-blur-md transition-all shadow-lg', styles]">
    <component :is="icon" class="w-5 h-5 flex-shrink-0" />
    <span class="text-sm font-medium leading-relaxed">{{ message }}</span>
  </div>
</template>
