<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sessionId: {
    type: Number,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  rotation: {
    type: Number,
    required: true
  }
})

const xPercentage = computed(() => {
  return props.x * 100
})

const yPercentage = computed(() => {
  return props.y * 100
})

const size = 50
const cssSize = `${size}px`
const cssTokenTranslation = `-${size / 2}px, -${size / 2}px`
</script>

<template>
  <div class="token" :style="`top: ${yPercentage}%; left: ${xPercentage}%;}`">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
      <circle id="knob-fill" class="st0" cx="125" cy="125" r="125" />
      <circle id="fill" class="st1" cx="125" cy="125" r="115" />
      <g class="rotating" :transform="`rotate(${rotation}, 125, 125)`">
        <circle cx="125" cy="125" r="67.14" />
        <circle class="st2" cx="125" cy="125" r="56.74" />
        <g>
          <polygon points="113.6,63.52 125,36 136.4,63.52 		" />
          <polygon class="st3" points="136.4,186.48 125,214 113.6,186.48 		" />
          <polygon class="st3" points="186.48,113.6 214,125 186.48,136.4 		" />
          <polygon class="st3" points="63.52,136.4 36,125 63.52,113.6 		" />
        </g>
      </g>
    </svg>
    <div class="meta">
      <table>
        <tr>
          <td>Session ID:</td>
          <td>{{ sessionId }}</td>
        </tr>
        <tr>
          <td>ID:</td>
          <td>{{ id }}</td>
        </tr>
        <tr>
          <td>Pos:</td>
          <td>[{{ x.toFixed(3) || 0 }}, {{ y.toFixed(3) || 0 }}]</td>
        </tr>
        <tr>
          <td>Angle:</td>
          <td>{{ rotation }}°</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.token {
  position: absolute;
  transform: translate(v-bind(cssTokenTranslation));
}

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
  fill: #7a7a7a;
}
.st1 {
  fill: var(--color-token-yellow);
}
.st2 {
  fill: #e8eadf;
}
.st3 {
  fill: none;
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
