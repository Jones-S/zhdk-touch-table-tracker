<script setup>
import { ref, onMounted } from 'vue'
import { WebCamUI } from 'vue-camera-lib'
import { inv, multiply } from 'mathjs'

const image = ref(false)
const canvas = ref(null)
const ctx = ref(null)
const trapezPoints = ref([
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 250, y: 200 },
  { x: 150, y: 200 }
])

const photoTaken = (data) => {
  image.value = data.image_data_url

  drawTrapezium()
}

// Function to handle mouse clicks and update trapezium points
function handleMouseClick(event) {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // Update the trapezium points
  trapezPoints.value.shift() // Remove the oldest point
  trapezPoints.value.push({ x: mouseX, y: mouseY }) // Add the new point

  // Redraw the trapezium
  drawTrapezium()
}

// Function to calculate the projective mapping matrix
const calculateMappingMatrix = () => {
  const A = []
  const B = []

  for (let i = 0; i < 4; ++i) {
    const pointT = trapezPoints.value[i]
    const pointS = { x: i === 0 || i === 3 ? 0 : 1, y: i === 0 || i === 1 ? 0 : 1 }

    A.push([pointT.x, pointT.y, 1, 0, 0, 0, -pointS.x * pointT.x, -pointS.x * pointT.y])
    A.push([0, 0, 0, pointT.x, pointT.y, 1, -pointS.y * pointT.x, -pointS.y * pointT.y])

    B.push(pointS.x)
    B.push(pointS.y)
  }

  const AInv = inv(A)
  const X = multiply(AInv, B)

  // Generate matrix M
  X.push(1)
  const M = []
  for (let i = 0; i < 3; ++i) {
    M.push([X[3 * i], X[3 * i + 1], X[3 * i + 2]])
  }

  return M
}

// Example usage of the mapping matrix
const mapPoint = (point) => {
  const M = calculateMappingMatrix()
  const homogenousPoint = [...point, 1]
  const screenPoint = multiply(M, homogenousPoint)
  const mappedPoint = [screenPoint[0] / screenPoint[2], screenPoint[1] / screenPoint[2]]

  // Print the mapped point
  console.log('Mapped Point:', mappedPoint)
}

const test = () => {
  mapPoint([0.8, 0.65])
}

const drawTrapezium = () => {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.value.beginPath()
  ctx.value.moveTo(trapezPoints.value[0].x, trapezPoints.value[0].y)
  for (const point of trapezPoints.value) {
    ctx.value.lineTo(point.x, point.y)
  }
  ctx.value.closePath()
  ctx.value.stroke()
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  canvas.value.addEventListener('click', handleMouseClick)
})
</script>

<template>
  <div>Calibration in here</div>
  <WebCamUI class="webcamui" v-if="!image" :fullscreenState="false" @photoTaken="photoTaken" />

  <img v-if="image" :src="image" />
  <canvas ref="canvas" width="800" height="600"></canvas>
  <button @click="test">mapPoint</button>
</template>

<style scoped>
img {
  width: 100%;
}

.webcamui {
  width: 50%;
  max-width: 40vw;
}

/* canvas {
  width: 100%;
  height: 60vh;
} */
</style>
