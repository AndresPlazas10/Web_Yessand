// Archivo JavaScript para la página VLSM
// Puedes agregar aquí la lógica de la calculadora VLSM

// Función para calcular VLSM y generar la tabla de resultados
function calcularVLSM(ip, prefix, hostsArray) {
    // Funciones auxiliares
    function ipToInt(ip) {
        return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
    }
    function intToIp(int) {
        return [24, 16, 8, 0].map(shift => (int >> shift) & 255).join('.');
    }
    function getMaskFromPrefix(prefix) {
        let mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        return intToIp(mask);
    }
    function getPrefixFromHosts(hosts) {
        let bits = 0;
        while ((2 ** bits - 2) < hosts) bits++;
        return 32 - bits;
    }
    // Ordenar hosts de mayor a menor
    hostsArray = hostsArray.map(h => parseInt(h, 10)).filter(h => h > 0).sort((a, b) => b - a);
    let results = [];
    let currentIpInt = ipToInt(ip);
    let baseMaskInt = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    let baseNetworkInt = currentIpInt & baseMaskInt;
    let baseBroadcastInt = baseNetworkInt | (~baseMaskInt >>> 0);
    for (let i = 0; i < hostsArray.length; i++) {
        let hosts = hostsArray[i];
        let subPrefix = getPrefixFromHosts(hosts);
        let mask = getMaskFromPrefix(subPrefix);
        let subnetSize = 2 ** (32 - subPrefix);
        // Validar que la subred cabe en el rango base
        if (currentIpInt + subnetSize - 1 > baseBroadcastInt) {
            results.push({
                subred: i + 1,
                hosts,
                networkIp: 'No cabe',
                mask,
                prefix: subPrefix,
                firstHost: '-',
                lastHost: '-',
                broadcast: '-'
            });
            continue;
        }
        let networkInt = currentIpInt & ((0xFFFFFFFF << (32 - subPrefix)) >>> 0);
        let networkIp = intToIp(networkInt);
        let firstHost = intToIp(networkInt + 1);
        let lastHost = intToIp(networkInt + subnetSize - 2);
        let broadcast = intToIp(networkInt + subnetSize - 1);
        results.push({
            subred: i + 1,
            hosts,
            networkIp,
            mask,
            prefix: subPrefix,
            firstHost,
            lastHost,
            broadcast
        });
        currentIpInt = networkInt + subnetSize;
    }
    return results;
}

// Función para llenar la tabla del modal VLSM
function llenarTablaVLSMModal(resultados) {
    const modal = document.getElementById('modal-vlsm');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.querySelector('.modal-vlsm-content').innerHTML = `
        <span class="modal-vlsm-close" tabindex="0">&times;</span>
        <div style="margin-bottom: 24px; font-size: 1.3rem; color: #fff; text-align:center;">Datos VLSM</div>
        <table class="calc-ip-modal-table tabla-animada visible" id="tabla-ip-animada" style="width:96%; border-collapse:collapse; margin-bottom:24px; border:2px solid #fff; table-layout:fixed;">
            <thead>
                <tr>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Subred</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Hosts</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Prefijo</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">IP de red</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Máscara</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Primer host</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Último host</th>
                    <th style="color:#fff; font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;">Broadcast</th>
                </tr>
            </thead>
            <tbody>
                ${resultados.map(r => `
                    <tr>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.subred}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.hosts}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">/${r.prefix}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.networkIp}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.mask}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.firstHost}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.lastHost}</td>
                        <td style="color:#fff; border:1px solid #fff; padding:14px 8px;">${r.broadcast}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button id="close-vlsm-modal-btn" style="background: #00aaff; color: #fff; border: none; padding: 10px 28px; font-size: 1.1rem; border-radius: 6px; cursor: pointer; font-family: 'Oswald', Arial, sans-serif;">Cerrar</button>
    `;
    // Animación y cierre
    setTimeout(() => {
        const tabla = document.getElementById('tabla-ip-animada');
        if (tabla) tabla.classList.add('visible');
    }, 50);
    const closeBtn = document.getElementById('close-vlsm-modal-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    const closeSpan = modal.querySelector('.modal-vlsm-close');
    if (closeSpan) {
        closeSpan.onclick = function() {
            modal.style.display = 'none';
        };
    }
}

// Función para mostrar el modal de VLSM (nuevo estilo)
function showVlsmModal(resultados) {
    let modal = document.getElementById('vlsm-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'vlsm-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.55)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    let tableRows = '';
    tableRows += `<tr><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Subred</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Número de hosts</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>IP de red</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Máscara</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Primer host</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Último host</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222; color:#fff;'>Broadcast</th></tr>`;
    resultados.forEach(r => {
        tableRows += `<tr>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.subred}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.hosts}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.networkIp}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.mask}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.firstHost}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.lastHost}</td>
            <td style='border:1px solid #fff; padding:14px 8px; color:#fff;'>${r.broadcast}</td>
        </tr>`;
    });
    modal.innerHTML = `
        <style>
        .tabla-animada {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
            transition: opacity 0.6s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.4,0,.2,1);
        }
        .tabla-animada.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .vlsm-modal-table th, .vlsm-modal-table td {
            color: #fff !important;
        }
        .vlsm-modal-content-scroll {
            max-height: 80vh;
            overflow-y: auto;
        }
        </style>
        <div class="vlsm-modal-content-scroll" style="background: #111; color: #fff; padding: 32px 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); font-family: 'Oswald', Arial, sans-serif; text-align: center; min-width: 480px; max-width: 98vw;">
            <div style="margin-bottom: 24px; font-size: 1.3rem; color: #fff;">Subredes VLSM</div>
            <table class="vlsm-modal-table tabla-animada" id="tabla-vlsm-animada" style='width:96%; border-collapse:collapse; margin-bottom:24px; border:2px solid #fff; table-layout:fixed;'>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <button id="close-vlsm-modal-btn" style="background: #00aaff; color: #fff; border: none; padding: 10px 28px; font-size: 1.1rem; border-radius: 6px; cursor: pointer; font-family: 'Oswald', Arial, sans-serif; box-shadow: 0 2px 12px 0 rgba(255,255,255,0.38);">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        const tabla = document.getElementById('tabla-vlsm-animada');
        if (tabla) tabla.classList.add('visible');
    }, 50);
    document.getElementById('close-vlsm-modal-btn').onclick = function() {
        modal.remove();
    };
}

window.calcularVLSM = calcularVLSM;
window.llenarTablaVLSMModal = llenarTablaVLSMModal;
window.showVlsmModal = showVlsmModal;
