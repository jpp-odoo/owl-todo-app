import { owl } from "@odoo/owl";
import '../styles/App.css';

const { Component } = owl;
const { useRef, useDispatch, useState, useStore } = owl.hooks;
const { xml } = owl.tags;

// -----
// Store Helpers
// -----
export const actions = {
    addTask({ state }, title){
        title = title.trim();
        console.log('adding task', title);
        if (title){
            const newTask = {
                id: state.nextId++,
                title: title,
                isCompleted: false,
            };
            state.tasks.push(newTask);
        }
    },
    toogleTask({ state }, id){
        const task = state.tasks.find((t) => t.id === id);
        task.isCompleted = !task.isCompleted;
    },
    deleteTask({ state }, id){
        const index = state.tasks.findIndex((t) => t.id === id);
        state.tasks.splice(index, 1);
    }
};
export const initialState = {
    nextId: 1,
    tasks: [],
};



// Owl Components
// ----------------
// Task Component
// ----------------

const TASK_TEMPLATE = xml /* xml */`
        <div class="task" t-att-class="props.task.isCompleted ? 'done' : ''">
            <input type="checkbox" t-att-checked="props.task.isCompleted"
                    t-att-id="props.task.id"
                    t-on-click="dispatch('toogleTask', props.task.id)"/>
            <label t-att-for="props.task.id"><t t-esc="props.task.title"/></label>
            <span class="delete" t-on-click="dispatch('deleteTask', props.task.id)">🗑</span>
        </div>`;

class Task extends Component{
    static template = TASK_TEMPLATE;
    static props = ["task"];
    dispatch = useDispatch();
}


// ---------------
// App Component
// --------------
const APP_TEMPLATE = xml /* xml */`
    <div class="todo-app">
        <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
        <div class="task-list">
            <t t-foreach="displayedTasks" t-as="task" t-key="task.id">
                <Task task="task"/>
            </t>
        </div>
        <div class="task-panel" t-if="tasks.length">
            <div class="task-counter">
                <t t-esc="displayedTasks.length"/>
                <t t-if="displayedTasks.length lt tasks.length"/>
                    / <t t-esc="tasks.length"/>
            </div>
            <div>
                <span t-foreach="['all', 'active', 'completed']"
                    t-as="f" t-key="f"
                    t-att-class="{active: filter.value===f}"
                    t-on-click="setFilter(f)"
                    t-esc="f"/>
            </div>
        </div>
    </div>`;

export class App extends Component {
    static template = APP_TEMPLATE;
    static components = { Task };

    inputRef = useRef("add-input")
    tasks = useStore((state) => state.tasks);
    dispatch = useDispatch();
    filter = useState({ value: "all" })

    mounted() {
        this.inputRef.el.focus();
    }

    addTask(ev){
        //13 is keycode for ENTER
        if (ev.keyCode === 13){
            this.dispatch("addTask", ev.target.value);
            ev.target.value = "";
        }
    }

    get displayedTasks(){
        switch (this.filter.value){
            case "active": return this.tasks.filter(t => !t.isCompleted);
            case "completed": return this.tasks.filter(t => t.isCompleted);
            case "all": return this.tasks;
        }
    }

    setFilter(filter) {
        this.filter.value = filter;
    }
}
