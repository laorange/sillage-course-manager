<script setup lang="ts">
import packageJson from "../../../package.json";

withDefaults(defineProps<{ projectUrl: string, license?: string; addition?: string }>(), {license: "AGPL-3.0"});
</script>

<template>
  <div class="copyright-div">
    <div>
      <a :href="projectUrl">
        v{{ packageJson.version }} | Released under {{ license }}
      </a>
    </div>
    <div v-if="addition">{{ addition }}</div>
    <div>Copyright © 2022 <a href="https://github.com/laorange">GitHub@laorange</a></div>
  </div>
</template>

<style scoped>
.copyright-div {
  font-size: xx-small;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

a:link, a:visited {
  text-decoration: none;
  color: black;
}
</style>
