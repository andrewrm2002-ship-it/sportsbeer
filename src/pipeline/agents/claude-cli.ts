import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TIMEOUT_MS = 120_000; // 2 minutes per call
const MAX_RETRIES = 2;

/**
 * Call Claude via the CLI using the user's Max subscription.
 * Returns the raw text response.
 */
export async function callClaude(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await execClaude(prompt);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        const delayMs = 2000 * (attempt + 1);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  throw lastError ?? new Error('Claude CLI call failed');
}

function execClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Write prompt to a temp file to avoid shell argument length limits
    const tmpFile = path.join(
      os.tmpdir(),
      `claude-prompt-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`,
    );
    fs.writeFileSync(tmpFile, prompt, 'utf-8');

    const child = spawn(
      'claude',
      ['-p', '--output-format', 'text'],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        timeout: TIMEOUT_MS,
        env: (() => { const e = { ...process.env }; delete e.CLAUDECODE; return e; })(),
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Pipe the prompt file content to stdin
    const promptContent = fs.readFileSync(tmpFile, 'utf-8');
    child.stdin.write(promptContent);
    child.stdin.end();

    child.on('close', (code) => {
      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch {}

      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}${stderr ? `\n${stderr}` : ''}`));
        return;
      }
      resolve(stdout.trim());
    });

    child.on('error', (err) => {
      try { fs.unlinkSync(tmpFile); } catch {}
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });

    // Safety timeout
    setTimeout(() => {
      try { child.kill(); } catch {}
      try { fs.unlinkSync(tmpFile); } catch {}
      reject(new Error('Claude CLI timed out'));
    }, TIMEOUT_MS + 5000);
  });
}

/**
 * Call Claude and parse the response as JSON.
 * Extracts JSON from markdown code blocks if present.
 */
export async function callClaudeJSON<T>(prompt: string): Promise<T> {
  const raw = await callClaude(prompt);

  // Try to extract JSON from code blocks first
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1]!.trim() : raw;

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Try to find any JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error(`Failed to parse Claude response as JSON:\n${raw.slice(0, 500)}`);
  }
}

/**
 * Run multiple Claude calls in parallel with concurrency control.
 */
export async function callClaudeParallel<T>(
  calls: { prompt: string; parse: (raw: string) => T }[],
  concurrency: number = 3,
): Promise<{ result?: T; error?: string }[]> {
  const results: { result?: T; error?: string }[] = [];

  for (let i = 0; i < calls.length; i += concurrency) {
    const batch = calls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(async (call) => {
        const raw = await callClaude(call.prompt);
        return call.parse(raw);
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push({ result: r.value });
      } else {
        results.push({ error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
      }
    }
  }

  return results;
}
