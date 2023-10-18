<script setup>
// Centers content on the page.

const props = defineProps({
  class: String,
});

const classes = `${props.class} center`;

</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style>

.center {
  display: grid;
  place-items: center;
  min-height: 90vh;
  padding: 1rem;
}

</style>
