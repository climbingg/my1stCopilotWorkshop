const STORAGE_KEY = "offline-todo-list";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const listCount = document.querySelector("#list-count");

let todos = loadTodos();

// 從瀏覽器儲存空間讀取待辦事項。
function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch {
    return [];
  }
}

// 將最新的待辦事項保存到瀏覽器儲存空間。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 重新繪製清單與底部統計資訊。
function renderTodos() {
  todoList.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `標記「${todo.text}」為完成`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  const remainingTodos = todos.filter((todo) => !todo.completed).length;
  listCount.textContent = todos.length;
  remainingCount.textContent = `未完成: ${remainingTodos} 項`;
  emptyState.hidden = todos.length > 0;
}

// 新增一筆非空白的待辦事項。
function addTodo(event) {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    todoInput.focus();
    return;
  }

  todos.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false
  });
  saveTodos();
  renderTodos();
  todoForm.reset();
  todoInput.focus();
}

function toggleTodo(id) {
  todos = todos.map((todo) => (
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener("submit", addTodo);
renderTodos();
