import React from 'react';
import { useUI } from './provider';

export const Heading: React.FC<{ level?: 1|2|3|4|5|6; children: React.ReactNode }> = ({ level = 2, children }) => {
	const ui = useUI();
	const Tag = (`h${level}`) as keyof JSX.IntrinsicElements;
	return <Tag className={ui.text.heading}>{children}</Tag>;
};

export const Text: React.FC<{ muted?: boolean; children: React.ReactNode }> = ({ muted, children }) => {
	const ui = useUI();
	return <p className={muted ? ui.text.muted : ui.text.base}>{children}</p>;
};

export const Link: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
	const ui = useUI();
	return <a className={ui.link.base} href={href} target="_blank" rel="noreferrer noopener">{children}</a>;
};

export const Image: React.FC<{ src: string; alt?: string }> = ({ src, alt }) => {
	const ui = useUI();
	return <img className={ui.image.base} src={src} alt={alt ?? ''} />;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
	const ui = useUI();
	return <input {...props} className={ui.input.base} />;
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
	const ui = useUI();
	return <select {...props} className={ui.select.base} />;
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
	const ui = useUI();
	return <textarea {...props} className={ui.textarea.base} />;
};

export const Table: React.FC<{ headers: string[]; rows: (React.ReactNode[])[] }> = ({ headers, rows }) => {
	const ui = useUI();
	return (
		<table className={ui.table.wrapper}>
			<thead>
				<tr>
					{headers.map((h, i) => (
						<th key={i} className={ui.table.th}>{h}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((r, i) => (
					<tr key={i}>
						{r.map((cell, j) => (
							<td key={j} className={ui.table.td}>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};


