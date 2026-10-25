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

<div class="container">
	<Rail label="Get In Touch" id="contact" level={1}>
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
</div>

<AsciiWall />

<style>
	.channels {
		margin: 0;
		display: grid;
	}

	.channel {
		display: grid;
		grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
		gap: var(--s-2) var(--col-gap);
		align-items: center;
		min-width: 0;
		border-top: 1px solid var(--line);
	}

	.channel:first-child {
		border-top: 0;
	}

	.channel:last-child {
		border-bottom: 1px solid var(--line);
	}

	.channel dd {
		margin: 0;
		min-width: 0;
	}

	.channel__link {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 52px;
		color: var(--text);
		text-decoration: none;
		font-size: 1rem;
		max-width: 100%;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.channel__link :global(svg) {
		color: var(--accent);
		flex: none;
	}

	.channel__value {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-decoration-color: transparent;
		text-underline-offset: 0.22em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			color: var(--accent);
		}
		.channel__link:hover .channel__value {
			text-decoration-color: currentColor;
		}
	}

	.channel__link:active {
		color: var(--accent-dim);
	}

	.channel__link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.note {
		margin-top: var(--s-4);
		font-size: 0.8125rem;
		color: var(--text-muted);
		max-width: var(--measure);
	}

	@media (max-width: 599px) {
		.channel {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
			padding-top: var(--s-3);
		}
	}
</style>
