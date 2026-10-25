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

<AsciiWall />

<style>
	/* Each channel is a ruled row: label on the left, address set large on the right. */
	.channels {
		margin: 0;
		display: grid;
		gap: 0;
	}

	.channel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2.4fr);
		gap: var(--s-4);
		align-items: center;
		min-width: 0;
		padding: var(--s-3) 0;
		border-top: 1px solid var(--line-strong);
	}

	.channel:last-child {
		border-bottom: 1px solid var(--line-strong);
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
		color: var(--text);
		text-decoration: none;
		font-size: clamp(1.125rem, 2.2vw, 1.625rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		max-width: 100%;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.channel__value {
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			color: var(--accent);
		}
		.channel__link:hover .channel__value {
			text-decoration: underline;
			text-decoration-thickness: 2px;
			text-underline-offset: 0.2em;
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
		margin-top: var(--s-5);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-muted);
		max-width: var(--measure);
	}

	@media (max-width: 767px) {
		.channel {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
		}
	}
</style>
