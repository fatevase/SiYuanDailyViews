<script setup>

defineProps({emoji_unicode: String});
</script>
<template>
<span v-html="'&#x'+emoji_unicode+';'"></span>
</template>