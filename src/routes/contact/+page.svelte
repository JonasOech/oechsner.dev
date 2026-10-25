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
	.lede {
		padding-top: var(--s-2);
		margin-bottom: var(--s-8);
	}

	.channels {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
		gap: var(--s-6) var(--s-7);
		max-width: 640px;
	}

	/* Each channel is a business card pinned down with a strip of tape. */
	.channel {
		position: relative;
		display: grid;
		gap: var(--s-2);
		min-width: 0;
		padding: var(--s-4) var(--s-5);
		background: var(--surface);
		border: 2px solid var(--text);
		box-shadow: 4px 4px 0 var(--text);
		transform: rotate(-0.7deg);
	}

	.channel:nth-child(even) {
		transform: rotate(0.6deg);
	}

	.channel::before {
		content: '';
		position: absolute;
		top: -0.7rem;
		left: 50%;
		width: 4.5rem;
		height: 1.4rem;
		margin-left: -2.25rem;
		background: rgba(var(--accent-rgb), 0.6);
		clip-path: var(--tape-cut);
		mix-blend-mode: multiply;
		transform: rotate(-3deg);
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
		color: var(--text);
		text-decoration: none;
		font-family: var(--font-type);
		font-size: 1.0625rem;
		max-width: 100%;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.channel__value {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		text-decoration-color: rgba(var(--blue-rgb), 0.5);
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			color: var(--blue);
		}
		.channel__link:hover .channel__value {
			text-decoration-color: var(--blue);
			background: var(--accent-wash);
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
		margin-top: var(--s-6);
		font-family: var(--font-marker);
		font-size: 1.25rem;
		color: var(--blue);
		max-width: var(--measure);
		transform: rotate(-1deg);
	}
</style>
