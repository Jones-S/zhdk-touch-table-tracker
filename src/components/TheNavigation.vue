<script setup>
import { ref, onMounted, toRaw } from 'vue'
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><router-link to="/calibration">Calibration</router-link></li>
        <li><router-link to="/">Tracker</router-link></li>
      </ul>
    </nav>
  </header>
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
