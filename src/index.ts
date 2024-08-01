import Plugin from '@swup/plugin';
import { query, queryAll } from 'swup';
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
		// set non-empty log method of swup
		this.setLogImplementation();

		// set swup instance as a global variable swup
		this.setGlobalInstance();

		// make hook calls appear in console
		this.proxyHooksThroughConsole();

		// check if title tag is present
		this.checkDocumentTitle();

		// check if all containers are present
		this.checkContainers();

		// check if transition classes map to containers
		this.checkAnimationSelector();
	}

	unmount() {
		super.unmount();

		this.restoreLogImplementation();
		this.restoreHooksImplementation();
		this.unsetGlobalInstance();
	}

	setLogImplementation() {
		this.originalSwupLog = this.swup.log;
		this.swup.log = this.log;
	}

	restoreLogImplementation() {
		this.swup.log = this.originalSwupLog!;
	}

	proxyHooksThroughConsole() {
		this.originalSwupHookCall = this.swup.hooks.call.bind(this.swup.hooks);
		this.originalSwupHookCallSync = this.swup.hooks.callSync.bind(this.swup.hooks);
		this.swup.hooks.call = this.callHook.bind(this);
		this.swup.hooks.callSync = this.callHookSync.bind(this);
	}

	restoreHooksImplementation() {
		this.swup.hooks.call = this.originalSwupHookCall!;
		this.swup.hooks.callSync = this.originalSwupHookCallSync!;
	}

	setGlobalInstance() {
		if (this.options.globalInstance) {
			window.swup = this.swup;
		}
	}

	unsetGlobalInstance() {
		if (this.options.globalInstance) {
			window.swup = undefined;
		}
	}

	checkDocumentTitle() {
		if (!query('title')) {
			this.error('Document is missing a title tag. It is required on every page.');
		}
	}

	checkContainers() {
		for (const selector of this.swup.options.containers) {
			const containers = queryAll(selector);
			if (!containers.length) {
				this.error(`Container \`${selector}\` is missing on the page.`);
			}
			if (containers.length > 1) {
				this.error(`Container \`${selector}\` matches multiple elements.`);
			}
			if (containers.some((container) => !container.matches('body *'))) {
				this.error(`Container \`${selector}\` is not supported. It must be a child of the body tag.`);
			}
		}
	}

	checkAnimationSelector() {
		const { animationSelector } = this.swup.options;
		if (!animationSelector) {
			return;
		}

		const containers = this.swup.options.containers.map((selector) => query(selector));
		const animatedContainers = containers.filter((el) => el?.matches(animationSelector));
		if (!animatedContainers.length) {
			this.warn(`No container matches the animation selector \`${animationSelector}\`.`);
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
	};

	callHookSync: Swup['hooks']['callSync'] = (hook, args, ...rest) => {
		this.logHook(hook, args);
		return this.originalSwupHookCallSync!(hook, args, ...rest);
	};

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
