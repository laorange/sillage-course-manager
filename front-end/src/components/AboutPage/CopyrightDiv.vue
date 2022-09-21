<script setup lang="ts">
import packageJson from "../../../package.json";

withDefaults(defineProps<{ projectUrl: string, license?: string; addition?: string }>(), {license: "AGPL-3.0 License"});
</script>

<template>
  <div class="copyright-div">
    <div>
      <a :href="projectUrl">
        v{{ packageJson.version }} | Released under {{ license }}
      </a>
    </div>
    <div v-if="addition">{{ addition }}</div>
    <div><a href="https://github.com/laorange">Copyright © 2022 GitHub@laorange</a></div>
  </div>
</template>

<style scoped>
.copyright-div {
  font-size: 12px;
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: space-between;
}

a:link, a:visited {
  text-decoration: none;
  color: black;
  cursor: pointer;
}

a:hover {
  color: #00af50;
}
</style>
