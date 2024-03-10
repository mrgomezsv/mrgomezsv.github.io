document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar el botón
    const button = document.querySelector('.navbar-button');

    // Función para cambiar entre modos
    function toggleDarkLightMode() {
        // Cambiar el modo de la página
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
    }

    // Agregar un evento de clic al botón
    button.addEventListener('click', toggleDarkLightMode);
});
