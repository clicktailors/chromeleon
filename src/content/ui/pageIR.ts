export type IRNode =
	| { type: 'heading'; level: 1|2|3|4|5|6; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'link'; href: string; text: string }
	| { type: 'image'; src: string; alt?: string }
	| { type: 'list'; ordered: boolean; items: IRNode[] }
	| { type: 'table'; headers: string[]; rows: string[][] }
	| { type: 'input'; kind: 'text' | 'email' | 'password' | 'number' }
	| { type: 'select'; options: string[] }
	| { type: 'textarea'; text?: string }
	| { type: 'section'; children: IRNode[] };

export interface PageIR {
	title?: string;
	body: IRNode[];
}


