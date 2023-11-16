<script setup>
import { ref, onMounted } from 'vue'
import RotaryToken from './RotaryToken.vue'

const tokens = ref([])
let socket = false
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)

const addToken = () => {
  // const { x, y } = event
  // const relativeX = x / canvasWidth.value
  // const relativeY = y / canvasHeight.value
  const id = new Date().valueOf()

  tokens.value.push({ id })

  if (socket) {
    socket.send(
      JSON.stringify({
        type: '/tracker/add',
        args: {
          id,
          x: 0,
          y: 0,
          relativeX: 0,
          relativeY: 0,
          rotation: 0
        }
      })
    )
  }
}

const removeToken = (id) => {
  tokens.value = []
  const index = tokens.value.findIndex((token) => token.id === id)

  if (index !== -1) {
    tokens.value.splice(index, 1)
  }

  console.log('tokens.value: ', tokens.value)
}

const recalculateCanvas = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
}

const sendUpdatedPosition = (data) => {
  if (socket) {
    console.log('udpated position data: ', data)

    socket.send(
      JSON.stringify({
        type: '/tracker/update',
        args: {
          ...data
        }
      })
    )
  }
}

const connectToWebsocketServer = () => {
  // create connection
  const port = import.meta.env.VITE_WEBSOCKET_PORT
  const server = `ws://localhost:${port}`
  socket = new WebSocket(server)
  socket.onopen = () => {
    console.log('Websocket connection established')
  }

  socket.onerror = (error) => {
    console.log(`WebSocket error: `, error)
  }

  socket.onmessage = (e) => {
    console.log(e.data)
  }
}

onMounted(() => {
  window.addEventListener('resize', recalculateCanvas)
  connectToWebsocketServer()
})
</script>

<template>
  <div class="canvas">
    <div class="controls"><button @click="addToken">Add token</button></div>
    <div v-if="tokens.length <= 0" class="fallback-message">Place tokens here</div>
    <RotaryToken v-for="token in tokens" :key="token.id" @destroy="removeToken" :id="token.id" />
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.controls {
  padding: 15px;
}

.fallback-message {
  margin: 0 auto;
  text-align: center;
}
</style>
