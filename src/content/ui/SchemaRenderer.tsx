import React from "react";
import { NavbarConfig } from "../utils/navbarManager";
import { NavbarRenderer } from "./NavbarRenderer";

type ButtonVariant =
	| "primary"
	| "secondary"
	| "accent"
	| "neutral"
	| "info"
	| "success"
	| "warning"
	| "error"
	| "ghost"
	| "link"
	| "outline";

type NodeType =
	| { type: "page"; children: SchemaNode[] }
	| { type: "section"; children: SchemaNode[]; title?: string }
	| { type: "card"; title?: string; body?: string }
	| { type: "image"; src: string; alt?: string }
	| { type: "table"; headers: string[]; rows: string[][] }
	| {
			type: "button";
			label: string;
			variant?: ButtonVariant;
			size?: "xs" | "sm" | "md" | "lg";
	  }
	| {
			type: "buttonRow";
			buttons: {
				label: string;
				variant?: ButtonVariant;
				size?: "xs" | "sm" | "md" | "lg";
			}[];
	  }
	| {
			type: "badgeRow";
			badges: {
				text: string;
				variant?:
					| "primary"
					| "secondary"
					| "accent"
					| "neutral"
					| "info"
					| "success"
					| "warning"
					| "error";
			}[];
	  }
	| {
			type: "alert";
			tone: "info" | "success" | "warning" | "error";
			text: string;
	  }
	| {
			type: "navbar";
			config: NavbarConfig;
	  }
	| {
			type: "hero";
			title: string;
			subtitle?: string;
			actions?: {
				label: string;
				variant?: ButtonVariant;
				href?: string;
			}[];
	  }
	| {
			type: "linkRow";
			links: {
				label: string;
				href?: string;
				variant?: "default" | "primary" | "secondary";
			}[];
	  }
	| {
			type: "searchBox";
			placeholder?: string;
			size?: "sm" | "md" | "lg";
	  }
	| {
			type: "grid";
			columns: number;
			children: SchemaNode[];
	  }
	| {
			type: "flex";
			direction?: "row" | "column";
			justify?: "start" | "center" | "end" | "between" | "around";
			align?: "start" | "center" | "end" | "stretch";
			children: SchemaNode[];
	  };

export type SchemaNode = NodeType;

export const SchemaRenderer: React.FC<{ schema: SchemaNode }> = ({
	schema,
}) => {
	return <SchemaNodeView node={schema} />;
};

const SchemaNodeView: React.FC<{ node: SchemaNode }> = ({ node }) => {
	switch (node.type) {
		case "page":
			return (
				<div className="space-y-4">
					{node.children.map((c, i) => (
						<SchemaNodeView key={i} node={c} />
					))}
				</div>
			);
		case "section":
			return (
				<div className="space-y-3">
					{node.title ? (
						<h2 className="text-xl font-semibold">{node.title}</h2>
					) : null}
					{node.children.map((c, i) => (
						<SchemaNodeView key={i} node={c} />
					))}
				</div>
			);
		case "card":
			return (
				<div className="card bg-base-200 border border-base-300">
					<div className="card-body">
						{node.title ? (
							<h3 className="card-title">{node.title}</h3>
						) : null}
						{node.body ? <p>{node.body}</p> : null}
					</div>
				</div>
			);
		case "button": {
			const variant = node.variant ?? "primary";
			const size = node.size ?? "md";
			return (
				<button className={`btn btn-${variant} btn-${size}`}>
					{node.label}
				</button>
			);
		}
		case "buttonRow":
			return (
				<div className="flex flex-wrap gap-2">
					{node.buttons.map((b, i) => (
						<button
							key={i}
							className={`btn btn-${b.variant ?? "primary"} btn-${
								b.size ?? "md"
							}`}
						>
							{b.label}
						</button>
					))}
				</div>
			);
		case "badgeRow":
			return (
				<div className="flex flex-wrap gap-2 items-center">
					{node.badges.map((b, i) => (
						<div
							key={i}
							className={`badge ${
								b.variant ? `badge-${b.variant}` : ""
							}`}
						>
							{b.text}
						</div>
					))}
				</div>
			);
		case "alert":
			return (
				<div role="alert" className={`alert alert-${node.tone}`}>
					<span>{node.text}</span>
				</div>
			);
		case "image":
			return (
				<img
					src={node.src}
					alt={node.alt || ""}
					className="max-w-full rounded"
				/>
			);
		case "table":
			return (
				<div className="overflow-x-auto">
					<table className="table table-zebra">
						<thead>
							<tr>
								{node.headers.map((h, i) => (
									<th key={i}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{node.rows.map((r, i) => (
								<tr key={i}>
									{r.map((c, j) => (
										<td key={j}>{c}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		case "navbar":
			return <NavbarRenderer config={node.config} />;
		case "hero":
			return (
				<div className="hero min-h-[400px] bg-base-200 rounded-lg">
					<div className="hero-content text-center">
						<div className="max-w-md">
							<h1 className="text-5xl font-bold">{node.title}</h1>
							{node.subtitle && (
								<p className="py-6 text-lg">{node.subtitle}</p>
							)}
							{node.actions && node.actions.length > 0 && (
								<div className="flex gap-4 justify-center">
									{node.actions.map((action, i) => (
										action.href ? (
											<a
												key={i}
												href={action.href}
												className={`btn btn-${action.variant ?? "primary"}`}
											>
												{action.label}
											</a>
										) : (
											<button
												key={i}
												className={`btn btn-${action.variant ?? "primary"}`}
											>
												{action.label}
											</button>
										)
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			);
		case "linkRow":
			return (
				<div className="flex flex-wrap gap-4 items-center">
					{node.links.map((link, i) => (
						link.href ? (
							<a
								key={i}
								href={link.href}
								className={`link ${
									link.variant === "primary" ? "link-primary" :
									link.variant === "secondary" ? "link-secondary" :
									"link-hover"
								}`}
							>
								{link.label}
							</a>
						) : (
							<span
								key={i}
								className={`${
									link.variant === "primary" ? "text-primary" :
									link.variant === "secondary" ? "text-secondary" :
									"text-base-content"
								}`}
							>
								{link.label}
							</span>
						)
					))}
				</div>
			);
		case "searchBox":
			return (
				<div className="form-control w-full max-w-xs mx-auto">
					<input
						type="text"
						placeholder={node.placeholder ?? "Search..."}
						className={`input input-bordered w-full ${
							node.size === "sm" ? "input-sm" :
							node.size === "lg" ? "input-lg" :
							""
						}`}
					/>
				</div>
			);
		case "grid":
			return (
				<div className={`grid gap-4 ${
					node.columns === 1 ? "grid-cols-1" :
					node.columns === 2 ? "grid-cols-1 md:grid-cols-2" :
					node.columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
					node.columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
					"grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
				}`}>
					{node.children.map((child, i) => (
						<SchemaNodeView key={i} node={child} />
					))}
				</div>
			);
		case "flex":
			return (
				<div className={`flex gap-4 ${
					node.direction === "column" ? "flex-col" : "flex-row"
				} ${
					node.justify === "center" ? "justify-center" :
					node.justify === "end" ? "justify-end" :
					node.justify === "between" ? "justify-between" :
					node.justify === "around" ? "justify-around" :
					"justify-start"
				} ${
					node.align === "center" ? "items-center" :
					node.align === "end" ? "items-end" :
					node.align === "stretch" ? "items-stretch" :
					"items-start"
				}`}>
					{node.children.map((child, i) => (
						<SchemaNodeView key={i} node={child} />
					))}
				</div>
			);
		default:
			return null;
	}
};
