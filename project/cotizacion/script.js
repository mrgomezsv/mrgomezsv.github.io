// Utilidades para formato de moneda
function formatCurrency(value) {
    return "$ " + Number(value).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Inicializar con una fila
document.addEventListener("DOMContentLoaded", () => {
    const fechaInput = document.getElementById("fecha");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    fechaInput.value = `${year}-${month}-${day}`;
    fechaInput.dispatchEvent(new Event('input'));
    addItemRow();
    updatePreview();
});

document.getElementById("add-item").addEventListener("click", addItemRow);
document.getElementById("cotizacion-form").addEventListener("input", updatePreview);

function addItemRow() {
    const tbody = document.getElementById("items-body");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><textarea class="desc" rows="2" style="width: 98%"></textarea></td>
        <td><input type="number" class="qty" min="1" value="1" style="width: 60px"></td>
        <td><input type="number" class="unit" min="0" step="0.01" value="0" style="width: 90px"></td>
        <td class="total">$ 0.00</td>
        <td><button type="button" class="remove-item">X</button></td>
    `;
    tbody.appendChild(row);

    row.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", () => {
            updateRowTotal(row);
            updatePreview();
        });
    });

    row.querySelector(".remove-item").addEventListener("click", () => {
        row.remove();
        updatePreview();
    });

    updateRowTotal(row);
    updatePreview();
}

function updateRowTotal(row) {
    const qty = Number(row.querySelector(".qty").value) || 0;
    const unit = Number(row.querySelector(".unit").value) || 0;
    const total = qty * unit;
    row.querySelector(".total").textContent = formatCurrency(total);
}

function getItems() {
    const rows = document.querySelectorAll("#items-body tr");
    let items = [];
    rows.forEach(row => {
        const desc = row.querySelector(".desc").value;
        const qty = Number(row.querySelector(".qty").value) || 0;
        const unit = Number(row.querySelector(".unit").value) || 0;
        const total = qty * unit;
        if (desc.trim() !== "" && qty > 0 && unit >= 0) {
            items.push({desc, qty, unit, total});
        }
    });
    return items;
}

function updatePreview() {
    // Datos generales
    const empresa = document.getElementById("empresa").value;
    const cliente = document.getElementById("cliente").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    
    // Manejo mejorado de la fecha
    const fechaInput = document.getElementById("fecha").value;
    const fecha = fechaInput ? new Date(fechaInput + 'T00:00:00').toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }) : "";

    // Items
    const items = getItems();

    // Sumas
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const iva = subTotal * 0.13;
    const total = subTotal + iva;

    // Pago
    const cheque = document.getElementById("cheque").value;
    const nit = document.getElementById("nit").value;
    const pago = document.getElementById("pago").value;

    // Renderizar
    document.getElementById("cotizacion-preview").innerHTML = `
        
        <div class="cotizacion-header">
            <div class="info">
                <strong>Nombre Empresa</strong><br>${empresa}<br>
                <strong>Cliente</strong><br>${cliente}<br>
                <strong>Dirección</strong><br>${direccion}<br>
                <strong>Teléfono</strong><br>${telefono}<br>
            </div>
            <div class="fecha">
                <span>${fecha}</span>
            </div>
        </div>
        <table class="cotizacion-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.desc.replace(/\n/g, "<br>")}</td>
                        <td>${item.qty}</td>
                        <td>${formatCurrency(item.unit)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <table class="cotizacion-sumas">
            <tr>
                <td style="text-align:right; width:80%"><strong>SUMAS</strong></td>
                <td style="text-align:right">${formatCurrency(subTotal)}</td>
            </tr>
            <tr>
                <td style="text-align:right"><strong>SUB TOTAL</strong></td>
                <td style="text-align:right">${formatCurrency(subTotal)}</td>
            </tr>
            <tr>
                <td style="text-align:right"><strong>IVA</strong></td>
                <td style="text-align:right">${formatCurrency(iva)}</td>
            </tr>
            <tr>
                <td style="text-align:right"><strong>TOTAL</strong></td>
                <td style="text-align:right">${formatCurrency(total)}</td>
            </tr>
        </table>
        <div class="cotizacion-pago">
            Emitir cheque a nombre de: <strong>${cheque}</strong><br>
            NIT: <strong>${nit}</strong><br>
            FORMA DE PAGO: <strong>${pago}</strong>
        </div>
        <div class="cotizacion-firmas">
            <div class="firma">
                NOMBRE Y FIRMA DE ACEPTACIÓN
            </div>
            <div class="firma">
                Licda. Carmen Concepcion Hernandez
            </div>
        </div>
    `;
}

// Descargar PDF
document.getElementById("download-pdf").addEventListener("click", () => {
    const preview = document.getElementById("cotizacion-preview");
    // Forzar tamaño exacto A4 antes de exportar
    preview.style.width = "794px";
    preview.style.height = "1123px";
    preview.style.minHeight = "unset";
    
    // Asegurarnos de que la fecha se actualice antes de generar el PDF
    updatePreview();
    
    const opt = {
        margin: 0,
        filename: 'cotizacion-lumina.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(preview).save();
});
