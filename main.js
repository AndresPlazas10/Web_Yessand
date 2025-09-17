// Modal dinámico
function showModal(ip, prefix) {
	let modal = document.getElementById('calc-ip-modal');
	if (!modal) {
		modal = document.createElement('div');
		modal.id = 'calc-ip-modal';
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
		// Encabezados
		tableRows += `<tr><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Item</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Decimal</th></tr>`;
		// Cálculos
		const results = calcularIPv4(ip, parseInt(prefix));
		const items = [
			'DirecciónIPv4',
			'Máscara de red',
			'Máscara wildcard',
			'Dirección de red',
			'Dirección de host',
			'Dirección del primer host',
			'Dirección del ultimo host',
			'Dirección de difusión',
			'Número de direcciones asignables',
			'Tipo de dirección IP4'
		];
		for(let i=0; i<items.length; i++) {
			tableRows += `<tr><td style='border:1px solid #fff; padding:14px 8px;'>${items[i]}</td><td style='border:1px solid #fff; padding:14px 8px;'>${results[items[i]] ?? ''}</td></tr>`;
		}
// Función principal de cálculo IPv4
function calcularIPv4(ip, prefix) {
	// Utilidades
	function ipToInt(ip) {
		return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
	}
	function intToIp(int) {
		return [24,16,8,0].map(shift => (int >>> shift) & 255).join('.');
	}
	function maskFromPrefix(prefix) {
		return prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1)) >>> 0;
	}
	function wildcardFromMask(mask) {
		return (~mask) >>> 0;
	}
	// Cálculos
	const ipInt = ipToInt(ip);
	const maskInt = maskFromPrefix(prefix);
	const wildcardInt = wildcardFromMask(maskInt);
	const networkInt = ipInt & maskInt;
	const broadcastInt = networkInt | wildcardInt;
	const numHosts = prefix === 32 ? 1 : (prefix === 31 ? 2 : Math.max(0, (1 << (32 - prefix)) - 2));
	const firstHostInt = numHosts > 0 ? networkInt + 1 : networkInt;
	const lastHostInt = numHosts > 0 ? broadcastInt - 1 : broadcastInt;
	// Tipo de dirección
	let tipo = '';
	const firstOctet = parseInt(ip.split('.')[0], 10);
	if (firstOctet >= 1 && firstOctet <= 126) tipo = 'Clase A';
	else if (firstOctet >= 128 && firstOctet <= 191) tipo = 'Clase B';
	else if (firstOctet >= 192 && firstOctet <= 223) tipo = 'Clase C';
	else if (firstOctet >= 224 && firstOctet <= 239) tipo = 'Multicast';
	else tipo = 'Desconocida';
	// Resultado
	return {
		'DirecciónIPv4': ip,
		'Máscara de red': intToIp(maskInt),
		'Máscara wildcard': intToIp(wildcardInt),
		'Dirección de red': intToIp(networkInt),
		'Dirección de host': intToIp(ipInt),
		'Dirección del primer host': numHosts > 0 ? intToIp(firstHostInt) : '-',
		'Dirección del ultimo host': numHosts > 0 ? intToIp(lastHostInt) : '-',
		'Dirección de difusión': intToIp(broadcastInt),
		'Número de direcciones asignables': numHosts,
		'Tipo de dirección IP4': tipo
	};
}
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
			</style>
			<div style="background: #111; color: #fff; padding: 32px 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); font-family: 'Oswald', Arial, sans-serif; text-align: center; min-width: 480px; max-width: 98vw;">
				<div style="margin-bottom: 24px; font-size: 1.3rem;">Resultados</div>
				<table class="calc-ip-modal-table tabla-animada" id="tabla-ip-animada" style='width:96%; border-collapse:collapse; margin-bottom:24px; border:2px solid #fff; table-layout:fixed;'>
					<tbody>
						${tableRows}
					</tbody>
				</table>
				<button id="close-modal-btn" style="background: #00aaff; color: #fff; border: none; padding: 10px 28px; font-size: 1.1rem; border-radius: 6px; cursor: pointer; font-family: 'Oswald', Arial, sans-serif;">Cerrar</button>
			</div>
		`;
		setTimeout(() => {
			const tabla = document.getElementById('tabla-ip-animada');
			if (tabla) tabla.classList.add('visible');
		}, 50);
		document.body.appendChild(modal);
		document.getElementById('close-modal-btn').onclick = function() {
			modal.remove();
		};
	}
}
document.addEventListener('DOMContentLoaded', function() {
	const form = document.querySelector('.calc-ip-form');
	const ipInput = document.getElementById('ip');
	// Crear o buscar el contenedor de error
	let errorMsg = document.getElementById('ip-error');
	if (!errorMsg) {
		errorMsg = document.createElement('div');
		errorMsg.id = 'ip-error';
		errorMsg.style.color = '#ff4444';
		errorMsg.style.fontFamily = 'Oswald, Arial, sans-serif';
		errorMsg.style.fontSize = '1rem';
		errorMsg.style.marginBottom = '12px';
		ipInput.parentNode.appendChild(errorMsg);
	}


	form.addEventListener('submit', function(e) {
		errorMsg.textContent = '';
		const ip = ipInput.value.trim();
		const prefixInput = document.getElementById('prefix');
		if (!isValidIPv4(ip)) {
			errorMsg.textContent = 'Por favor ingresa una dirección IPv4 válida.';
			e.preventDefault();
			return false;
		}
		// Validación extra: dirección de red válida (no multicast, no reservada)
		const firstOctet = parseInt(ip.split('.')[0], 10);
		if (firstOctet < 1 || firstOctet > 223 || (firstOctet >= 224 && firstOctet <= 239)) {
			errorMsg.textContent = 'La dirección ingresada no es una dirección de red válida.';
			e.preventDefault();
			return false;
		}
		// Si el prefijo está vacío, lo asigna automáticamente
		if (!prefixInput.value) {
			prefixInput.value = getDefaultPrefix(ip);
		}
		// Mostrar modal
		e.preventDefault();
		showModal(ip, prefixInput.value);
	});

	ipInput.addEventListener('input', function() {
		const ip = ipInput.value.trim();
		const prefixInput = document.getElementById('prefix');
		let error = '';
		if (!isValidIPv4(ip)) {
			error = 'Por favor ingresa una dirección IPv4 válida.';
			prefixInput.value = '';
		} else {
			// Validación extra: dirección de red válida (no multicast, no reservada)
			const firstOctet = parseInt(ip.split('.')[0], 10);
			if (firstOctet < 1 || firstOctet > 223 || (firstOctet >= 224 && firstOctet <= 239)) {
				error = 'La dirección ingresada no es una dirección de red válida.';
				prefixInput.value = '';
			} else {
				prefixInput.value = getDefaultPrefix(ip);
			}
		}
		errorMsg.textContent = error;
	});

	function getDefaultPrefix(ip) {
		// Obtiene el primer octeto
		const firstOctet = parseInt(ip.split('.')[0], 10);
		if (firstOctet >= 1 && firstOctet <= 126) return 8; // Clase A
		if (firstOctet >= 128 && firstOctet <= 191) return 16; // Clase B
		if (firstOctet >= 192 && firstOctet <= 223) return 24; // Clase C
		return 24; // Por defecto
	}

	function isValidIPv4(ip) {
		// Expresión regular para IPv4
		const regex = /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/;
		return regex.test(ip);
	}
});
