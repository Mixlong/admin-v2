import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 响应式窗口尺寸
 * @returns {{ width: Ref<number>, height: Ref<number> }}
 */
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
