declare function URLTemplate(template: string): URLTemplate;

interface URLTemplate {
	fillFromObject(vars: any):string;
	fill(callback: (varName: string) => string):string;
	fromUri(uri: string):any;
}

declare module 'uri-templates' {
export = URLTemplate;
}
