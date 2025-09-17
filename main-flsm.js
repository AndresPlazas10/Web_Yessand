function calcularSubredesFLSM(ip, prefix, numSubredes) {
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
	const baseInt = ipToInt(ip);
	const maskInt = maskFromPrefix(prefix);
	const salto = (1 << (32 - prefix));
	let subredes = [];
	for (let i = 0; i < numSubredes; i++) {
		const netInt = baseInt + (i * salto);
		const broadcastInt = netInt + salto - 1;
		const hostsPorSubred = prefix === 32 ? 1 : (prefix === 31 ? 2 : Math.max(0, salto - 2));
		const firstHostInt = hostsPorSubred > 0 ? netInt + 1 : netInt;
	const lastHostInt = hostsPorSubred > 1 ? broadcastInt - 1 : broadcastInt;
		subredes.push({
			subred: (i + 1).toString(),
			nHosts: hostsPorSubred.toString(),
			ipRed: intToIp(netInt),
			mascara: intToIp(maskInt),
			primerHost: hostsPorSubred > 0 ? intToIp(firstHostInt) : '-',
			ultimoHost: hostsPorSubred > 0 ? intToIp(lastHostInt) : '-',
			broadcast: intToIp(broadcastInt)
		});
	}
	return subredes;
}

function showFlsmModal(ip, prefix, numSubredes) {
	let modal = document.getElementById('flsm-modal');
	if (modal) modal.remove();
	modal = document.createElement('div');
	modal.id = 'flsm-modal';
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

	const subredes = calcularSubredesFLSM(ip, prefix, numSubredes);
	let currentPage = 1;
	const rowsPerPage = 5;
	const totalPages = Math.ceil(subredes.length / rowsPerPage);

	document.body.appendChild(modal);
	function renderTable(page) {
		let tableRows = '';
		currentPage = page;
		tableRows += `<tr><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Subred</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>N hosts</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>IP de red</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Máscara</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Primer host</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Último host</th><th style='font-weight:bold; border:2px solid #fff; padding:14px 8px; background:#222;'>Broadcast</th></tr>`;
		const start = (page - 1) * rowsPerPage;
		const end = Math.min(start + rowsPerPage, subredes.length);
		for (let i = start; i < end; i++) {
			const s = subredes[i];
			tableRows += `<tr>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.subred}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.nHosts}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.ipRed}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.mascara}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.primerHost}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.ultimoHost}</td>
				<td style='border:1px solid #fff; padding:14px 8px;'>${s.broadcast}</td>
			</tr>`;
		}
		let paginacion = '';
		if (totalPages > 1) {
			paginacion += `<div style='margin:12px 0;'>`;
			if (page > 1) {
				paginacion += `<button id='prev-flsm-page' style='margin-right:8px; background:#00aaff; color:#fff; border:none; padding:6px 18px; border-radius:6px; cursor:pointer;'>Anterior</button>`;
			}
			paginacion += `<span style='font-size:1.1rem;'>Página ${page} de ${totalPages}</span>`;
			if (page < totalPages) {
				paginacion += `<button id='next-flsm-page' style='margin-left:8px; background:#00aaff; color:#fff; border:none; padding:6px 18px; border-radius:6px; cursor:pointer;'>Siguiente</button>`;
			}
			paginacion += `</div>`;
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
			.flsm-modal-table th, .flsm-modal-table td {
				color: #fff !important;
			}
			</style>
			<div style="background: #111; color: #fff; padding: 32px 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); font-family: 'Oswald', Arial, sans-serif; text-align: center; min-width: 480px; max-width: 98vw;">
				<div style="margin-bottom: 24px; font-size: 1.3rem; color: #fff;">Subredes FLSM</div>
				<table class="flsm-modal-table tabla-animada" id="tabla-flsm-animada" style='width:96%; border-collapse:collapse; margin-bottom:24px; border:2px solid #fff; table-layout:fixed;'>
					<tbody>
						${tableRows}
					</tbody>
				</table>
				${paginacion}
				<button id="close-flsm-modal-btn" style="background: #00aaff; color: #fff; border: none; padding: 10px 28px; font-size: 1.1rem; border-radius: 6px; cursor: pointer; font-family: 'Oswald', Arial, sans-serif;">Cerrar</button>
			</div>
		`;
		setTimeout(() => {
			const tabla = document.getElementById('tabla-flsm-animada');
			if (tabla) tabla.classList.add('visible');
		}, 50);
		document.getElementById('close-flsm-modal-btn').onclick = function() {
			modal.remove();
		};
		if (totalPages > 1) {
			const prevBtn = document.getElementById('prev-flsm-page');
			const nextBtn = document.getElementById('next-flsm-page');
			if (prevBtn) {
				prevBtn.onclick = function() {
					renderTable(page - 1);
				};
			}
			if (nextBtn) {
				nextBtn.onclick = function() {
					renderTable(page + 1);
				};
			}
		}
	}
	renderTable(currentPage);
}
document.addEventListener('DOMContentLoaded', function() {
	const form = document.querySelector('.calc-ip-form');
	const ipInput = document.getElementById('ip');
	const prefixInput = document.getElementById('prefix');
	const numSubredesInput = document.getElementById('subnets');
	const hostsInput = document.getElementById('hosts');
	let errorMsg = document.getElementById('ip-error');

	// Actualiza hosts por subred automáticamente
	function calcularHostsPorSubred(ip, prefix, numSubredes) {
		if (!ip || !prefix || !numSubredes) return '';
		prefix = parseInt(prefix);
		numSubredes = parseInt(numSubredes);
		if (numSubredes < 1) return '';
		// Calcular el nuevo prefijo de subred
		const bitsSubred = Math.ceil(Math.log2(numSubredes));
		const nuevoPrefijo = prefix + bitsSubred;
		if (nuevoPrefijo > 32) return '';
		// Hosts por subred según el nuevo prefijo
		const hostsPorSubred = nuevoPrefijo === 32 ? 1 : (nuevoPrefijo === 31 ? 2 : Math.max(0, (1 << (32 - nuevoPrefijo)) - 2));
		return hostsPorSubred > 0 ? hostsPorSubred : '';
	}

	function actualizarHosts() {
		const ip = ipInput.value.trim();
		const prefix = prefixInput.value.trim();
		const numSubredes = numSubredesInput.value.trim();
		hostsInput.value = calcularHostsPorSubred(ip, prefix, numSubredes);
	}

	ipInput.addEventListener('input', actualizarHosts);
	prefixInput.addEventListener('input', actualizarHosts);
	numSubredesInput.addEventListener('input', actualizarHosts);
	if (!errorMsg) {
		errorMsg = document.createElement('div');
		errorMsg.id = 'ip-error';
		errorMsg.style.color = '#ff4444';
		errorMsg.style.fontFamily = 'Oswald, Arial, sans-serif';
		errorMsg.style.fontSize = '1rem';
		errorMsg.style.marginBottom = '12px';
		ipInput.parentNode.appendChild(errorMsg);
	}

	ipInput.addEventListener('input', function() {
		const ip = ipInput.value.trim();
		if (isValidIPv4(ip)) {
			prefixInput.value = getDefaultPrefix(ip);
			errorMsg.textContent = '';
		} else {
			prefixInput.value = '';
			errorMsg.textContent = 'Dirección de red inválida.';
		}
	});

	form.addEventListener('submit', function(e) {
		errorMsg.textContent = '';
		const ip = ipInput.value.trim();
		const prefix = prefixInput.value.trim();
		const numSubredes = numSubredesInput ? numSubredesInput.value.trim() : '1';
		if (!isValidIPv4(ip)) {
			errorMsg.textContent = 'Por favor ingresa una dirección de red válida.';
			e.preventDefault();
			return false;
		}
		e.preventDefault();
		showFlsmModal(ip, prefix, numSubredes);
	});

	function getDefaultPrefix(ip) {
		const firstOctet = parseInt(ip.split('.')[0], 10);
		if (firstOctet >= 1 && firstOctet <= 126) return 8;
		if (firstOctet >= 128 && firstOctet <= 191) return 16;
		if (firstOctet >= 192 && firstOctet <= 223) return 24;
		return 24;
	}
	function isValidIPv4(ip) {
		const regex = /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/;
		return regex.test(ip);
	}
});
document.addEventListener('DOMContentLoaded', function() {
	const ipInput = document.getElementById('ip');
	const prefixInput = document.getElementById('prefix');
	ipInput.addEventListener('input', function() {
		const ip = ipInput.value.trim();
		if (isValidIPv4(ip)) {
			prefixInput.value = getDefaultPrefix(ip);
		} else {
			prefixInput.value = '';
		}
	});
	function getDefaultPrefix(ip) {
		const firstOctet = parseInt(ip.split('.')[0], 10);
		if (firstOctet >= 1 && firstOctet <= 126) return 8;
		if (firstOctet >= 128 && firstOctet <= 191) return 16;
		if (firstOctet >= 192 && firstOctet <= 223) return 24;
		return 24;
	}
	function isValidIPv4(ip) {
		const regex = /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/;
		return regex.test(ip);
	}
});
// Modal dinámico para FLSM
// Aquí irá la lógica para calcular las subredes FLSM y llamar a showFlsmModal(subnetsData)
