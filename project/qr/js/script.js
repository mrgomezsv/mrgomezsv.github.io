function generateQRCode() {
    const text = document.getElementById('text').value;
    const qrCodeDiv = document.getElementById('qrcode');
    const downloadBtn = document.getElementById('download-btn');

    // Limpiar el contenido del QR anterior
    qrCodeDiv.innerHTML = '';
    downloadBtn.style.display = 'none'; // Ocultar el botón de descarga inicialmente

    if (text) {
        QRCode.toDataURL(text, { width: 340 }, function (error, url) {
            if (error) {
                console.error(error);
                return;
            }

            // Crear y mostrar la imagen del código QR
            const img = document.createElement('img');
            img.src = url;
            qrCodeDiv.appendChild(img);

            // Configurar el enlace de descarga y mostrar el botón
            downloadBtn.href = url;
            downloadBtn.style.display = 'inline-block'; // Mostrar el botón solo si el QR se genera correctamente
            console.log('Código QR generado con éxito!');
        });
    } else {
        alert('Please enter a valid text or link.');
    }
}

// Ocultar el botón de descarga al cargar la página
window.onload = function() {
    document.getElementById('download-btn').style.display = 'none';
};


function clearQRCode() {
    document.getElementById("text").value = ""; // Limpiar el campo de texto
    document.getElementById("qrcode").innerHTML = ""; // Limpiar el área del QR
    document.getElementById("download-btn").style.display = "none"; // Ocultar el botón de descarga
}