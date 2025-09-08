// src/views/Dashboard.js
import { navigateTo } from "../router.js";
import { logout, getCurrentUser } from "../services/authService.js";
import { get, post, put, del } from "../services/api.js";

export default function setupDashboard() {
  console.log("Inicializando dashboard...");

  // Verificar si el usuario está autenticado
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  if (!token || !user) {
    console.log("No hay token o usuario. Redirigiendo a login...");
    // Redireccionar a login si no hay usuario o token
    navigateTo("login");
    return;
  }

  console.log("Usuario autenticado encontrado:", user.firstName);

  // Estado global para tareas y tarea actual
  let tasks = [];
  let currentTask = null;

  // Referencias a elementos del DOM
  const elements = {
    userNameDisplay: document.getElementById("user-name"),
    userAvatarLetter: document.getElementById("user-avatar-letter"),
    logoutButton: document.getElementById("logout-button"),
    taskCounter: document.getElementById("task-counter"),
    emptyState: document.getElementById("empty-state"),
    kanbanBoard: document.getElementById("kanban-board"),
    newTaskButton: document.getElementById("new-task-button-container"),
    newTaskModal: document.getElementById("task-modal"),
    taskForm: document.getElementById("task-form"),
    closeModalBtn: document.getElementById("close-modal"),
    createFirstTaskBtn: document.getElementById("create-first-task"),
    addNewTaskBtn: document.getElementById("new-task-button"),
    modalTitle: document.getElementById("modal-title"),
  };

  // Mostrar información del usuario
  elements.userNameDisplay.textContent = `${user.firstName || "User"} ${
    user.lastName || ""
  }`;
  elements.userAvatarLetter.textContent = (
    user.firstName ? user.firstName[0] : "U"
  ).toUpperCase();

  // Event listeners
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.taskForm.addEventListener("submit", handleTaskFormSubmit);
  elements.closeModalBtn.addEventListener("click", closeModal);
  elements.createFirstTaskBtn.addEventListener("click", openNewTaskModal);
  elements.addNewTaskBtn.addEventListener("click", openNewTaskModal);

  // Inicializar dashboard
  initializeDashboard();

  /**
   * Inicializa el dashboard cargando las tareas
   */
  async function initializeDashboard() {
    try {
      console.log("Iniciando inicialización del dashboard");

      // Verificar autenticación antes de continuar
      if (!localStorage.getItem("token")) {
        throw new Error("No hay token disponible");
      }

      // Intentar cargar tareas
      await loadTasks();
      console.log("Tareas cargadas exitosamente");

      // Renderizar las tareas
      renderTasks();
      console.log("Dashboard inicializado completamente");
    } catch (error) {
      console.error("Error initializing dashboard:", error);

      // Si es un error de autenticación, intentar redirigir a login
      if (
        error.message.includes("token") ||
        error.message.includes("Authentication")
      ) {
        console.log(
          "Error de autenticación en inicialización, redirigiendo a login"
        );
        alert("Por favor, inicia sesión para acceder al dashboard.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigateTo("login"), 300);
      } else {
        // Para otros errores, mostrar mensaje pero permitir continuar
        alert(
          "Hubo un problema al cargar tus tareas. Algunas funcionalidades podrían no estar disponibles."
        );

        // Renderizar interfaz vacía
        tasks = [];
        renderTasks();
      }
    }
  }

  /**
   * Carga todas las tareas del usuario desde el servidor
   */
  async function loadTasks() {
    try {
      console.log("Cargando tareas del usuario...");

      // Verificar nuevamente si el token existe antes de hacer la solicitud
      if (!localStorage.getItem("token")) {
        console.error("No hay token disponible para cargar tareas");
        throw new Error("No hay token de autenticación");
      }

      const response = await get("/tasks");
      console.log("Tareas recibidas:", response);

      if (response && response.tasks) {
        tasks = response.tasks || [];
        console.log(`Se cargaron ${tasks.length} tareas`);
        updateTaskCounter();
      } else {
        console.warn("La respuesta no contiene tareas:", response);
        tasks = [];
        updateTaskCounter();
      }
    } catch (error) {
      console.error("Error loading tasks:", error);

      // Si es un error de autenticación, intentar redirigir a login
      if (
        error.message.includes("Authentication") ||
        error.message.includes("401")
      ) {
        console.log("Error de autenticación, redirigiendo a login");
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigateTo("login"), 500);
      }

      tasks = [];
      updateTaskCounter();
      throw error;
    }
  }

  /**
   * Actualiza el contador de tareas
   */
  function updateTaskCounter() {
    elements.taskCounter.textContent = `${tasks.length} tasks created`;

    // Actualizar contadores por estado
    const todoTasks = tasks.filter((task) => task.status === "Por hacer");
    const doingTasks = tasks.filter((task) => task.status === "Haciendo");
    const doneTasks = tasks.filter((task) => task.status === "Hecho");

    document.getElementById("todo-count").textContent = todoTasks.length;
    document.getElementById("doing-count").textContent = doingTasks.length;
    document.getElementById("done-count").textContent = doneTasks.length;

    document.getElementById("todo-counter").textContent = todoTasks.length;
    document.getElementById("doing-counter").textContent = doingTasks.length;
    document.getElementById("done-counter").textContent = doneTasks.length;
  }

  /**
   * Renderiza las tareas en el dashboard
   */
  function renderTasks() {
    if (tasks.length === 0) {
      // Mostrar estado vacío
      elements.emptyState.style.display = "flex";
      elements.kanbanBoard.style.display = "none";
    } else {
      // Mostrar tablero kanban
      elements.emptyState.style.display = "none";
      elements.kanbanBoard.style.display = "grid";

      // Limpiar contenedores
      document.getElementById("todo-tasks").innerHTML = "";
      document.getElementById("doing-tasks").innerHTML = "";
      document.getElementById("done-tasks").innerHTML = "";

      // Renderizar tareas por estado
      tasks.forEach((task) => {
        const taskElement = createTaskElement(task);

        if (task.status === "Por hacer") {
          document.getElementById("todo-tasks").appendChild(taskElement);
        } else if (task.status === "Haciendo") {
          document.getElementById("doing-tasks").appendChild(taskElement);
        } else if (task.status === "Hecho") {
          document.getElementById("done-tasks").appendChild(taskElement);
        }
      });
    }
  }

  /**
   * Crea un elemento del DOM para una tarea
   * @param {Object} task - Objeto de tarea
   * @returns {HTMLElement} - Elemento del DOM para la tarea
   */
  function createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-card";
    taskDiv.dataset.id = task._id;

    // Formatear fecha
    const dueDate = new Date(task.date);
    const formattedDate = dueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Mapear estado en inglés para mostrar en la UI
    const statusMap = {
      "Por hacer": "To do",
      Haciendo: "Doing",
      Hecho: "Done",
    };

    taskDiv.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-description">${task.detail || ""}</div>
      <div class="task-meta">
        <div class="task-date">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${formattedDate}
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-task-btn" data-id="${task._id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="delete-task-btn" data-id="${task._id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    // Agregar event listeners para botones de editar y eliminar
    taskDiv
      .querySelector(".edit-task-btn")
      .addEventListener("click", () => openEditTaskModal(task));
    taskDiv
      .querySelector(".delete-task-btn")
      .addEventListener("click", () => deleteTask(task._id));

    return taskDiv;
  }

  /**
   * Maneja el logout del usuario
   */
  async function handleLogout() {
    try {
      await logout();
      navigateTo("login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      // Si falla el logout en el servidor, limpiar localStorage de todas formas
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigateTo("login");
    }
  }

  /**
   * Abre el modal para crear una nueva tarea
   */
  function openNewTaskModal() {
    elements.modalTitle.textContent = "New Task";
    elements.taskForm.reset();
    document.getElementById("task-id").value = "";

    // Establecer fecha mínima por defecto (hoy)
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    document.getElementById("task-date").value = formattedDate;
    document.getElementById("task-date").min = formattedDate;

    currentTask = null;
    elements.newTaskModal.style.display = "flex";
  }

  /**
   * Abre el modal para editar una tarea existente
   * @param {Object} task - Tarea a editar
   */
  function openEditTaskModal(task) {
    elements.modalTitle.textContent = "Edit Task";

    // Rellenar el formulario con los datos de la tarea
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-detail").value = task.detail || "";

    // Formatear fecha para el input type="date"
    const dueDate = new Date(task.date);
    const formattedDate = dueDate.toISOString().split("T")[0];
    document.getElementById("task-date").value = formattedDate;

    document.getElementById("task-status").value = task.status;
    document.getElementById("task-id").value = task._id;

    currentTask = task;
    elements.newTaskModal.style.display = "flex";
  }

  /**
   * Cierra el modal de tarea
   */
  function closeModal() {
    elements.newTaskModal.style.display = "none";
    elements.taskForm.reset();
    currentTask = null;
  }

  /**
   * Maneja el envío del formulario de tarea
   * @param {Event} e - Evento de submit
   */
  async function handleTaskFormSubmit(e) {
    e.preventDefault();

    const formData = {
      title: document.getElementById("task-title").value,
      detail: document.getElementById("task-detail").value,
      date: document.getElementById("task-date").value,
      status: document.getElementById("task-status").value,
    };

    const taskId = document.getElementById("task-id").value;

    try {
      if (taskId) {
        // Actualizar tarea existente
        await updateTask(taskId, formData);
      } else {
        // Crear nueva tarea
        await createTask(formData);
      }

      closeModal();
      await loadTasks();
      renderTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task. Please try again.");
    }
  }

  /**
   * Crea una nueva tarea
   * @param {Object} taskData - Datos de la tarea
   */
  async function createTask(taskData) {
    try {
      await post("/tasks", taskData);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  /**
   * Actualiza una tarea existente
   * @param {string} taskId - ID de la tarea
   * @param {Object} taskData - Nuevos datos de la tarea
   */
  async function updateTask(taskId, taskData) {
    try {
      await put(`/tasks/${taskId}`, taskData);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  /**
   * Elimina una tarea
   * @param {string} taskId - ID de la tarea a eliminar
   */
  async function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await del(`/tasks/${taskId}`);
      await loadTasks();
      renderTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task. Please try again.");
    }
  }
}
