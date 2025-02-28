// Selecciona los elementos del DOM
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

document.addEventListener('DOMContentLoaded', loadTasks); // Carga las tareas desde localStorage al iniciar

addTaskBtn.addEventListener('click', addTask); // Agregar tarea al hacer clic

taskTitle.addEventListener('keydown', (event) => { // Tecla Enter en el campo de título
  if (event.key === 'Enter') addTask();
});


taskDescription.addEventListener('keydown', (event) => { // Tecla Enter en el campo de descripción
  if (event.key === 'Enter') addTask();
});


function addTask() { // Función para agregar una tarea
  const titleText = taskTitle.value.trim();
  const descriptionText = taskDescription.value.trim();
  if (titleText !== '' && descriptionText !== '') {
    createTask(titleText, descriptionText, 'Creada');
    taskTitle.value = '';
    taskDescription.value = '';
    saveTasks();
    taskTitle.focus();
  }
}


function createTask(title, description, status) { // Agrega una tarea a la lista
  const li = document.createElement('li');
  li.innerHTML = `
    <div>
      <strong>${title}</strong>
      <p>${description}</p>
      <span>Estado: ${status}</span>
    </div>
  `;


  const buttonContainer = document.createElement('div'); // Contenedor para los botones
  buttonContainer.classList.add('button-container');


  const actionBtn = document.createElement('button'); // Botón multifuncional (Cambiar estado)
  actionBtn.classList.add('actionBtn');
  updateButton(actionBtn, status);


  actionBtn.addEventListener('click', () => {
    drivingAction(li, actionBtn);
  });


  const editBtn = document.createElement('button'); // Botón de editar (solo visible en estado "En Proceso")
  editBtn.textContent = 'Editar';
  editBtn.classList.add('editBtn');
  editBtn.style.display = status === 'En Proceso' ? 'block' : 'none';

  editBtn.addEventListener('click', () => {
    editTask(li);
  });


  const deleteBtn = document.createElement('button'); // Botón de eliminar (solo visible en estado "En Proceso")
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.classList.add('deleteBtn');
  deleteBtn.style.display = status === 'En Proceso' ? 'block' : 'none'; // Solo visible en estado "En Proceso"


  deleteBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const confirmDeletion = confirm('¿Estás seguro de que quieres eliminar esta tarea que se encuentra EN PROCESO?');
    if (confirmDeletion) {
      taskList.removeChild(li);
      saveTasks();
    }
  });


  // Agregar botones al contenedor
  buttonContainer.appendChild(actionBtn);
  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);


  li.appendChild(buttonContainer);
  taskList.appendChild(li);
}


function drivingAction(li, actionBtn) { // Maneja la lógica de los botones multifuncionales
  const statusCurrent = li.querySelector('span').textContent.replace('Estado: ', '');
  switch (statusCurrent) {
    case 'Creada':
      li.querySelector('span').textContent = 'Estado: En Proceso';
      updateButton(actionBtn, 'En Proceso');
      li.querySelector('.editBtn').style.display = 'block';
      li.querySelector('.deleteBtn').style.display = 'block';
      li.classList.remove('terminada');
      break;
    case 'En Proceso':
      li.querySelector('span').textContent = 'Estado: Terminada';
      updateButton(actionBtn, 'Terminada');
      li.querySelector('.editBtn').style.display = 'none';
      li.querySelector('.deleteBtn').style.display = 'none';
      li.classList.add('terminada');
      break;
    case 'Terminada':
      li.querySelector('span').textContent = 'Estado: En Proceso';
      updateButton(actionBtn, 'En Proceso');
      li.querySelector('.editBtn').style.display = 'block';
      li.querySelector('.deleteBtn').style.display = 'block';
      li.classList.remove('terminada');
      break;
  }
  saveTasks();
}


function editTask(li) { // Función para editar una tarea
  const title = li.querySelector('strong').textContent;
  const description = li.querySelector('p').textContent;
  const newTitle = prompt('Editar título:', title);
  const newDescription = prompt('Editar descripción:', description);
  if (newTitle !== null && newDescription !== null) {
    li.querySelector('strong').textContent = newTitle;
    li.querySelector('p').textContent = newDescription;
    li.querySelector('span').textContent = 'Estado: En Proceso';
    saveTasks();
  }
}


function updateButton(boton, estado) { // Actualiza el texto del botón según el estado
  switch (estado) {
    case 'Creada':
      boton.textContent = 'Avanzar';
      break;
    case 'En Proceso':
      boton.textContent = 'Terminar';
      break;
    case 'Terminada':
      boton.textContent = 'Revertir';
      break;
  }
}


function saveTasks() { // Guarda las tareas en localStorage
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    tasks.push({
      title: li.querySelector('strong').textContent,
      description: li.querySelector('p').textContent,
      status: li.querySelector('span').textContent.replace('Estado: ', ''),
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


function loadTasks() { // Carga las tareas desde localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    createTask(task.title, task.description, task.status);
  });
}
