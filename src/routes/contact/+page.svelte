<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { contacts } from '$lib/data/site';

	function isExternal(href: string): boolean {
		return href.startsWith('http');
	}
</script>

<Seo
	title="Contact"
	description="Get in touch with Jonas Öchsner — email, GitHub and LinkedIn."
/>

<PageTitle title="Get in touch" kicker="Contact" tone="yellow">
	The fastest way to reach me is email.
</PageTitle>

<div class="container contact">
	<dl class="channels">
		{#each contacts as channel, i (channel.href)}
			<div class="channel channel--{i % 3}">
				<dt class="label channel__label">{channel.label}</dt>
				<dd>
					<a
						class="channel__link"
						href={channel.href}
						target={isExternal(channel.href) ? '_blank' : undefined}
						rel={isExternal(channel.href) ? 'noreferrer noopener' : undefined}
					>
						<Icon name={channel.icon} size={22} />
						<span class="channel__value">{channel.value}</span>
						{#if isExternal(channel.href)}
							<Icon name="external" size={16} />
						{/if}
					</a>
				</dd>
			</div>
		{/each}
	</dl>

	<p class="note">Based in Bavaria, Germany. Currently in Dublin, Ireland.</p>
</div>

<style>
	.contact {
		padding-top: var(--s-8);
	}

	.channels {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
		gap: var(--s-6);
	}

	.channel {
		display: grid;
		gap: var(--s-3);
		min-width: 0;
		padding: var(--s-5);
		border: 3px solid var(--ink);
		box-shadow: var(--shadow-2);
		background: var(--surface);
		position: relative;
	}

	/* A colour tab on each card, cycling through the primaries. */
	.channel::before {
		content: '';
		position: absolute;
		top: -3px;
		left: -3px;
		width: 3.5rem;
		height: 0.75rem;
		background: var(--red);
		border: 3px solid var(--ink);
		border-bottom: 0;
		transform: translateY(-100%);
	}

	.channel--1::before {
		background: var(--yellow);
	}

	.channel--2::before {
		background: var(--blue);
	}

	.channel dd {
		margin: 0;
		min-width: 0;
	}

	.channel__label {
		color: var(--text);
	}

	.channel__link {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
		min-height: 44px;
		color: var(--text);
		text-decoration: none;
		font-size: 1.125rem;
		font-weight: 700;
		max-width: 100%;
	}

	.channel__value {
		background-image: linear-gradient(var(--yellow), var(--yellow)), linear-gradient(var(--red), var(--red));
		background-size:
			100% 0%,
			100% 2px;
		background-repeat: no-repeat;
		background-position:
			0 100%,
			0 100%;
		transition: background-size var(--dur-base) var(--ease-out);
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover .channel__value {
			background-size:
				100% 100%,
				100% 2px;
		}
	}

	.channel__link:active {
		color: var(--accent-dim);
	}

	.channel__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.note {
		margin-top: var(--s-7);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-secondary);
		max-width: var(--measure);
		padding-left: var(--s-4);
		border-left: var(--rule-w-thick) solid var(--red);
	}
</style>
