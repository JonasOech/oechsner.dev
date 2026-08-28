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
		<p class="lede enter" style="--i: 0">
			The fastest way to reach me is email.
		</p>

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
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		text-decoration: none;
		font-size: 0.9375rem;
		max-width: 100%;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.channel__value {
		background-image: linear-gradient(var(--accent), var(--accent));
		background-size: 0% 1px;
		background-repeat: no-repeat;
		background-position: 0 100%;
		transition: background-size 280ms var(--ease-out);
		overflow-wrap: anywhere;
	}

	@media (hover: hover) and (pointer: fine) {
		.channel__link:hover {
			color: var(--accent);
		}
		.channel__link:hover .channel__value {
			background-size: 100% 1px;
		}
	}

	.channel__link:active {
		color: var(--accent-dim);
	}

	.channel__link:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	.note {
		margin-top: var(--s-8);
		font-size: 0.8125rem;
		color: var(--text-muted);
		max-width: var(--measure);
	}
</style>
