import { App, initialState, actions } from "./components/App.js";
import { owl } from "@odoo/owl";

const { Store, mount } = owl;
const { whenReady } = owl.utils;

( function () {
    // ---- this is the main part, a seperate file
    // Setup code
    function makeStore() {
        const localState = window.localStorage.getItem("todoapp");
        const state = localState ? JSON.parse(localState) : initialState;
        const store = new Store({ state, actions });
        store.on("update", null, () => {
            localStorage.setItem("todoapp", JSON.stringify(store.state));
        });
        return store;
    }

    function setup() {
        owl.config.mode = "dev";
        const env = { store: makeStore() };
        mount(App, { target: document.body, env });
    }

    whenReady(setup);
})();