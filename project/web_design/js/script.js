<script>
function enviarWhatsApp() {
    const telefono = "50377563510";
    var mensaje = "Hola, vi tu portafolio y quiero comunicarme contigo.";
    window.open("https://api.whatsapp.com/send?phone=" + telefono + "&text=" + encodeURIComponent(mensaje), "_blank");
    return false; 
}
</script>