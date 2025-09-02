import React from 'react';
import type { IRNode, PageIR } from './pageIR';
import { Heading, Text, Link, Image, Input, Select, Textarea, Table } from '../../components/ui/primitives';

export const IRRenderer: React.FC<{ ir: PageIR }> = ({ ir }) => (
	<div className="chromeleon-doc">
		{ir.title ? <Heading level={1}>{ir.title}</Heading> : null}
		{ir.body.map((node, idx) => (
			<IRNodeView key={idx} node={node} />
		))}
	</div>
);

const IRNodeView: React.FC<{ node: IRNode }> = ({ node }) => {
	switch (node.type) {
		case 'heading':
			return <Heading level={node.level}>{node.text}</Heading>;
		case 'paragraph':
			return <Text>{node.text}</Text>;
		case 'link':
			return <Link href={node.href}>{node.text}</Link>;
		case 'image':
			return <Image src={node.src} alt={node.alt} />;
		case 'table':
			return <Table headers={node.headers} rows={node.rows} />;
		case 'input':
			return <Input type={node.kind} />;
		case 'select':
			return <Select>{node.options.map((o, i) => (<option key={i}>{o}</option>))}</Select>;
		case 'textarea':
			return <Textarea defaultValue={node.text} />;
		case 'list':
			return (
				<div>
					{node.items.map((item, i) => (
						<IRNodeView key={i} node={item} />
					))}
				</div>
			);
		case 'section':
			return (
				<div>
					{node.children.map((child, i) => (
						<IRNodeView key={i} node={child} />
					))}
				</div>
			);
		default:
			return null;
	}
};


