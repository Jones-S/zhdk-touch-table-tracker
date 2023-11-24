<script setup>
/*
 * Inspired by GPT-4 and:
 * https://math.stackexchange.com/questions/3037040/normalized-coordinate-of-point-on-4-sided-concave-polygon/3039140#3039140
 * https://jsfiddle.net/fhzrd380/
 * https://www.geometrictools.com/Documentation/PerspectiveMappings.pdf
 *
 */
import { ref, onMounted, toRaw } from 'vue'
import { WebCamUI } from 'vue-camera-lib'
import * as math from 'mathjs'

const image = ref(false)
const canvas = ref(null)
const ctx = ref(null)
const selectedPoint = ref(null)
const trapezPoints = ref([
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 250, y: 200 },
  { x: 150, y: 200 }
])

const handlerSize = 12

const photoTaken = (data) => {
  image.value = data.image_data_url

  draw()
}

// Function to handle mouse clicks and update trapezium points
function handleMouseDown(event) {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  selectedPoint.value = hitTest(mouseX, mouseY, trapezPoints.value)
  console.log('selectedPoint.value: ', selectedPoint.value)

  draw()
}

const handleMouseMove = (event) => {
  console.log('selectedPoint.value: ', selectedPoint.value)
  if (selectedPoint.value !== null && selectedPoint.value !== -1) {
    const mouseX = event.clientX - canvas.value.getBoundingClientRect().left
    const mouseY = event.clientY - canvas.value.getBoundingClientRect().top

    trapezPoints.value[selectedPoint.value].x = mouseX
    trapezPoints.value[selectedPoint.value].y = mouseY
    draw()
  }
}

const handleMouseUp = () => {
  selectedPoint.value = null
}

const handleMouseRightClick = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  const poi = { x: mouseX, y: mouseY }
  mapPoint(trapezPoints.value, poi)

  saveJsonToFile({ data: 'this-is-it' })
}

const saveJsonToFile = (data) => {
  console.log('data: ', data)
  console.log('window.electron: ', window.electron)
  window.electron.saveJson(data)
}

const draw = () => {
  const background = new Image()
  background.src = image.value

  background.onload = function () {
    ctx.value.drawImage(background, 0, 0, canvas.value.width, canvas.value.height)

    ctx.value.beginPath()
    ctx.value.moveTo(trapezPoints.value[0].x, trapezPoints.value[0].y)

    for (const [index, point] of trapezPoints.value.entries()) {
      ctx.value.fillText(index, point.x + 10, point.y + 10)
      ctx.value.lineTo(point.x, point.y)
    }
    ctx.value.closePath()
    ctx.value.stroke()

    for (const [index, point] of trapezPoints.value.entries()) {
      ctx.value.beginPath()
      ctx.value.arc(point.x, point.y, handlerSize, 0, 2 * Math.PI)
      ctx.value.fill()
    }
  }
}

const hitTest = (x, y, trapezium) => {
  for (let i = 0; i < trapezium.length; i++) {
    const point = trapezium[i]
    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
    if (distance <= handlerSize + 5) {
      return i
    }
  }
  return -1
}

const mapPoint = (trapezium, point) => {
  // First, find the transformation matrix for our deformed rectangle
  // [a b c]
  // [d e f]
  // [g h 1]

  let x0 = trapezium[0].x
  let y0 = trapezium[0].y
  let x1 = trapezium[1].x
  let y1 = trapezium[1].y
  let x2 = trapezium[2].x
  let y2 = trapezium[2].y
  let x3 = trapezium[3].x
  let y3 = trapezium[3].y

  let dx1 = x1 - x2
  let dx2 = x3 - x2
  let dx3 = x0 - x1 + x2 - x3
  let dy1 = y1 - y2
  let dy2 = y3 - y2
  let dy3 = y0 - y1 + y2 - y3

  let a13 = (dx3 * dy2 - dy3 * dx2) / (dx1 * dy2 - dy1 * dx2)
  let a23 = (dx1 * dy3 - dy1 * dx3) / (dx1 * dy2 - dy1 * dx2)
  let a11 = x1 - x0 + a13 * x1
  let a21 = x3 - x0 + a23 * x3
  let a12 = y1 - y0 + a13 * y1
  let a22 = y3 - y0 + a23 * y3

  let transformMatrix = [
    [a11, a12, a13],
    [a21, a22, a23],
    [x0, y0, 1]
  ]

  // Find the inverse of the matrix
  let inv = math.inv(transformMatrix)
  //console.log(JSON.stringify(inv));

  let pointMatrix = [point.x, point.y, 1]
  let resultMatrix = math.multiply(pointMatrix, inv)
  console.log(JSON.stringify(resultMatrix))
  const resultPoint = {
    x: resultMatrix[0] / resultMatrix[2],
    y: resultMatrix[1] / resultMatrix[2]
  }
  return resultPoint
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  canvas.value.addEventListener('mousedown', handleMouseDown)
  canvas.value.addEventListener('mousemove', handleMouseMove)
  canvas.value.addEventListener('mouseup', handleMouseUp)
  canvas.value.addEventListener('contextmenu', handleMouseRightClick)

  window.electron.onJsonSaved((event, status) => {
    if (status === 'success') {
      console.log('JSON saved successfully!')
    } else {
      console.error('Failed to save JSON')
    }
  })
})
</script>

<template>
  <div>Calibration in here</div>
  <WebCamUI class="webcamui" v-if="!image" :fullscreenState="false" @photoTaken="photoTaken" />

  <!-- <img v-if="image" :src="image" /> -->
  <canvas v-show="image" ref="canvas" width="800" height="600"></canvas>
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
