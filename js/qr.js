function generateQRCode() {
    const text = document.getElementById('text').value;
    const qrCodeDiv = document.getElementById('qrcode');
    const downloadBtn = document.getElementById('download-btn');

    // Limpiar el contenido del QR anterior
    qrCodeDiv.innerHTML = '';
    downloadBtn.style.display = 'none'; // Ocultar el botón de descarga inicialmente

    if (text) {
        // Generar el código QR utilizando la librería QRCode.js
        const qrCode = new QRCode(qrCodeDiv, {
            text: text,
            width: 340,
            height: 340,
        });

        // Esperar a que el QR se genere para mostrar el enlace de descarga
        setTimeout(function() {
            const qrImage = qrCodeDiv.querySelector('img');
            if (qrImage) {
                downloadBtn.href = qrImage.src;
                downloadBtn.style.display = 'inline-block'; // Mostrar el botón de descarga
                console.log('Código QR generado con éxito!');
            }
        }, 500); // Añadir un pequeño retraso para asegurarse de que la imagen esté lista
    } else {
        alert('Por favor, introduce un texto o enlace válido.');
    }
}

// Ocultar el botón de descarga al cargar la página
window.onload = function() {
    document.getElementById('download-btn').style.display = 'none';
};
