<script setup>
import { ref, onMounted, toRaw } from 'vue'
import RotaryToken from './RotaryToken.vue'
import InfoBox from './InfoBox.vue'

const tokens = ref([])
let socket = false
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)
const wsConnected = ref(false)
const matrix = ref(false)

const addToken = (sessionId) => {
  console.log('📇 Adding token with sessionId: ', sessionId)
  tokens.value.push({ sessionId, id: false, x: 0, y: 0 })
}

const removeToken = (sessionId) => {
  console.log('❌ Removing token with sessionId: ', sessionId)
  tokens.value = tokens.value.filter((token) => sessionId !== token.sessionId)
}

const udpateToken = ({ sessionId, id, relativeX, relativeY, rotation }) => {
  const token = tokens.value.find((token) => {
    return token.sessionId === sessionId
  })
  token.id = id
  token.x = relativeX
  token.y = relativeY
  token.rotation = rotation
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
      console.log('msg: ', msg)
      udpateToken({ ...msg.args })
    } else if (msg.type === '/tracker/error') {
      console.error('Error: No connection could be established to the reacTIVision app.')
    }
  }
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

    <InfoBox :connected="wsConnected" />
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.fallback-message {
  margin: 0 auto;
  text-align: center;
}
</style>
