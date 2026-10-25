<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Rail from '$lib/components/Rail.svelte';
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
	<Rail label="Get In Touch" id="contact" level={1} wide>
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

<style>
	.channels {
		margin: 0;
		display: grid;
		gap: var(--s-4);
	}

	.channel {
		display: grid;
		grid-template-columns: 7.5rem minmax(0, 1fr);
		gap: var(--s-3);
		align-items: baseline;
		min-width: 0;
	}

	.channel dd {
		margin: 0;
		min-width: 0;
	}

	.channel__link {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--accent);
		max-width: 100%;
	}

	.channel__link :global(svg) {
		flex: none;
	}

	.channel__value {
		text-decoration: underline;
		text-decoration-color: rgba(var(--accent-rgb), 0.45);
		text-underline-offset: 0.2em;
		text-decoration-thickness: 1px;
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			color: var(--accent-dim);
		}
		.channel__link:hover .channel__value {
			text-decoration-color: currentColor;
		}
	}

	.channel__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.note {
		margin-top: var(--s-6);
		font-size: 1rem;
		font-style: italic;
		color: var(--text-muted);
		max-width: var(--measure);
	}

	@media (max-width: 479px) {
		.channel {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
		}
	}
</style>
