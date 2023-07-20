import Plugin from '@swup/plugin';

export default class SwupDebugPlugin extends Plugin {
	name = 'SwupDebugPlugin';

	requires = { swup: '>=4' };

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
		this.originalSwupLog = swup.log;
		swup.log = this.log;

		// set swup instance as a global variable swup
		if (this.options.globalInstance) {
			window.swup = swup;
		}

		// check if title tag is present
		if (!document.getElementsByTagName('title').length) {
			this.warn(`This page doesn't have a title tag. It is required on every page.`)
		}

		// make hook calls appear in console
		this.originalSwupHookCall = swup.hooks.call.bind(swup.hooks);
		this.originalSwupHookCallSync = swup.hooks.callSync.bind(swup.hooks);
		swup.hooks.call = this.callHook.bind(this);
		swup.hooks.callSync = this.callHookSync.bind(this);
	}

	unmount() {
		super.unmount();

		this.swup.log = this.originalSwupLog;
		this.swup.hooks.call = this.originalSwupHookCall;
		this.swup.hooks.callSync = this.originalSwupHookCallSync;
		if (this.options.globalInstance) {
			window.swup = null;
		}
	}

	logHook(hook, data) {
		console.groupCollapsed(
			'%cswup:' + '%c' + hook,
			'color: #343434',
			'color: #009ACD'
		);
		console.log(data);
		console.groupEnd();
	}

	callHook(hook, data, ...args) {
		this.logHook(hook, data);
		return this.originalSwupHookCall(hook, data, ...args);
	}

	callHookSync(hook, data, ...args) {
		this.logHook(hook, data);
		return this.originalSwupHookCallSync(hook, data, ...args);
	}

	log(str, object) {
		if (object) {
			console.groupCollapsed(str);
			for (let key in object) {
				console.log(object[key]);
			}
			console.groupEnd();
		} else {
			console.log(str + '%c', 'color: #009ACD');
		}
	}

	warn(str) {
		console.warn(`[swup debug plugin] ${str}`);
	}

	error(str) {
		console.error(`[swup debug plugin] ${str}`);
	}
}
