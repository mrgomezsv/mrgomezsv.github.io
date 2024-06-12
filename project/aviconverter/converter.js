function convertAVIToMP4() {
    const aviFileInput = document.getElementById('aviFileInput');
    const aviFile = aviFileInput.files[0];

    if (!aviFile) {
        alert('Por favor selecciona un archivo AVI.');
        return;
    }

    const formData = new FormData();
    formData.append('avi_file', aviFile);

    fetch('/convert_avi_to_mp4', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('La conversión ha fallado.');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        alert(error.message);
    });
}
