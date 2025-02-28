// Seleccionar elementos del DOM
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

document.addEventListener('DOMContentLoaded', loadTasks); // Carga las tareas desde localStorage al iniciar


addTaskBtn.addEventListener('click', () => { // Agregar tarea
  agregarTarea();
});


taskInput.addEventListener('keydown', (event) => {// Tecla Enter en el campo de texto
  if (event.key === 'Enter') {
    agregarTarea();
  }
});


function agregarTarea() {// Función para agregar una tarea
  const taskText = taskInput.value.trim();
  if (taskText !== '') {
    crearTarea(taskText);
    taskInput.value = '';
    saveTasks();
  }
}


function crearTarea(taskText, isCompleted = false) {// Agrega una tarea a la lista
  const li = document.createElement('li');
  li.textContent = taskText;

  if (isCompleted) {
    li.classList.add('completed');
  }


  const deleteBtn = document.createElement('button');  // Botón para eliminar tarea
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.classList.add('deleteBtn');
  deleteBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    console.log('¿Estás seguro de que quieres eliminar esta tarea?');

    const confirmar = confirm('¿Estás seguro de que quieres eliminar esta tarea?');
    if (confirmar) {
      taskList.removeChild(li);
      saveTasks();
    }
  });


  li.addEventListener('click', () => { // Marcar tarea como completada o cambiar a pendiente
    if (li.classList.contains('completed')) {
      console.log('Esta tarea ya está COMPLETADA. ¿Deseas cambiarla a pendiente?');
      const confirmar = confirm('Esta tarea ya está COMPLETADA. ¿Deseas cambiarla a pendiente?');
      if (confirmar) {
        li.classList.remove('completed');
        saveTasks();
      }
    } else {
      li.classList.add('completed');
      saveTasks();
    }
  });

  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}


function saveTasks() {// Guardo las tareas en localStorage
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    tasks.push({
      text: li.textContent.replace('Eliminar', '').trim(),
      completed: li.classList.contains('completed')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


function loadTasks() { // Se cargan las tareas desde localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    crearTarea(task.text, task.completed);
  });
}
