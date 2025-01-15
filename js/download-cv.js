// Mostrar el modal
function showModal() {
    document.getElementById('downloadModal').style.display = 'flex';
}

// Ocultar el modal
function hideModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

// Descargar el CV
function downloadCV(language) {
    let url;
    if (language === 'english') {
        url = './document/CV_Mario_Roberto_EN.pdf';
    } else if (language === 'spanish') {
        url = './document/CV_Mario_Roberto_ES.pdf';
    }

    // Crear un enlace temporal para la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Ocultar el modal después de la descarga
    hideModal();
}
