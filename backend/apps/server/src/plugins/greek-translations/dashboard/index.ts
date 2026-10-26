import { defineDashboardExtension } from '@vendure/dashboard';
import React from 'react';

const TAB_TITLE = 'ARIA Maniadis';

// The Dashboard sets the browser tab title to "<page> • Vendure" on every navigation (hard-coded,
// no option for it), so swap the trailing "Vendure" for our name whenever the title changes.
function brandTabTitle() {
	const branded = document.title.replace(/(^|\s•\s)Vendure$/, `$1${TAB_TITLE}`);
	if (branded !== document.title) {
		document.title = branded;
	}
}
new MutationObserver(brandTabTitle).observe(document.head, {
	childList: true,
	subtree: true,
	characterData: true,
});
brandTabTitle();

function LoginLogo() {
	return React.createElement('img', {
		src: '/assets/source/1b/logo.png',
		alt: 'Aria Bags & Hats logo',
		className: 'h-24 w-auto object-contain',
	});
}

function LoginHeading() {
	return React.createElement(
		'div',
		{ className: 'flex flex-col items-center gap-2 text-center' },
		React.createElement('h1', { className: 'text-2xl font-semibold tracking-tight' }, 'Welcome to ARIA Bags & Hats'),
		React.createElement(
			'p',
			{ className: 'text-sm text-muted-foreground' },
			'Sign in to access your B2B admin dashboard',
		),
	);
}

function LoginFooter() {
	return React.createElement(
		'div',
		{ className: 'w-full text-center text-xs text-muted-foreground' },
		'Authorized personnel only.',
	);
}

defineDashboardExtension({
	login: {
		logo: {
			component: LoginLogo,
		},
		beforeForm: {
			component: LoginHeading,
		},
		afterForm: {
			component: LoginFooter,
		},
	},
});
