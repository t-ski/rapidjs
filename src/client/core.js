var rapidJS = {};
rapidJS.core = (_ => {
	const performRequest = (method, pathname, body) => {
		return fetch(pathname, {
			method: method,
			mode: "same-origin",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json"
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify(body)
		});
	};

	const PUBLIC = {};

	/**
	 * Perform request ro plug-in related endpoint (id set up).
	 * @param {String} pluginName Internal name of plug-in to be addressed
	 * @param {Object} [body] Body object to send along being passed to the endpoint callback
	 * @param {String} [name] Endpoint name if given
	 * @param {Function} [progressHandler] Callback repeatedly getting passed the current loading progress [0, 1]
	 * @returns {Promise} Request promise eventualy resolving to response message
	 */
	PUBLIC.endpoint = (pluginName, body, progressHandler, name) => {
		const pathname = `/${pluginName}`;
		
		return new Promise((resolve, reject) => {
			performRequest("POST", pathname, {
				meta: {
					pathname: document.location.pathname
				},
				body: body,
				name: name || null
			}).then(async res => {
				// Explicitly download body to handle progress
				const contentLength = res.headers.get("Content-Length");
				let receivedLength = 0;

				const reader = res.body.getReader();
				let chunks = [];
				let curChunk;
				while((curChunk = await reader.read()) && !curChunk.done) {
					applyProgressHandler(receivedLength / contentLength);

					receivedLength += curChunk.value.length;
					chunks.push(curChunk.value);
				}
				applyProgressHandler(1);
				
				let chunksAll = new Uint8Array(receivedLength);
				let position = 0;
				for(let chunk of chunks) {
					chunksAll.set(chunk, position);
					position += chunk.length;
				}
				
				let message = new TextDecoder("utf-8").decode(chunksAll);
				try {
					message = JSON.parse(message);
				} catch(_) {
					message = String(message);
				}
				
				((res.status - 200) < 99) ? resolve(message) : reject(message);
			}).catch(err => {
				reject(new Error(`Could not connect to endpoint: ${err.message || err}`));
			});
		});

		function applyProgressHandler(progress) {
			progressHandler && progressHandler(progress);
		}
	};

	/**
	 * Redirect to the next related client error page (if deployed, to receive generic response otherwise).
	 * @param {Number} status Client error status code (4**)
	 */
	/* PUBLIC.redirectStatus = status => {
		if(!((status % 400) < 99)) {
			throw new RangeError(`Given status code ${status} not located within the client error value range (4**)`);
		}
		
		const basePath = (document.head.querySelector("base") || {}).href || String(document.location);
		document.location = basePath.replace(/\/[^/]*$/i, `/${String(status)}`);
	}; */

	return PUBLIC;
})();