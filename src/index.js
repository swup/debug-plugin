import Plugin from '@swup/plugin';

export default class SwupDebugPlugin extends Plugin {
	name = 'SwupDebugPlugin';

	defaults = {
		globalInstance: false
	};

	constructor(options = {}) {
		super();

		this.options = { ...this.defaults, ...options };
	}

	mount() {
		const swup = this.swup;

		// set non-empty log method of swup
		swup.log = this.log;

		// set swup instance as a global variable swup
		if (this.options.globalInstance) {
			window.swup = swup;
		}

		// check if title tag is present
		if (!document.getElementsByTagName('title').length) {
			const error = "This page doesn't have a title tag. It is required on every page.";
			console.warn(`DEBUG PLUGIN: ${error}`);
		}

		// make events appear in console
		swup._triggerEvent = swup.triggerEvent;
		swup.triggerEvent = this.triggerEvent;

		// detect relative links not starting with / or #
		const potentiallyWrongLinksSelector =
			'a[href]:not([href^="' +
			window.location.origin +
			'"]):not([href^="/"]):not([href^="http"]):not([href^="/"]):not([href^="?"]):not([href^="#"])';

		swup.on('pageView', () => {
			if (document.querySelectorAll(potentiallyWrongLinksSelector).length) {
				const error =
					'It seems there are some links with a href attribute not starting with "#", "/" or current domain, which is potentially a problem.';
				console.warn(
					`DEBUG PLUGIN: ${error}`,
					document.querySelectorAll(potentiallyWrongLinksSelector)
				);
			}
			if (document.querySelectorAll(potentiallyWrongLinksSelector).length) {
				const error =
					'It seems there are some links with a href attribute not starting with "#", "/" or current domain, which is potentially a problem.';
				console.warn(
					`DEBUG PLUGIN: ${error}`,
					document.querySelectorAll(potentiallyWrongLinksSelector)
				);
			}
		});
	}

	unmount() {
		this.swup.log = () => {};
		this.swup.triggerEvent = this.swup._triggerEvent;
		if (this.options.globalInstance) {
			window.swup = null;
		}
	}

	triggerEvent = (eventName, originalEvent) => {
		if (originalEvent) {
			console.groupCollapsed(
				'%cswup:' + '%c' + eventName,
				'color: #343434',
				'color: #009ACD'
			);
			console.log(originalEvent);
			console.groupEnd();
		} else {
			console.log('%cswup:' + '%c' + eventName, 'color: #343434', 'color: #009ACD');
		}

		this.swup._triggerEvent(eventName, originalEvent);
	};

	log = (str, object) => {
		if (object) {
			console.groupCollapsed(str);
			for (let key in object) {
				console.log(object[key]);
			}
			console.groupEnd();
		} else {
			console.log(str + '%c', 'color: #009ACD');
		}
	};

	debugLog = (log, type) => {
		if (type === 'error') {
			console.error(`DEBUG PLUGIN: ${log}`);
		} else {
			console.warn(`DEBUG PLUGIN: ${log}`);
		}
	};
}
