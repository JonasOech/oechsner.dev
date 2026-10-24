<script lang="ts">
	/**
	 * A cinnabar name seal, stamped. The letters J and Ö are cut out of
	 * the square (a mask, so the page shows through them on any ground), and a turbulence
	 * filter roughens the edge and knocks out specks the way paste fails to take on paper.
	 */
	let { size = '1.05em' }: { size?: string } = $props();

	const uid = $props.id();
	const mask = `seal-mask-${uid}`;
	const rough = `seal-rough-${uid}`;
</script>

<svg class="seal" viewBox="0 0 40 40" style="width: {size}; height: {size}" aria-hidden="true" focusable="false">
	<defs>
		<mask id={mask}>
			<rect width="40" height="40" fill="#fff" />
			<rect x="6.2" y="6.2" width="27.6" height="27.6" rx="1.5" fill="none" stroke="#000" stroke-width="1.3" />
			<text x="13.4" y="27.6" text-anchor="middle" font-size="19" font-weight="700" fill="#000">J</text>
			<text x="26.4" y="27.6" text-anchor="middle" font-size="17" font-weight="700" fill="#000">Ö</text>
		</mask>
		<filter id={rough} x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="t" />
			<feDisplacementMap in="SourceGraphic" in2="t" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="d" />
			<feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="3" result="s" />
			<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 4.6" result="holes" />
			<feComposite in="d" in2="holes" operator="in" />
		</filter>
	</defs>
	<g filter="url(#{rough})">
		<rect x="2.5" y="2.5" width="35" height="35" rx="3" class="seal__paste" mask="url(#{mask})" />
	</g>
</svg>

<style>
	.seal {
		display: inline-block;
		vertical-align: -0.18em;
		font-family: var(--font-display);
	}

	.seal__paste {
		fill: var(--seal);
	}
</style>
