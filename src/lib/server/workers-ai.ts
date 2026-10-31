/**
 * Works around a bug in workers-ai-provider 4.0.1 (cloudflare/agents#2482; fixes pending in
 * cloudflare/ai#615 and #663). Workers AI streams some models — Qwen3 among them — in a dual
 * format: each SSE event carries its text twice, once in the native `response` field and once
 * as OpenAI-style `choices[0].delta.content`, and tool-call fragments likewise in both
 * `tool_calls` and `choices[0].delta.tool_calls`. The provider reads both, so every token came
 * out doubled ("HiHi!! I I'm'm") and tool-call arguments stopped being valid JSON.
 *
 * `singleCopy` wraps the binding so streams from `run()` reach the provider with the native
 * copy removed wherever the same event already carries it in `choices[0].delta`. It compares
 * the two copies inside one event, never text across events, so a word the model really
 * repeats stays repeated. Delete this once the provider ships the fix.
 */
export function singleCopy(ai: Ai): Ai {
	return new Proxy(ai, {
		get(target, prop) {
			const value: unknown = Reflect.get(target, prop);
			if (typeof value !== 'function') return value;
			if (prop !== 'run') return value.bind(target);
			return async (...args: unknown[]) => {
				const out: unknown = await value.apply(target, args);
				return out instanceof ReadableStream ? out.pipeThrough(dedupeEvents()) : out;
			};
		}
	});
}

/** Rewrites an SSE byte stream line by line; event boundaries and `[DONE]` pass through. */
function dedupeEvents(): TransformStream<Uint8Array | string, Uint8Array> {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = '';

	return new TransformStream({
		transform(chunk, controller) {
			buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
			let end: number;
			while ((end = buffer.indexOf('\n')) !== -1) {
				controller.enqueue(encoder.encode(`${fixLine(buffer.slice(0, end))}\n`));
				buffer = buffer.slice(end + 1);
			}
		},
		flush(controller) {
			buffer += decoder.decode();
			if (buffer) controller.enqueue(encoder.encode(fixLine(buffer)));
		}
	});
}

/** One SSE line. Anything but a parseable JSON `data:` line is returned unchanged. */
export function fixLine(line: string): string {
	const data = /^data:\s?(.*?)\r?$/.exec(line)?.[1];
	if (!data || data === '[DONE]') return line;

	let event: unknown;
	try {
		event = JSON.parse(data);
	} catch {
		return line;
	}
	return isRecord(event) && fixEvent(event) ? `data: ${JSON.stringify(event)}` : line;
}

/** Returns whether the event changed. */
function fixEvent(event: Record<string, unknown>): boolean {
	const choices = event.choices;
	const delta: unknown = Array.isArray(choices) ? choices[0]?.delta : undefined;
	if (!isRecord(delta)) return false;

	let changed = false;

	// A bare number ("3", "2026") can arrive as a JSON number. The provider reads `response`
	// through String() but skips a non-string delta, so once `response` goes it has to be a
	// string here (the same bug as cloudflare/ai#655).
	const copies: string[] = [];
	for (const key of ['content', 'reasoning_content', 'reasoning']) {
		if (typeof delta[key] === 'number') {
			delta[key] = String(delta[key]);
			changed = true;
		}
		if (typeof delta[key] === 'string' && delta[key] !== '') copies.push(delta[key]);
	}

	const native = event.response;
	if ((typeof native === 'string' || typeof native === 'number') && copies.includes(String(native))) {
		delete event.response;
		changed = true;
	}

	if (Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0 && 'tool_calls' in event) {
		delete event.tool_calls;
		changed = true;
	}

	return changed;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
