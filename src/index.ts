import Plugin from '@swup/plugin';
import type { Swup, HookName, HookArguments } from 'swup';

declare global {
	interface Window {
		swup?: Swup;
	}
}

type Options = {
	globalInstance: boolean;
};

export default class SwupDebugPlugin extends Plugin {
	name = 'SwupDebugPlugin';

	requires = { swup: '>=4' };

	defaults: Options = {
		globalInstance: false
	};
	options: Options;
	originalSwupLog?: Swup['log'];
	originalSwupHookCall?: Swup['hooks']['call'];
	originalSwupHookCallSync?: Swup['hooks']['callSync'];

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
			this.warn(`This page doesn't have a title tag. It is required on every page.`);
		}

		// make hook calls appear in console
		this.originalSwupHookCall = swup.hooks.call.bind(swup.hooks);
		this.originalSwupHookCallSync = swup.hooks.callSync.bind(swup.hooks);
		swup.hooks.call = this.callHook.bind(this);
		swup.hooks.callSync = this.callHookSync.bind(this);
	}

	unmount() {
		super.unmount();

		this.swup.log = this.originalSwupLog!;
		this.swup.hooks.call = this.originalSwupHookCall!;
		this.swup.hooks.callSync = this.originalSwupHookCallSync!;
		if (this.options.globalInstance) {
			window.swup = undefined;
		}
	}

	logHook<T extends HookName>(hook: T, args: HookArguments<T>) {
		console.groupCollapsed('%cswup:' + '%c' + hook, 'color: #343434', 'color: #009ACD');
		console.log(args);
		console.groupEnd();
	}

	callHook: Swup['hooks']['call'] = (hook, args, ...rest) => {
		this.logHook(hook, args);
		return this.originalSwupHookCall!(hook, args, ...rest);
	}

	callHookSync: Swup['hooks']['callSync'] = (hook, args, ...rest) => {
		this.logHook(hook, args);
		return this.originalSwupHookCallSync!(hook, args, ...rest);
	}

	log(str: string, object: any): void {
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

	warn(str: string): void {
		console.warn(`[swup debug plugin] ${str}`);
	}

	error(str: string): void {
		console.error(`[swup debug plugin] ${str}`);
	}
}
