<script setup>
import { ref, onMounted, toRaw } from 'vue'
import RotaryToken from './RotaryToken.vue'
import InfoBox from './InfoBox.vue'
import * as math from 'mathjs'

const tokens = ref([])
let socket = false
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)
const wsConnected = ref(false)
const matrix = ref(false)
const invertAngle = ref(false)
const invertXAxis = ref(false)

const addToken = (sessionId) => {
  console.log('📇 Adding token with sessionId: ', sessionId)
  tokens.value.push({ sessionId, id: false, x: 0, y: 0 })
}

const removeToken = (sessionId) => {
  console.log('❌ Removing token with sessionId: ', sessionId)
  tokens.value = tokens.value.filter((token) => sessionId !== token.sessionId)
}

const udpateToken = ({ sessionId, id, x, y, rotation }) => {
  const token = tokens.value.find((token) => {
    return token.sessionId === sessionId
  })
  token.id = id
  token.x = x
  token.y = y
  token.rotation = rotation
}

const handleSettings = (changed) => {
  switch (changed) {
    case 'invertAngle':
      invertAngle.value = !invertAngle.value
      break
    case 'invertXAxis':
      invertXAxis.value = !invertXAxis.value
      break
    default:
      break
  }
  // saveConfig()
}

const recalculateCanvas = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
}

const parse = (msg) => {
  try {
    return JSON.parse(msg)
  } catch (e) {
    return msg
  }
}

const loadMatrix = async () => {
  const config = await window.electron.loadConfig()
  matrix.value = config.matrix
}

const connectToWebsocketServer = () => {
  // create connection
  const port = import.meta.env.VITE_WEBSOCKET_PORT
  const server = `ws://localhost:${port}`
  socket = new WebSocket(server)
  socket.onopen = () => {
    console.log('Websocket connection established')
    wsConnected.value = true
  }

  socket.onerror = (error) => {
    console.log(`WebSocket error: `, error)
    wsConnected.value = false
  }

  socket.onmessage = (msgJson) => {
    const msg = parse(msgJson.data)
    if (msg.type === '/tracker/add') {
      addToken(msg.args.sessionId)
    } else if (msg.type === '/tracker/remove') {
      removeToken(msg.args.sessionId)
    } else if (msg.type === '/tracker/update') {
      console.log('msg.args: ', msg.args)
      const resultPoint = mapPoint(msg.args.x, msg.args.y, matrix.value, invertXAxis.value)
      const angle = invertAngle.value ? 360 - msg.args.rotation : msg.args.rotation
      // not sending original x and ys but using the mapped values (with transformation matrix)
      udpateToken({ ...msg.args, x: resultPoint.x, y: resultPoint.y, rotation: angle })
    } else if (msg.type === '/tracker/error') {
      console.error('Error: No connection could be established to the reacTIVision app.')
    }
  }
}

const mapPoint = (x, y, invMatrix, invAxis) => {
  const pointMatrix = [x, y, 1]
  const resultMatrix = math.multiply(pointMatrix, invMatrix)
  const point = {
    x: resultMatrix[0] / resultMatrix[2],
    y: resultMatrix[1] / resultMatrix[2]
  }
  if (invAxis) {
    // point.x = math.abs(1 - point.x)
    point.x = 1 - point.x
  }
  return point
}

onMounted(() => {
  // load transformation matrix to get correct positioning of tokens
  loadMatrix()

  window.addEventListener('resize', recalculateCanvas)
  connectToWebsocketServer()
})
</script>

<template>
  <div class="canvas">
    <RotaryToken
      v-for="token in tokens"
      :key="token.sessionId"
      @destroy="removeToken"
      :id="token.id"
      :session-id="token.sessionId"
      :x="token.x"
      :y="token.y"
      :rotation="token.rotation"
    />

    <div class="controls">
      <button :class="[{ 'is-active': invertAngle }]" @click="handleSettings('invertAngle')">
        Invert Angle
      </button>
      <button :class="[{ 'is-active': invertXAxis }]" @click="handleSettings('invertXAxis')">
        Invert X-Axis
      </button>
    </div>

    <InfoBox :connected="wsConnected" />
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.controls {
  display: inline-flex;
  flex-direction: column;
  position: fixed;
  top: calc(15px + 46px);
  left: 15px;
}

button {
  font-family: jetbrains-medium;
  text-align: left;
  background-color: var(--vt-c-text-dark-2);
  border: 1px solid var(--vt-c-white-soft);
  border: 0;
  border-radius: 1px;
  color: var(--color-text);
  padding: 0.3em 0.7em;
  margin-bottom: 0.6em;
  box-shadow: 0 0 2px var(--vt-c-white-soft);
  transition: all 0.3s;
  font-size: 13px;
}

button.is-active {
  background-color: #b2c5bf;
  color: var(--vt-c-black-soft);
}

button:hover {
  cursor: pointer;
  background-color: var(--color-highlight);
  color: var(--vt-c-black-soft);
}

.fallback-message {
  margin: 0 auto;
  text-align: center;
}
</style>
