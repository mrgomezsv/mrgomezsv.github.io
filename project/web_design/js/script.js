document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.navbar-button');

    function toggleDarkLightMode() {// Función para cambiar el modo y almacenar el estado
        // Cambiar el modo
        document.body.classList.toggle('light-mode');
        document.querySelector('header').classList.toggle('light-mode');
        document.querySelectorAll('.menu-options a').forEach(function(link) {
            link.classList.toggle('light-mode');
        });
        document.querySelectorAll('.menu-options li').forEach(function(li) {
            li.classList.toggle('light-mode');
        });
        document.querySelector('.navbar-button').classList.toggle('light-mode');

        // Cambiar el texto del botón
        if (button.textContent === 'Black') {
            button.textContent = 'White';
        } else {
            button.textContent = 'Black';
        }

        localStorage.setItem('darkModeEnabled', document.body.classList.contains('light-mode')); // Almacenar el estado en localStorage
    }

    if (localStorage.getItem('darkModeEnabled') === 'true') { // Restaurar el estado almacenado al cargar la página
        toggleDarkLightMode();
    }

    button.addEventListener('click', toggleDarkLightMode); // Agregar un evento de clic al botón
});