function generateQRCode() {
    const text = document.getElementById('text').value;
    const qrCodeDiv = document.getElementById('qrcode');
    const downloadBtn = document.getElementById('download-btn');
    qrCodeDiv.innerHTML = ''; // Limpiar el QR anterior
    downloadBtn.style.display = 'none'; // Ocultar el botón de descarga

    if (text) {
        QRCode.toDataURL(text, { width: 340 }, function (error, url) { // Aumentar el tamaño a 400px
            if (error) {
                console.error(error);
                return;
            }
            const img = document.createElement('img');
            img.src = url;
            qrCodeDiv.appendChild(img);

            // Configurar el botón de descarga
            downloadBtn.href = url;
            downloadBtn.style.display = 'inline-block';
            console.log('Código QR generado con éxito!');
        });
    } else {
        alert('Por favor, introduce un texto o enlace válido.');
    }
}
