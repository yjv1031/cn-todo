import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDY9rU0tsLHk0XQ7DJSJlYcvwWwTUo0RYo",
  authDomain: "cn-todo-fc590.firebaseapp.com",
  databaseURL: "https://cn-todo-fc590-default-rtdb.firebaseio.com",
  projectId: "cn-todo-fc590",
  storageBucket: "cn-todo-fc590.firebasestorage.app",
  messagingSenderId: "1084151135048",
  appId: "1:1084151135048:web:7a6a1ccd63ea8b87e7517d",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todosRef = ref(db, "todos");

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countText = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");

let currentTodos = [];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  try {
    const todoRef = push(todosRef);
    await set(todoRef, {
      text,
      completed: false,
      createdAt: Date.now(),
    });

    input.value = "";
    input.focus();
  } catch (error) {
    alert(`Failed to add todo: ${error.message}`);
  }
});

clearCompletedBtn.addEventListener("click", async () => {
  try {
    const deletions = currentTodos
      .filter((todo) => todo.completed)
      .map((todo) => remove(ref(db, `todos/${todo.id}`)));

    await Promise.all(deletions);
  } catch (error) {
    alert(`Failed to clear completed todos: ${error.message}`);
  }
});

onValue(
  todosRef,
  (snapshot) => {
    const data = snapshot.val() ?? {};
    currentTodos = Object.entries(data)
      .map(([id, todo]) => ({ id, ...todo }))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    countText.textContent = `${currentTodos.length} items`;
    list.innerHTML = "";

    currentTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      if (todo.completed) {
        li.classList.add("is-completed");
      }

      const left = document.createElement("label");
      left.className = "todo-left";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(todo.completed);
      checkbox.addEventListener("change", async () => {
        try {
          await update(ref(db, `todos/${todo.id}`), {
            completed: checkbox.checked,
          });
        } catch (error) {
          alert(`Failed to update status: ${error.message}`);
        }
      });

      const text = document.createElement("span");
      text.textContent = todo.text;

      left.append(checkbox, text);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Delete";
      removeBtn.type = "button";
      removeBtn.className = "delete-btn";
      removeBtn.addEventListener("click", async () => {
        try {
          await remove(ref(db, `todos/${todo.id}`));
        } catch (error) {
          alert(`Failed to delete todo: ${error.message}`);
        }
      });

      li.append(left, removeBtn);
      list.append(li);
    });
  },
  (error) => {
    list.innerHTML = `<li class="error">Failed to load data: ${error.message}</li>`;
  }
);
