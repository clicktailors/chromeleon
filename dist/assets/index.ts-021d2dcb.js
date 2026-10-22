import{F as q,p as ht,t as ft,l as W,a as X,o as gt,D as bt,s as Y}from"./settings-058e4301.js";const rt=/article|body|content|entry|hentry|h-entry|main|page|post|text|blog|story|prose|markdown|reader/i,at=/(^|[\s_-])(ad|ads|adv|banner|breadcrumbs?|combx|comments?|com-|contact|cookie|footer|footnote|gdpr|masthead|media-share|menu|meta|modal|nav|navbar|newsletter|outbrain|popup|promo|related|share|sharing|shopping|sidebar|skyscraper|social|sponsor(ed)?|subscribe|taboola|tags|toolbar|widget)([\s_-]|$)/i,yt="p, pre, blockquote, div, section, td",wt=25;function vt(t){let e=0;const n=typeof t.className=="string"?t.className:"";for(const o of[n,t.id])o&&(at.test(o)&&(e-=25),rt.test(o)&&(e+=25));return e}function Et(t){switch(t.tagName){case"ARTICLE":case"MAIN":return 15;case"DIV":case"SECTION":return 5;case"PRE":case"TD":case"BLOCKQUOTE":return 3;case"OL":case"UL":case"DL":case"LI":case"FORM":return-3;case"NAV":case"ASIDE":case"FOOTER":return-25;default:return/^H\d$/.test(t.tagName)?-5:0}}function v(t){return(t.textContent||"").replace(/\s+/g," ").trim()}function it(t){let e="";for(const n of t.childNodes)(n.nodeType===Node.TEXT_NODE||n instanceof HTMLElement&&xt(n))&&(e+=n.textContent);return e.replace(/\s+/g," ").trim()}const kt=new Set(["A","ABBR","B","BR","CITE","CODE","EM","FONT","I","KBD","MARK","Q","S","SMALL","SPAN","STRONG","SUB","SUP","TIME","U"]),xt=t=>kt.has(t.tagName);function _(t,e=v(t)){if(!e.length)return 0;let n=0;for(const o of t.querySelectorAll("a"))n+=v(o).length;return Math.min(1,n/e.length)}function st(t){const e=t.checkVisibility;return typeof e=="function"?e.call(t,{checkVisibilityCSS:!0}):t.getClientRects().length>0}function $t(t){return t.tagName==="P"||t.tagName==="PRE"||t.tagName==="BLOCKQUOTE"?!0:it(t).length>=80}function Z(t,e){const n=[];let o=t.parentElement;for(;o&&n.length<e&&o!==document.documentElement;)n.push(o),o=o.parentElement;return n}function ct(t,e){const n=new Set;for(let o=t;o;o=o.parentElement)n.add(o);for(let o=e;o;o=o.parentElement)if(n.has(o))return o;return null}function St(t=document){var h;const e=t.body;if(!e)return null;const n=new Map,o=[];for(const i of e.querySelectorAll(yt)){if(!$t(i)||i.closest('nav, footer, aside, [role="navigation"], [role="complementary"], [aria-hidden="true"]'))continue;const u=i.tagName==="DIV"||i.tagName==="SECTION"||i.tagName==="TD",f=u?it(i):v(i);if(f.length<wt)continue;o.push({el:i,count:f.length>=80?At(i):0});const R=1+(f.split(/[,，、]/).length-1)+Math.min(Math.floor(f.length/100),3);(u?[i,...Z(i,4)]:Z(i,5)).forEach((k,l)=>{n.has(k)||n.set(k,Et(k)+vt(k));const g=l===0?1:l===1?2:l*3;n.set(k,n.get(k)+R/g)})}if(!n.size)return null;const r=[...n.entries()].map(([i,u])=>({el:i,score:u*(1-_(i))})).filter(({el:i})=>i!==e&&st(i)).sort((i,u)=>u.score-i.score);if(!r.length)return null;let a=r[0].el;const d=r[0].score,s=r.slice(1,6).filter(i=>i.score>=d*.75&&!a.contains(i.el)&&!i.el.contains(a));if(s.length>=2){let i=a;for(const u of s)i=i&&ct(i,u.el);i&&i!==e&&i!==t.documentElement&&(a=i)}const m=(h=a.parentElement)==null?void 0:h.closest('article, [itemprop="articleBody"]');m&&m!==e&&v(m).length<v(a).length*1.5&&(a=m);const p=v(a),N=Tt(a,t);return{root:a,extras:N,textLength:p.length,linkDensity:_(a,p),paragraphs:o.reduce((i,u)=>a.contains(u.el)?i+u.count:i,0),source:"score"}}function At(t){let e=1;for(const n of t.querySelectorAll("br")){let o=n.nextSibling;for(;o&&o.nodeType===Node.TEXT_NODE&&!o.textContent.trim();)o=o.nextSibling;o instanceof HTMLBRElement&&e++}return e}function Nt(t){return t.textLength>=500&&t.linkDensity<.5&&t.paragraphs>=3}function Tt(t,e){const n=[],o=Lt(t,e);if(o&&!t.contains(o)){let r=o;const a=o.parentElement;if(a&&!a.contains(t)&&a!==e.body){const s=v(a);s.length<600&&_(a,s)<.5&&(r=a)}n.push(r);const d=Ct(r,t);d&&n.push(d)}return n}function Lt(t,e){const n=e.title.toLowerCase(),o=[...e.querySelectorAll("h1")].filter(st);if(!o.length)return null;const r=o.find(m=>t.contains(m));if(r)return r;const a=o.find(m=>{const p=v(m).toLowerCase();return p.length>3&&n.includes(p.slice(0,40))}),d=a??o[0],s=ct(d,t);return!s||s===e.documentElement||s===e.body&&!a?null:d}function Ct(t,e){let n=null,o=0;for(const r of document.querySelectorAll("img")){if(e.contains(r)||t.contains(r))continue;const a=t.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING,d=e.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_PRECEDING;if(!a||!d)continue;const s=r.getBoundingClientRect(),m=s.width*s.height;s.width>=300&&m>o&&(n=r,o=m)}return n?n.closest("figure, picture")??n:null}const It=["nav",'[role="navigation"]',"ins.adsbygoogle",'iframe[src*="doubleclick"]','iframe[src*="googlesyndication"]','[id^="google_ads"]',"[data-ad]","[data-ad-slot]"].join(",");function Ot(t){const e=v(t).length||1,n=new Set(t.querySelectorAll(It));for(const o of t.querySelectorAll("div, section, aside, ul, form, footer, header")){if(n.has(o))continue;const r=`${typeof o.className=="string"?o.className:""} ${o.id}`,a=at.test(r)&&!rt.test(o.id),d=o.tagName==="ASIDE";if(!a&&!d)continue;const s=v(o);if(s.length>e*.3||o.querySelector("h1"))continue;const m=_(o,s);(d?m>.5:m>.35||s.length<200)&&n.add(o)}return[...n].filter(o=>![...n].some(r=>r!==o&&r.contains(o)))}const O="html[data-chl-on]",T='html[data-chl-on][data-chl-mode="reader"]',c=`${T} :where([data-chl-root], [data-chl-keep])`,C='html[data-chl-on][data-chl-mode="whole"]',z='button, [role="button"], input:not([type="checkbox"], [type="radio"], [type="range"], [type="hidden"], [type="image"], [type="color"]), select, textarea',Mt={light:"(prefers-color-scheme: light)",dark:"(prefers-color-scheme: dark)"};function Rt(t,e){var N;const n=((N=q[t.font])==null?void 0:N.stack)??q.serif.stack,o=q.mono.stack,r=`
${O} {
	--chl-font: ${n};
	--chl-mono: ${o};
	--chl-size: ${t.fontSize}px;
	--chl-lh: ${t.lineHeight};
	--chl-width: ${t.width}px;
}`,d=(t.mode==="system"?["light","dark"]:[t.mode]).map(h=>{const i=h==="light"?t.paletteLight:t.paletteDark,u=`${O} { ${Dt(ht(h,i))} }
${T} { color-scheme: ${h}; }
${Bt(h)}`;return t.mode==="system"?`@media ${Mt[h]} {
${u}
}`:u}).join(`
`),s=(e.hide??[]).filter(zt),m=s.length?`${O} :is(${s.join(", ")}) { display: none !important; }`:"",p=t.hideImages?`${c} :where(img, picture, figure, video) { display: none !important; }`:"";return[r,d,_t,Pt,qt,p,m].join(`
`)}function Dt(t){return[["bg",t.background],["fg",t.foreground],["muted",t.muted],["heading",t.heading],["accent",t.accent],["surface",t.surface],["border",t.border],["code-bg",t.codeBg],["selection",t.selection]].map(([n,o])=>`--chl-${n}: ${ft(o)};`).join(" ")}function zt(t){try{return document.createDocumentFragment().querySelector(t),!0}catch{return!1}}const _t=`
html[data-chl-pending] body { visibility: hidden !important; }
${O} [data-chl-hide] { display: none !important; }
${O} ::selection { background: var(--chl-selection) !important; }
`,Pt=`
${T} {
	background: var(--chl-bg) !important;
	overflow-x: hidden !important;
	overflow-y: auto !important;
	height: auto !important;
}
${T} body[data-chl-path] {
	background: var(--chl-bg) !important;
	color: var(--chl-fg) !important;
	padding: 56px 0 30vh !important;
	overflow: visible !important;
}

/* Ancestors of the article: flatten whatever grid, flex or fixed layout they had. */
${T} [data-chl-path] {
	display: block !important;
	position: static !important;
	float: none !important;
	inset: auto !important;
	width: auto !important;
	min-width: 0 !important;
	max-width: none !important;
	height: auto !important;
	min-height: 0 !important;
	max-height: none !important;
	margin: 0 !important;
	padding: 0 !important;
	border: 0 !important;
	box-shadow: none !important;
	transform: none !important;
	filter: none !important;
	contain: none !important;
	clip-path: none !important;
	columns: auto !important;
	overflow: visible !important;
	background: transparent !important;
}

/* The reading column. */
${T} :is([data-chl-root], [data-chl-keep]) {
	display: block !important;
	position: static !important;
	float: none !important;
	box-sizing: border-box !important;
	width: 100% !important;
	min-width: 0 !important;
	max-width: var(--chl-width) !important;
	height: auto !important;
	max-height: none !important;
	margin: 0 auto !important;
	padding: 0 24px !important;
	border: 0 !important;
	box-shadow: none !important;
	transform: none !important;
	overflow: visible !important;
	columns: auto !important;
	background: transparent !important;
	color: var(--chl-fg) !important;
	font-family: var(--chl-font) !important;
	font-size: var(--chl-size) !important;
	line-height: var(--chl-lh) !important;
	text-align: start !important;
}
${T} [data-chl-keep] { margin-bottom: 1.5em !important; }

/* Text: one family, one size, one colour. */
${c} :where(p, li, dd, dt, blockquote, div, span, section, article, header, footer, main, a, em, strong, b, i, u, s, mark, td, th, label, time, cite, abbr, q, dl, ul, ol, address, summary, details, font, small, figure) {
	font-family: inherit !important;
	font-size: inherit !important;
	line-height: inherit !important;
	letter-spacing: normal !important;
	text-transform: none !important;
}
${c} :where(:not(a, h1, h2, h3, h4, h5, h6, mark, pre *, ${z})) {
	color: inherit !important;
}
${c} :where(:not(img, picture, video, canvas, iframe, svg, svg *, pre, code, kbd, mark, ${z})) {
	background-color: transparent !important;
}
${c} :where(div, section, figure, aside, table, pre, p, ul, ol, blockquote, img, video, iframe, embed, object, canvas, svg, picture) {
	max-width: 100% !important;
}
${c} :where(p, ul, ol, dl, blockquote, pre, table, figure) {
	margin-top: 0 !important;
	margin-bottom: 1.15em !important;
}
${c} :where(ul, ol) { padding-inline-start: 1.6em !important; }
${c} :where(li) { margin-bottom: 0.35em !important; }

${c} :is(h1, h2, h3, h4, h5, h6) {
	font-family: var(--chl-font) !important;
	color: var(--chl-heading) !important;
	line-height: 1.25 !important;
	letter-spacing: -0.01em !important;
	text-transform: none !important;
	font-weight: 700 !important;
	margin: 1.6em 0 0.6em !important;
	text-align: start !important;
}
${c} h1 { font-size: 2.1em !important; margin-top: 0 !important; }
${c} h2 { font-size: 1.55em !important; }
${c} h3 { font-size: 1.25em !important; }
${c} h4 { font-size: 1.1em !important; }
${c} :is(h5, h6) { font-size: 1em !important; }

${c} a {
	color: var(--chl-accent) !important;
	text-decoration: underline !important;
	text-decoration-thickness: 1px !important;
	text-underline-offset: 0.18em !important;
}
${c} a:hover { text-decoration-thickness: 2px !important; }
${c} :is(h1, h2, h3, h4, h5, h6) a { color: inherit !important; text-decoration: none !important; }

${c} :is(img, video) { height: auto !important; border-radius: 4px; }
${c} img:is(.lazyload, .lazyloading, .lazy, [data-src], [data-lazy-src]) { opacity: 1 !important; visibility: visible !important; }
${c} figure { margin: 1.6em 0 !important; }
${c} :is(figcaption, small, sub, sup, caption) { font-size: 0.82em !important; color: var(--chl-muted) !important; }
${c} figcaption { margin-top: 0.5em !important; line-height: 1.45 !important; }

${c} blockquote {
	margin-left: 0 !important;
	margin-right: 0 !important;
	padding: 0.1em 0 0.1em 1.1em !important;
	border-left: 3px solid var(--chl-border) !important;
	color: var(--chl-muted) !important;
}
${c} hr { border: 0 !important; border-top: 1px solid var(--chl-border) !important; margin: 2em 0 !important; }

${c} :is(pre, code, kbd, samp) {
	font-family: var(--chl-mono) !important;
	font-size: 0.86em !important;
	background-color: var(--chl-code-bg) !important;
	border-radius: 5px !important;
}
${c} :is(code, kbd, samp) { padding: 0.1em 0.35em !important; }
${c} pre { padding: 1em 1.2em !important; overflow: auto !important; line-height: 1.5 !important; }
${c} pre :is(code, kbd, samp) { font-size: inherit !important; background: transparent !important; padding: 0 !important; }
${c} pre * { font-family: inherit !important; }

${c} table { border-collapse: collapse !important; display: block !important; overflow-x: auto !important; width: max-content !important; }
${c} table:has(th):not(:has(table)) :is(th, td) {
	border: 1px solid var(--chl-border) !important;
	padding: 0.45em 0.75em !important;
	text-align: start !important;
	vertical-align: top !important;
}
${c} table:has(th):not(:has(table)) th { background-color: var(--chl-surface) !important; color: var(--chl-heading) !important; }

/* Buttons and fields keep working, they just match the theme. */
${c} :is(${z}) {
	font-family: inherit !important;
	color: var(--chl-fg) !important;
	background-color: var(--chl-surface) !important;
	border: 1px solid var(--chl-border) !important;
	border-radius: 8px !important;
}
${c} :is(button, [role="button"]):hover { border-color: var(--chl-accent) !important; }
${c} :is(${z}):focus-visible { outline: 2px solid var(--chl-accent) !important; outline-offset: 2px !important; }
`,qt=`
${C} body :where(p, li, dd, dt, blockquote, td, th, span, a, label, h1, h2, h3, h4, h5, h6, div, article, section) {
	font-family: var(--chl-font) !important;
}
`;function Bt(t){return t==="light"?`
${C}, ${C} body { background-color: var(--chl-bg) !important; }
${C} body a { color: var(--chl-accent) !important; }
`:`
${C} { filter: invert(0.9) hue-rotate(180deg) !important; background: #fff !important; }
${C} :is(img, video, picture, canvas, iframe, [style*="background-image"]) { filter: invert(1) hue-rotate(180deg) !important; }
`}const U="chromeleon-picker";function Q({prompt:t,onPick:e,onDone:n}){var k;(k=document.getElementById(U))==null||k.remove();const o=document.createElement("div");o.id=U;const r=o.attachShadow({mode:"closed"});r.innerHTML=`
		<style>
			:host { all: initial; }
			.box { position: fixed; pointer-events: none; z-index: 2147483647; border: 2px solid #2f7bf5;
				background: rgba(47,123,245,.12); border-radius: 3px; transition: all 60ms ease-out; display: none; }
			.bar { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483647;
				font: 13px/1.4 system-ui, sans-serif; color: #fff; background: #1d2330; padding: 8px 14px;
				border-radius: 999px; box-shadow: 0 6px 24px rgba(0,0,0,.25); pointer-events: none; white-space: nowrap; }
			.bar b { color: #9cc2ff; font-weight: 600; }
			.tag { position: fixed; z-index: 2147483647; pointer-events: none; font: 11px/1 ui-monospace, monospace;
				background: #2f7bf5; color: #fff; padding: 3px 5px; border-radius: 3px; display: none; }
		</style>
		<div class="box"></div><div class="tag"></div>
		<div class="bar">${t} · <b>↑</b> parent · <b>↓</b> child · <b>Esc</b> done</div>`,document.documentElement.appendChild(o);const a=r.querySelector(".box"),d=r.querySelector(".tag");let s=null;const m=[],p=l=>{if(s=l,!l){a.style.display=d.style.display="none";return}const g=l.getBoundingClientRect();Object.assign(a.style,{display:"block",left:`${g.left}px`,top:`${g.top}px`,width:`${g.width}px`,height:`${g.height}px`}),d.textContent=jt(l),Object.assign(d.style,{display:"block",left:`${Math.max(0,g.left)}px`,top:`${Math.max(0,g.top-18)}px`})},N=l=>{const g=document.elementFromPoint(l.clientX,l.clientY);!g||g===o||(m.length=0,p(g))},h=l=>{l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation()},i=async l=>{if(h(l),!s)return;await e(s)?p(null):D()},u=l=>{l.key==="Escape"?(h(l),D()):l.key==="ArrowUp"&&(s!=null&&s.parentElement)&&s.parentElement!==document.documentElement?(h(l),m.push(s),p(s.parentElement)):l.key==="ArrowDown"&&m.length?(h(l),p(m.pop())):l.key==="Enter"&&s&&i(l)},f={capture:!0};window.addEventListener("mousemove",N,f),window.addEventListener("click",i,f);for(const l of["mousedown","mouseup","pointerdown","pointerup"])window.addEventListener(l,h,f);window.addEventListener("keydown",u,f);let R=!1;function D(){if(!R){R=!0,window.removeEventListener("mousemove",N,f),window.removeEventListener("click",i,f);for(const l of["mousedown","mouseup","pointerdown","pointerup"])window.removeEventListener(l,h,f);window.removeEventListener("keydown",u,f),o.remove(),n==null||n()}}return D}function jt(t){let e=t.localName;t.id&&(e+=`#${t.id}`);const n=[...t.classList].slice(0,2);return n.length&&(e+=`.${n.join(".")}`),e.length>60?`${e.slice(0,57)}…`:e}const Ut=/\d{3,}|^css-|^sc-|^jsx-|^emotion-|__[A-Za-z0-9_-]{5,}$|^_[A-Za-z0-9]{5,}$|^[a-z]{1,3}[A-Z0-9][A-Za-z0-9]{4,}$/,Ht=/\d{4,}|^:r|^ember\d|^react-|^radix-|^headlessui-/;function J(t){const e=[];let n=t;for(;n&&n!==document.documentElement;){if(n.id&&!Ht.test(n.id)&&document.querySelectorAll(`#${CSS.escape(n.id)}`).length===1){e.unshift(`#${CSS.escape(n.id)}`);break}let o=n.localName;const r=[...n.classList].filter(s=>!Ut.test(s)&&s.length<40).slice(0,2);o+=r.map(s=>`.${CSS.escape(s)}`).join("");const a=n.parentElement;if(a){const s=[...a.children].filter(p=>p.localName===n.localName);[...a.children].filter(p=>p.matches(o)).length>1&&(o+=`:nth-of-type(${s.indexOf(n)+1})`)}e.unshift(o);const d=e.join(" > ");if(document.querySelectorAll(d).length===1)return d;n=a}return e.join(" > ")}const H="chromeleon-style",Ft=["data-chl-root","data-chl-keep","data-chl-path","data-chl-hide","data-chl-allow"],Gt=new Set([H,U]),Vt=2e3,Kt=12e3,L=location.hostname,F=`hint:${L}`,Wt=1500;let M=bt,y={},b=null,E=!1,$="off",S="Starting",x=null,lt=-1/0,tt=location.href,et=performance.now(),A=!1;async function Xt(){const[t,e,n]=await Promise.all([W(),X(L),chrome.storage.local.get(F)]);M=t,y=e,P(),n[F]&&dt()!=="off"&&document.readyState==="loading"&&(document.documentElement.setAttribute("data-chl-pending",""),setTimeout(()=>document.documentElement.removeAttribute("data-chl-pending"),Wt)),gt(L,async()=>{[M,y]=await Promise.all([W(),X(L)]),P(),w()});for(const r of["pointerdown","keydown"])window.addEventListener(r,()=>lt=performance.now(),{capture:!0,passive:!0});chrome.runtime.onMessage.addListener((r,a,d)=>{switch(r==null?void 0:r.type){case"chl:status":d(I());break;case"chl:toggle":x=E?"off":"reader",w(),d(I());break;case"chl:cycle":x=$==="reader"?"theme":$==="theme"?"off":"reader",w(),d(I());break;case"chl:redetect":x=null,w(),d(I());break;case"chl:pick":te(r.mode),d(I());break}});const o=()=>{w(),Qt()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o,{once:!0}):o(),window.addEventListener("load",()=>!E&&w(),{once:!0})}function dt(){return x||(M.enabled?y.mode??"auto":"off")}function w(){if(A)return;const t=dt();if(t==="off"){G(),$=!x&&!M.enabled?"paused":"off",S=x?"Turned off for this visit":$==="paused"?"Chromeleon is paused":"Off for this site",j();return}if(t==="theme"){b=null,ot(),S=x?"Theme only for this visit":"Theme only on this site",j();return}const e=t==="reader";b=Yt(),b&&(e||b.source==="rule"||Nt(b))?(Zt(b),S=b.source==="rule"?"Using your content area for this site":"Article found"):e?(ot(),S="No article found; theme only"):(G(),S=b?"This page doesn't look like an article":"No readable content found"),j()}function Yt(){if(y.root)try{const t=document.querySelector(y.root);if(t)return{root:t,extras:[],textLength:0,linkDensity:0,paragraphs:0,source:"rule"}}catch{}return St()}function K(){for(const t of Ft)if(t!=="data-chl-allow")for(const e of document.querySelectorAll(`[${t}]`))e.removeAttribute(t)}function Zt(t){K();const e=[t.root,...t.extras];t.root.setAttribute("data-chl-root","");for(const o of t.extras)o.setAttribute("data-chl-keep","");const n=new Set;for(const o of e)for(let r=o.parentElement;r&&r!==document.documentElement;r=r.parentElement)n.add(r);for(const o of n)o.setAttribute("data-chl-path","");for(const o of[document.documentElement,...n])for(const r of o.children)n.has(r)||e.includes(r)||ut(r)||r.setAttribute("data-chl-hide","");if(t.source==="score")for(const o of Ot(t.root))o.setAttribute("data-chl-hide","");for(const o of e)pt(o);mt("reader")}function ot(){K(),mt("whole")}function mt(t){const e=document.documentElement;e.setAttribute("data-chl-on",""),e.setAttribute("data-chl-mode",t),E=!0,$=t==="reader"?"reader":"theme"}function G(){K();const t=document.documentElement;t.removeAttribute("data-chl-on"),t.removeAttribute("data-chl-mode"),E=!1,$="off"}function ut(t){return Gt.has(t.id)||t.hasAttribute("data-chl-allow")?!0:t.tagName==="HEAD"||t.tagName==="SCRIPT"||t.tagName==="STYLE"||t.tagName==="LINK"||t.tagName==="TEMPLATE"}function P(){let t=document.getElementById(H);t||(t=document.createElement("style"),t.id=H),t.textContent=Rt(M,y),(t.parentNode!==document.documentElement||t!==document.documentElement.lastElementChild)&&document.documentElement.appendChild(t)}function pt(t){for(const e of t.querySelectorAll("img[data-src], img[data-lazy-src], img[data-original]")){const n=e.getAttribute("src")??"",o=!n||n.startsWith("data:")||/blank|placeholder|spacer|lazy|1x1|pixel/i.test(n),r=e.dataset.src||e.dataset.lazySrc||e.dataset.original;o&&r&&(e.src=r);const a=e.dataset.srcset||e.dataset.lazySrcset;a&&!e.srcset&&(e.srcset=a)}for(const e of t.querySelectorAll("source[data-srcset]"))e.srcset||(e.srcset=e.dataset.srcset)}let V=0;function Qt(){new MutationObserver(n=>{A||(E&&b&&Jt(n),V||(V=window.setTimeout(B,250)))}).observe(document.documentElement,{childList:!0,subtree:!0}),window.addEventListener("popstate",()=>B());const e=window.navigation;e==null||e.addEventListener("navigatesuccess",()=>B())}function Jt(t){var n;const e=performance.now()-lt<Vt;for(const o of t){const r=o.target;if(!(r!==document.documentElement&&!((n=r.hasAttribute)!=null&&n.call(r,"data-chl-path"))))for(const a of o.addedNodes)!(a instanceof Element)||ut(a)||a.hasAttribute("data-chl-root")||a.hasAttribute("data-chl-keep")||a.hasAttribute("data-chl-path")||(e?a.setAttribute("data-chl-allow",""):a.setAttribute("data-chl-hide",""))}}function B(){if(V=0,!A){if(P(),location.href!==tt){tt=location.href,x=null,et=performance.now(),document.querySelectorAll("[data-chl-allow]").forEach(t=>t.removeAttribute("data-chl-allow")),w();return}if(E&&b&&!b.root.isConnected){w();return}if(E&&b){pt(b.root);return}!E&&performance.now()-et<Kt&&w()}}function te(t){if(!A){if(t==="root"){A=!0,G(),Q({prompt:"Click the article or main content",onPick:async e=>(y=await Y(L,{root:J(e),mode:"reader"}),!1),onDone:()=>{A=!1,w()}});return}A=!0,Q({prompt:"Click things to hide",onPick:async e=>{const n=J(e);return e.setAttribute("data-chl-hide",""),y=await Y(L,{hide:[...y.hide??[],n]}),P(),!0},onDone:()=>{A=!1,w()}})}}function I(){var t;return{host:L,applied:E,state:$,reason:S,mode:y.mode??"auto",hasCustomRoot:!!y.root,hiddenCount:((t=y.hide)==null?void 0:t.length)??0}}let nt="";function j(){document.documentElement.removeAttribute("data-chl-pending");const t=y.mode??"auto",e=`${$}|${S}|${t}`;nt!==e&&(nt=e,chrome.runtime.sendMessage({type:"chl:state",state:$,reason:S,mode:t}).catch(()=>{}),chrome.storage.local.set({[F]:E}))}window.top===window&&document.documentElement instanceof HTMLHtmlElement&&Xt();
