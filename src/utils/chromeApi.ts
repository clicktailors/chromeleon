export type ChromeGlobal = typeof globalThis extends { chrome: infer T }
	? T
	: any;

export const resolveChromeGlobal = (): ChromeGlobal | undefined => {
	if (typeof globalThis === "undefined") {
		return undefined;
	}

	return (globalThis as typeof globalThis & { chrome?: ChromeGlobal }).chrome;
};

export const chromeApi = resolveChromeGlobal();
export const chromeRuntime = chromeApi?.runtime;
export const chromeStorage = chromeApi?.storage;
export const chromeTabs = chromeApi?.tabs;
