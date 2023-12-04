<script setup>
import { computed } from 'vue'

const props = defineProps({
  connected: {
    type: Boolean,
    required: false,
    default: false
  }
})

const status = computed(() => {
  return props.connected ? 'Connected' : 'Disconnected'
})
</script>

<template>
  <div class="info-box">
    <table>
      <tr>
        <td>Token Tracker:</td>
        <td>v1.1.3</td>
      </tr>
      <tr>
        <td>Websocket Port:</td>
        <td>6050</td>
      </tr>
      <tr>
        <td>Websocket Status:</td>
        <td>{{ status }}</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.info-box {
  border: 1px solid var(--vt-c-black-mute);
  display: inline-block;
  position: fixed;
  bottom: 15px;
  left: 15px;
  padding: 0.7em;
  font-size: 10px;
  opacity: 1;
}
</style>
