import {defineStore} from "pinia";

type State = {}

export const useStore = defineStore("counter", {
    state: (): State => {
        return {};
    },
    getters: {},
    actions: {},
});