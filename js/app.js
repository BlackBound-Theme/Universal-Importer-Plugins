/**
 * Universal Product Importer Pro - Live Demo Script
 */

document.addEventListener('DOMContentLoaded', () => {

	// Elements
	const delayInput = document.getElementById('uapi_delay');
	const statDelay  = document.getElementById('stat-delay');
	
	const previewUrlBtn = document.getElementById('uapi-preview-btn');
	const previewUrlInp = document.getElementById('uapi-preview-url');
	const previewResult = document.getElementById('uapi-preview-result');

	const bulkUrlsInp   = document.getElementById('uapi-import-urls');
	const urlCountEl    = document.getElementById('uapi-url-count');
	const startBtn      = document.getElementById('uapi-start-import');

	const progressWrap  = document.getElementById('uapi-progress-wrapper');
	const progressFill  = document.getElementById('uapi-progress-fill');
	const consoleEl     = document.getElementById('uapi-console');
	const countCurrent  = document.getElementById('uapi-count-current');
	const countTotal    = document.getElementById('uapi-count-total');

	const statTotal     = document.getElementById('stat-total');
	const statSuccess   = document.getElementById('stat-success');
	const statFailed    = document.getElementById('stat-failed');

	let stateTotal   = 0;
	let stateSuccess = 0;
	let stateFailed  = 0;

	// Update delay stat when input changes
	delayInput.addEventListener('input', (e) => {
		statDelay.textContent = e.target.value || 5;
	});

	// URL Counting Logic
	bulkUrlsInp.addEventListener('input', () => {
		const lines = bulkUrlsInp.value.split('\n').filter(line => line.trim().length > 0);
		urlCountEl.textContent = lines.length;
		if (lines.length > 100) {
			urlCountEl.style.color = 'var(--uapi-danger)';
		} else {
			urlCountEl.style.color = '';
		}
	});

	// Toast System
	const showToast = (message, type) => {
		type = type || 'success';
		const toast = document.getElementById('uapi-toast');
		let icon = 'yes';
		if (type === 'error') icon = 'no';
		if (type === 'warning') icon = 'warning';

		toast.innerHTML = '<span class="dashicons dashicons-' + icon + '"></span> ' + message;
		toast.className = '';
		toast.classList.add('--' + type);
		toast.classList.add('--visible');

		setTimeout(() => {
			toast.classList.remove('--visible');
		}, 3500);
	};

	// Console System
	const logToConsole = (msg, type) => {
		type = type || 'info';
		const time = new Date().toLocaleTimeString('en-US', { hour12: false });
		const line = document.createElement('div');
		line.className = 'log-line';
		line.innerHTML = '<span class="log-time">[' + time + ']</span> <span class="log-' + type + '">' + msg + '</span>';
		consoleEl.appendChild(line);
		consoleEl.scrollTop = consoleEl.scrollHeight;
	};

	// Mock Preview
	previewUrlBtn.addEventListener('click', () => {
		const url = previewUrlInp.value.trim();
		if (!url) {
			showToast('Please enter a valid URL to preview.', 'error');
			return;
		}

		previewUrlBtn.disabled = true;
		previewUrlBtn.innerHTML = '<span class="uapi-spinner"></span> Previewing...';
		previewResult.style.display = 'none';

		// Simulate AJAX delay
		setTimeout(() => {
			
			// Dynamic Mock Products Array for images
			const mockImages = [
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
				"https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&q=80",
				"https://images.unsplash.com/photo-1505843490538-5133c6c7d0d1?w=500&q=80",
				"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
			];
			const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
			
			let domainName = url;
			let generatedTitle = "Extracted Product Name";
			
			try { 
				let parseUrl = url;
				if (!parseUrl.startsWith('http')) {
					parseUrl = 'https://' + parseUrl;
				}
				let urlObj = new URL(parseUrl);
				domainName = urlObj.hostname; 
				
				// Try to extract a readable title from the URL path
				let pathParts = urlObj.pathname.split('/').filter(p => p.length > 5);
				if (pathParts.length > 0) {
					// Take the longest path part assuming it's the slug
					let slug = pathParts.reduce((a, b) => a.length > b.length ? a : b);
					generatedTitle = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
					if(generatedTitle.length > 50) generatedTitle = generatedTitle.substring(0, 50) + "...";
				}
			} catch(e) {}

			previewResult.innerHTML = 
				'<div class="uapi-preview-card">' +
					'<div class="uapi-preview-img">' +
						'<img src="' + randomImg + '" alt="Preview Image" />' +
					'</div>' +
					'<div class="uapi-preview-info">' +
						'<h3>' + generatedTitle + '</h3>' +
						'<p>Experience crystal-clear quality and premium build with this imported item directly extracted from the source.</p>' +
						'<div class="uapi-preview-prices">' +
							'<span class="uapi-price-main">$49.99</span>' +
							'<span class="uapi-price-old">$79.99</span>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="uapi-preview-foot">' +
					'<span class="dashicons dashicons-yes-alt" style="color: var(--uapi-success);"></span>' +
					'<span class="uapi-preview-foot-msg">Demo limit: Extracted name from URL text on ' + domainName + '</span>' +
				'</div>';

			previewResult.style.display = 'block';
			
			previewUrlBtn.disabled = false;
			previewUrlBtn.innerHTML = '<span class="dashicons dashicons-search"></span> Preview URL';
		}, 1200);
	});

	// Mock Bulk Import
	startBtn.addEventListener('click', () => {
		let urls = bulkUrlsInp.value.split('\n')
				.map(u => u.trim())
				.filter(u => u.length > 0);

		if (urls.length === 0) {
			showToast('Please enter at least one URL.', 'error');
			return;
		}
		if (urls.length > 100) {
			showToast('Maximum 100 URLs permitted per batch.', 'error');
			return;
		}

		// UI Lock
		startBtn.disabled = true;
		startBtn.innerHTML = '<span class="uapi-spinner"></span> Importing...';
		bulkUrlsInp.disabled = true;
		
		progressWrap.style.display = 'block';
		consoleEl.innerHTML = '';
		logToConsole('Starting bulk import engine...', 'info');
		logToConsole('Queue loaded with ' + urls.length + ' URLs.', 'info');

		countTotal.textContent = urls.length;
		countCurrent.textContent = '0';
		progressFill.style.width = '0%';

		const delayMs = parseInt(delayInput.value || 5, 10) * 1000;
		let currentIndex = 0;

		const processNext = () => {
			if (currentIndex >= urls.length) {
				// Finish
				startBtn.disabled = false;
				startBtn.innerHTML = '<span class="dashicons dashicons-controls-play"></span> Start Bulk Import';
				bulkUrlsInp.disabled = false;
				bulkUrlsInp.value = '';
				urlCountEl.textContent = '0';
				
				logToConsole('Batch processing completed successfully.', 'success');
				showToast('Bulk import completed.', 'success');
				return;
			}

			const url = urls[currentIndex];
			logToConsole('Scraping: ' + url, 'info');

			setTimeout(() => {
				// Random success/failure for demo
				const isSuccess = Math.random() > 0.1;
				
				if (isSuccess) {
					logToConsole('Imported successfully: Product #' + Math.floor(Math.random() * 10000), 'success');
					stateTotal++;
					stateSuccess++;
				} else {
					logToConsole('Failed: Could not extract pricing data from URL.', 'error');
					stateTotal++;
					stateFailed++;
				}

				statTotal.textContent = stateTotal.toLocaleString();
				statSuccess.textContent = stateSuccess.toLocaleString();
				statFailed.textContent = stateFailed.toLocaleString();

				currentIndex++;
				countCurrent.textContent = currentIndex;
				progressFill.style.width = ((currentIndex / urls.length) * 100) + '%';

				if (currentIndex < urls.length) {
					logToConsole('Waiting ' + (delayMs/1000) + 's to prevent IP ban...', 'warning');
					setTimeout(processNext, delayMs);
				} else {
					processNext();
				}
				
			}, 1500); // 1.5s simulated process time
		};

		processNext();
	});
});
