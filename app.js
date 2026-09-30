const STORAGE_KEY = "offline-todo-list";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const listCount = document.querySelector("#list-count");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll(".filter-button");
const THEME_STORAGE_KEY = "offline-todo-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

let todos = loadTodos();
let activeFilter = "all";

// 套用已儲存的主題；沒有手動選擇時由作業系統設定決定。
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.dataset.theme = savedTheme;
  }
  updateThemeButton(savedTheme ? savedTheme === "dark" : systemTheme.matches);
}

function updateThemeButton(isDark) {
  themeToggle.innerHTML = isDark
    ? '<span aria-hidden="true">☀️</span><span>淺色模式</span>'
    : '<span aria-hidden="true">🌙</span><span>深色模式</span>';
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme
    || (systemTheme.matches ? "dark" : "light");
  const isDark = currentTheme !== "dark";
  const theme = isDark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateThemeButton(isDark);
}

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

  const visibleTodos = todos.filter((todo) => {
    if (activeFilter === "active") return !todo.completed;
    if (activeFilter === "completed") return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
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
  listCount.textContent = visibleTodos.length;
  remainingCount.textContent = `未完成: ${remainingTodos} 項`;
  emptyState.textContent = todos.length === 0
    ? "還沒有任何待辦事項，新增一個吧!"
    : activeFilter === "active"
      ? "目前沒有未完成的事項。"
      : activeFilter === "completed"
        ? "目前沒有已完成的事項。"
        : "還沒有任何待辦事項，新增一個吧!";
  emptyState.hidden = visibleTodos.length > 0;
}

function setFilter(event) {
  activeFilter = event.currentTarget.dataset.filter;
  filterButtons.forEach((button) => {
    const isActive = button === event.currentTarget;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderTodos();
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
themeToggle.addEventListener("click", toggleTheme);
filterButtons.forEach((button) => button.addEventListener("click", setFilter));
systemTheme.addEventListener("change", (event) => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    updateThemeButton(event.matches);
  }
});
loadTheme();
renderTodos();
