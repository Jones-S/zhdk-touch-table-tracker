<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const x = ref(window.innerWidth / 2)
const y = ref(window.innerHeight / 2)
const active = ref()
const relativeX = ref(0)
const relativeY = ref(0)
const rotation = ref(0)

const print = (val) => {
  console.log(val)
}

const rotate = (e) => {
  // only rotate active element
  if (active.value) {
    rotation.value = rotation.value + e.wheelDelta
    if (rotation.value > 360) {
      rotation.value = rotation.value - 360
    } else if (rotation.value < 0) {
      rotation.value = rotation.value + 360
    }
    emitUpdate()
  }
}

const size = 50
const cssSize = `${size}px`

onMounted(() => {
  window.addEventListener('wheel', rotate)
  window.addEventListener('keyup', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('wheel', rotate)
  window.removeEventListener('keyup', handleKey)
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245.6 245.6">
    <circle class="st0" cx="122.8" cy="122.8" r="122.8" />
    <circle class="st1" cx="122.8" cy="122.8" r="119" />
    <g class="rotating" :style="`transform: rotate(${rotation}deg);`">
      <circle cx="122.8" cy="120.46" r="65.96" />
      <circle class="st2" cx="122.8" cy="120.46" r="55.74" />
      <g>
        <polygon points="111.64,60.28 122.8,33.33 133.96,60.28 		" />
        <polygon class="st3" points="133.96,180.64 122.8,207.58 111.64,180.64 		" />
        <polygon class="st3" points="182.99,109.3 209.93,120.46 182.99,131.62 		" />
        <polygon class="st3" points="62.62,131.62 35.68,120.46 62.62,109.3 		" />
      </g>
    </g>
  </svg>

  <div class="meta">
    <table>
      <tr>
        <td>ID:</td>
        <td>{{ id }}</td>
      </tr>
      <tr>
        <td>Position:</td>
        <td>[{{ relativeX.toFixed(3) }}, {{ relativeY.toFixed(3) }}]</td>
      </tr>
      <tr>
        <td>Rotation:</td>
        <td>{{ rotation }}°</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
svg {
  width: v-bind(cssSize);
  position: absolute;
}

svg:hover {
  cursor: grab;
}
.canvas {
  width: 100%;
  height: 100%;
}
.st0 {
  fill: #bfbfbf;
}
.st1 {
  fill: #666666;
}
.st2 {
  fill: #e8eadf;
}
.st3 {
  fill: none;
}

.rotating {
  transform-origin: 50% 50%;
}

.meta {
  transform: translate(v-bind(cssSize), v-bind(cssSize));
  width: 200px;
}

table {
  font-family: monospace;
  font-size: 7px;
  line-height: 1em;
}

td {
  vertical-align: top;
}

.vdr-container.active {
  border: 0;
}
.vdr-container.active .cls-2 {
  fill: rgb(126, 208, 126);
}
</style>
