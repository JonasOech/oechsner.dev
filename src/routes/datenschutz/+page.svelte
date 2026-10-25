<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import { impressum, privacy, site } from '$lib/data/site';
	import { GA_MEASUREMENT_ID, reopenConsent } from '$lib/consent.svelte';

	/**
	 * Datenschutzerklärung under Art. 13 DSGVO — the page the consent banner links to, and
	 * the reason it can ask for anything at all: consent is only valid if the visitor was
	 * told what they are agreeing to first.
	 *
	 * German, for the same reason the Impressum is (DESIGN.md §10, deviation 5): the duty
	 * arises under German law and the text has to be intelligible to the people it
	 * protects. It reuses the Impressum's `.legal` styling unchanged.
	 *
	 * Note what is *not* here: the postal address. DESIGN.md §8, Don't #10 keeps it on
	 * `/impressum` alone, and Art. 13 Abs. 1 lit. a is satisfied by naming the controller
	 * and pointing at the full details one link away on the same site.
	 *
	 * This describes what the code actually does. If the code changes — a new processor, a
	 * different retention setting — this text is wrong until it is changed too.
	 */
	const formattedDate = new Date(`${privacy.updated}T00:00:00Z`).toLocaleDateString('de-DE', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});

	/** GA4 writes one cookie per property alongside the generic `_ga`. */
	const propertyCookie = `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, '')}`;
</script>

<Seo
	title="Datenschutz"
	description="Datenschutzerklärung nach Art. 13 DSGVO für oechsner.dev — Hosting, Reichweitenmessung und Einwilligung."
/>

<div class="container page">
	<Rail label="Datenschutz" id="datenschutz" level={1} closeHref="/">
		<div class="legal" lang="de">
			<section>
				<h2 class="legal__h">Verantwortlicher</h2>
				<p>
					Verantwortlich für die Datenverarbeitung auf dieser Website ist
					{impressum.legalName}, erreichbar unter
					<a class="link" href="mailto:{impressum.email}">{impressum.email}</a>. Die
					vollständige Anschrift steht im <a class="link" href="/impressum">Impressum</a>.
				</p>
				<p>
					{site.url.replace('https://', '')} ist eine private, nicht kommerzielle Website. Es
					gibt kein Nutzerkonto, kein Kontaktformular, keinen Newsletter und keine Werbung.
					Es findet keine automatisierte Entscheidungsfindung und kein Profiling statt.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Hosting und Server-Logs</h2>
				<p>
					Die Website wird von der Cloudflare, Inc., 101 Townsend St., San Francisco, CA
					94107, USA über deren Dienst „Pages“ ausgeliefert. Beim Abruf jeder Seite
					verarbeitet Cloudflare technisch notwendige Verbindungsdaten: IP-Adresse,
					Zeitpunkt der Anfrage, abgerufene Adresse, HTTP-Statuscode, übertragene
					Datenmenge, Referrer und User-Agent. Diese Daten sind erforderlich, um die Seite
					überhaupt zustellen und Angriffe abwehren zu können.
				</p>
				<p>
					Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt im
					sicheren und störungsfreien Betrieb der Website. Mit Cloudflare besteht ein
					Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Die Übermittlung in die USA ist
					durch die Standardvertragsklauseln der EU-Kommission abgesichert; Cloudflare ist
					zudem unter dem EU-US Data Privacy Framework zertifiziert. Ich selbst habe keinen
					Zugriff auf diese Logdaten.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Google Analytics — nur mit Ihrer Einwilligung</h2>
				<p>
					Diese Website kann Google Analytics 4 einsetzen, einen Dienst der Google Ireland
					Limited, Gordon House, Barrow Street, Dublin 4, Irland. Google Analytics wird
					<strong>erst geladen, nachdem Sie im Hinweisbanner zugestimmt haben</strong>. Ohne
					Ihre Zustimmung wird kein Skript von Google nachgeladen, es werden keine Cookies
					gesetzt und es werden keine Daten an Google übermittelt.
				</p>
				<p>
					Stimmen Sie zu, erhebt Google Analytics insbesondere: aufgerufene Seiten und
					Seitentitel, Verweildauer und Scrolltiefe, Herkunft des Besuchs (Referrer),
					Gerätetyp, Bildschirmauflösung, Betriebssystem und Browser sowie einen aus der
					IP-Adresse abgeleiteten ungefähren Standort (in der Regel auf Stadtebene). Dabei
					werden die Cookies <code>_ga</code> und <code>{propertyCookie}</code> gesetzt, die
					eine pseudonyme Kennung enthalten und über die ein wiederkehrender Besuch als
					derselbe erkannt wird. Die IP-Adresse wird von Google gekürzt und nicht dauerhaft
					gespeichert.
				</p>
				<p>
					Rechtsgrundlage für das Speichern und Auslesen der Cookies ist § 25 Abs. 1 TTDSG,
					für die anschließende Verarbeitung Ihre Einwilligung nach Art. 6 Abs. 1 lit. a
					DSGVO. Eine Übermittlung an die Google LLC in den USA kann nicht ausgeschlossen
					werden; sie stützt sich auf die Standardvertragsklauseln und die Zertifizierung
					von Google unter dem EU-US Data Privacy Framework.
				</p>
				<p>
					Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen —
					über den Link „Cookie settings“ im Seitenfuß oder
					<button type="button" class="legal__inline-btn" onclick={reopenConsent}>
						direkt hier
					</button>. Beim Widerruf werden die gesetzten Analytics-Cookies gelöscht und der
					Dienst für künftige Seitenaufrufe nicht mehr geladen. Die Rechtmäßigkeit der bis
					dahin erfolgten Verarbeitung bleibt davon unberührt.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Eigene Zählung der Feed-Abonnements</h2>
				<p>
					Unabhängig von Google zähle ich, wie oft die Schaltflächen zum Abonnieren des
					RSS- beziehungsweise Atom-Feeds betätigt werden. Übermittelt werden dabei
					ausschließlich zwei Angaben aus einer festen Liste: welche Schaltfläche gedrückt
					wurde und an welcher Stelle der Seite sie steht. Es werden keine Cookies gesetzt,
					keine Kennung vergeben und keine IP-Adresse gespeichert; die Einzelwerte lassen
					sich keiner Person zuordnen und werden nur als Summe ausgewertet.
				</p>
				<p>
					Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO — das
					berechtigte Interesse besteht darin, zu erkennen, ob dieses Angebot genutzt wird.
					Da auf Ihrem Endgerät nichts gespeichert und nichts ausgelesen wird, greift § 25
					TTDSG nicht, und diese Zählung läuft deshalb auch ohne Einwilligung.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Schriftarten</h2>
				<p>
					Die Website verwendet die Schriftarten „Pixelify Sans“, „Atkinson Hyperlegible“ und
					„JetBrains Mono“. Sie werden von den eigenen Servern dieser Website ausgeliefert
					(lokal eingebunden); beim Abruf der Schriftdateien wird keine Verbindung zu
					Servern Dritter hergestellt und keine IP-Adresse an Dritte übertragen.
					Rechtsgrundlage für die dabei ohnehin anfallende Verarbeitung im Rahmen der
					Auslieferung dieser Website ist Art. 6 Abs. 1 lit. f DSGVO.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Speicherung auf Ihrem Endgerät</h2>
				<p>
					Ihre Entscheidung über Google Analytics wird im lokalen Speicher
					(<code>localStorage</code>) Ihres Browsers unter dem Schlüssel
					<code>consent.analytics.v1</code> abgelegt, zusammen mit dem Zeitpunkt der
					Entscheidung. Nur so lässt sich vermeiden, dass Sie bei jedem Seitenaufruf erneut
					gefragt werden. Dieser Eintrag ist technisch erforderlich im Sinne von § 25 Abs. 2
					Nr. 2 TTDSG, verlässt Ihren Browser nicht und wird nach einem Jahr als abgelaufen
					behandelt — danach fragt das Banner erneut. Sie können ihn jederzeit über die
					Einstellungen Ihres Browsers löschen.
				</p>
			</section>

			<section>
				<h2 class="legal__h">Ihre Rechte</h2>
				<p>
					Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO),
					Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und
					Datenübertragbarkeit (Art. 20 DSGVO). Verarbeitungen auf Grundlage eines
					berechtigten Interesses können Sie nach Art. 21 DSGVO widersprechen; erteilte
					Einwilligungen können Sie nach Art. 7 Abs. 3 DSGVO jederzeit widerrufen. Wenden
					Sie sich dafür an
					<a class="link" href="mailto:{impressum.email}">{impressum.email}</a>.
				</p>
				<p>
					Unabhängig davon steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu
					(Art. 77 DSGVO). Zuständig ist das Bayerische Landesamt für Datenschutzaufsicht,
					Promenade 18, 91522 Ansbach.
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
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
	}

	.legal p {
		color: var(--text-secondary);
	}

	.legal code {
		font-family: var(--font-mono);
		font-size: 0.8125em;
		color: var(--text);
		overflow-wrap: anywhere;
	}

	/* A button that has to sit inside a sentence, because the action it triggers belongs
	   where the widening of consent is described. Styled as the prose link it stands in
	   for; the inline exception in DESIGN.md §9 covers its hit area. */
	.legal__inline-btn {
		appearance: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	@media (hover: hover) and (pointer: fine) {
		.legal__inline-btn:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.legal__inline-btn:active {
		background: var(--ink);
		color: var(--paper);
	}

	.legal__inline-btn:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}

	.legal__updated {
		margin-top: var(--s-2);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}
</style>
