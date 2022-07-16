import {h, render} from "vue";
import {MenuOptions} from "@imengyu/vue3-context-menu/src/ContextMenuDefine";
import ContextMenuConstructor from "@imengyu/vue3-context-menu/src/ContextMenu.vue";

const genContainer = () => {
    return document.createElement("div");
};
const initInstance = (options: MenuOptions, container: HTMLElement) => {
    const vNode = h(ContextMenuConstructor, {
        options: options,
        show: true,
        onClose: () => {
            render(null, container);
        },
    });
    render(vNode, container);
    document.body.appendChild(container.firstElementChild as Node);
    return vNode.component;
};

const $contextmenu = (options: MenuOptions) => {
    const container = genContainer();
    initInstance(options, container);
};

export default function useContextMenu() {
    return {
        $contextmenu,
    };
};
