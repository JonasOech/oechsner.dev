<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import AsciiWall from '$lib/components/AsciiWall.svelte';
	import { contacts } from '$lib/data/site';

	function isExternal(href: string): boolean {
		return href.startsWith('http');
	}
</script>

<Seo
	title="Contact"
	description="Get in touch with Jonas Öchsner — email, GitHub and LinkedIn."
/>

<div class="container page">
	<Rail label="Get In Touch" id="contact" level={1} closeHref="/">
		<!-- <p class="lede enter" style="--i: 0">
			The fastest way to reach me is email.
		</p> -->

		<dl class="channels">
			{#each contacts as channel (channel.href)}
				<div class="channel">
					<dt class="label">{channel.label}</dt>
					<dd>
						<a
							class="channel__link"
							href={channel.href}
							target={isExternal(channel.href) ? '_blank' : undefined}
							rel={isExternal(channel.href) ? 'noreferrer noopener' : undefined}
						>
							<Icon name={channel.icon} size={16} />
							<span class="channel__value">{channel.value}</span>
							{#if isExternal(channel.href)}
								<Icon name="external" size={13} />
							{/if}
						</a>
					</dd>
				</div>
			{/each}
		</dl>

		<p class="note">
			Based in Bavaria, Germany. Currently in Dublin, Ireland.
		</p>
	</Rail>

	<AsciiWall />
</div>

<style>
	.channels {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
		gap: var(--s-5) var(--s-6);
		max-width: 680px;
	}

	.channel {
		display: grid;
		gap: var(--s-2);
		min-width: 0;
	}

	.channel dd {
		margin: 0;
		min-width: 0;
	}

	.channel__link {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
		min-height: 44px;
		color: var(--accent);
		text-decoration: none;
		font-size: 1rem;
		max-width: 100%;
	}

	.channel__link :global(svg) {
		flex: none;
	}

	.channel__value {
		text-decoration: underline;
		text-underline-offset: 0.2em;
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.channel__link:active {
		background: var(--ink);
		color: var(--paper);
	}

	.channel__link:focus-visible {
		outline: 2px dotted var(--ink);
		outline-offset: 2px;
	}

	.note {
		margin-top: var(--s-5);
		padding-top: var(--s-4);
		border-top: 1px dotted var(--ink);
		font-size: 1rem;
		color: var(--text-secondary);
		max-width: var(--measure);
	}
</style>
