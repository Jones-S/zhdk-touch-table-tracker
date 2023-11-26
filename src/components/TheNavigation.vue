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
header {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
}

ul {
  list-style: none;
  display: flex;
  padding: 0.7em 0 0 0.7em;
}

li {
  margin-right: 1em;
}
</style>
