<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import { impressum, site } from '$lib/data/site';

	/**
	 * Impressum under § 5 DDG (Digitale-Dienste-Gesetz, which replaced § 5 TMG in 2024)
	 * and § 18 Abs. 2 MStV for the blog's journalistic-editorial content.
	 *
	 * Written in German on purpose: the duty exists under German law and the text has to
	 * be intelligible to the audience it protects, so an English translation is not a
	 * substitute. This is the one deliberate exception to the site's English-only rule.
	 */
	const formattedDate = new Date(`${impressum.updated}T00:00:00Z`).toLocaleDateString('de-DE', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
</script>

<Seo
	title="Impressum"
	description="Impressum und Anbieterkennzeichnung nach § 5 DDG für oechsner.dev."
/>

<svelte:head>
	<!-- § 5 DDG requires the page be *reachable*, not indexed. Keeping the street address
	     out of search results while still letting crawlers follow the site's own links. -->
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="container">
	<Rail label="Impressum" id="impressum" level={1}>
		<div class="legal" lang="de">
			<section>
				<h2 class="legal__h">Angaben gemäß § 5 DDG</h2>
				<address>
					{impressum.legalName}<br />
					{impressum.street}<br />
					{impressum.postalCode}
					{impressum.city}<br />
					{impressum.country}
				</address>
			</section>

			<section>
				<h2 class="legal__h">Kontakt</h2>
				<dl class="legal__dl">
					<div>
						<dt>Telefon</dt>
						<dd><a class="link" href={impressum.phoneHref}>{impressum.phone}</a></dd>
					</div>
					<div>
						<dt>E-Mail</dt>
						<dd><a class="link" href="mailto:{impressum.email}">{impressum.email}</a></dd>
					</div>
				</dl>
			</section>

			<section>
				<h2 class="legal__h">
					Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
				</h2>
				<address>
					{impressum.responsibleForContent}<br />
					{impressum.street}<br />
					{impressum.postalCode}
					{impressum.city}
				</address>
			</section>

			<section>
				<h2 class="legal__h">Art des Angebots</h2>
				<p>
					Bei {site.url.replace('https://', '')} handelt es sich um eine private, nicht
					kommerzielle Website. Es werden keine Waren oder Dienstleistungen angeboten, keine
					Werbung geschaltet und keine Einnahmen erzielt.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Streitbeilegung</h2>
				<p>
					Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
					Verbraucherschlichtungsstelle teilzunehmen.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Haftung für Inhalte</h2>
				<p>
					Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
					nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als
					Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
					Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
					Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
					Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
					Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
					möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werde ich diese Inhalte
					umgehend entfernen.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Haftung für Links</h2>
				<p>
					Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen
					Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen.
					Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
					der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
					mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum Zeitpunkt der
					Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten
					ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden
					von Rechtsverletzungen werde ich derartige Links umgehend entfernen.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Urheberrecht</h2>
				<p>
					Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
					dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
					der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
					Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
					nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
					dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter
					beachtet und als solche gekennzeichnet.
				</p>
			</section>

			<p class="legal__updated">Stand: {formattedDate}</p>
		</div>
	</Rail>
</div>

<style>
	.legal {
		display: grid;
		gap: var(--s-7);
		/* German legal prose is dense; keep the measure and leading generous. */
		max-width: var(--measure);
		line-height: 1.8;
	}

	.legal section {
		display: grid;
		gap: var(--s-3);
	}

	.legal__h {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.4;
		color: var(--text);
	}

	.legal address {
		font-style: normal;
		color: var(--text-secondary);
	}

	.legal__dl {
		margin: 0;
		display: grid;
		gap: var(--s-2);
	}

	.legal__dl > div {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr);
		gap: var(--s-4);
		align-items: baseline;
	}

	.legal__dl dt {
		color: var(--text-muted);
		font-family: var(--font-sans);
		font-size: 0.8125rem;
	}

	.legal__dl dd {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.legal__updated {
		margin-top: var(--s-2);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	@media (max-width: 479px) {
		.legal__dl > div {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-1);
		}
	}
</style>
