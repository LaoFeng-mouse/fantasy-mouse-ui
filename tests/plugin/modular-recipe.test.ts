import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const base = () => ({
  protocolVersion: 2, id: 'character-preview', title: 'Character preview',
  characterId: 'fantasy-mouse-canonical',
  identityAnchors: ['approved-expression-family', 'photographic-face-drawn-body-contrast', 'recognizable-family-proportions', 'one-coherent-hand-pair', 'earnest-absurd-dreamer'],
  persona: 'maker', theme: 'local-editor', surfaces: ['desktop'], participation: 'standard',
  states: { ready: { fantasyRole: 'Maker', expression: 'Closed mouth', pose: 'Flex', handMode: 'action', props: [], bubble: 'hide', copy: 'Ready', faceAssetId: 'calm', bodyVariantId: 'muscular', motionId: 'react' } },
  rights: { publicExport: false, assetIds: ['calm'] }, qa: { visual: false, accessibility: false, editable: true },
  character: { facePolicy: 'reuse-approved-source', headPolicy: 'preserve-source-silhouette', headReference: { path: 'assets/head.png', sha256: '2'.repeat(64), sourceWidth: 400, sourceHeight: 268, source: 'bundled', useScope: 'local-project' }, faceAssets: [{ id: 'calm', path: 'assets/faces.png', sha256: '0'.repeat(64), expression: 'Closed mouth', intensity: 'calm', source: 'user-supplied', quality: 'preview', useScope: 'local-project', sourceWidth: 631, sourceHeight: 573, displayWidth: 180, crop: { x: 120, y: 13, width: 100, height: 100 } }], bodyVariants: [{ id: 'muscular', build: 'Muscular', outfit: 'Plain', pose: 'Flex', handMode: 'action', attachment: 'Centered neckline', asset: { path: 'assets/body.png', sha256: '1'.repeat(64), sourceWidth: 512, sourceHeight: 1024, source: 'generated', useScope: 'local-project' }, faceFrame: { x: 0.2, y: 0.2, width: 0.5, height: 0.3 } }], layerOrder: ['body', 'face', 'hands'] },
  productStyle: { evidence: ['Existing editor'], hierarchy: 'Canvas and tools', typography: 'Readable', layout: 'Adaptive', tokens: 'Existing product', responsive: 'Stack controls', accessibility: 'Keyboard and reduced motion' },
  components: [{ id: 'export', role: 'button', states: ['ready','pending','success','error'], keyboard: 'Enter/Space', feedback: 'Text status' }],
  motion: [{ id: 'react', trigger: 'Preview click', property: 'transform', durationMs: 240, easing: 'ease-out', interrupt: 'Cancel on next action', repeat: 'once', reducedMotion: 'Immediate state change' }],
});

async function invoke(recipe: unknown) {
  const dir = await mkdtemp(join(tmpdir(), 'mouse-recipe-'));
  try {
    const file = join(dir, 'recipe.json');
    await writeFile(file, JSON.stringify(recipe));
    try {
      const { stdout } = await exec(process.execPath, ['plugins/fantasy-mouse-ui/scripts/validate-workflow.mjs', '--recipe', file], { windowsHide: true });
      return { ok: true, payload: JSON.parse(stdout) };
    } catch (error) {
      const failure = error as Error & { stderr: string };
      expect(Buffer.byteLength(failure.stderr)).toBeLessThanOrEqual(1024);
      expect(failure.stderr).not.toContain(dir);
      return { ok: false, payload: JSON.parse(failure.stderr) };
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
}

describe('modular recipes used by downstream Agents', () => {
  it('accepts a closed-mouth face on a muscular body with explicit preview limits', async () => {
    expect(await invoke(base())).toMatchObject({ ok: true, payload: { protocolVersion: 2, validation: 'metadata-only' } });
  });
  it('accepts a red strong expression without changing identity anchors', async () => {
    const recipe = base(); recipe.character.faceAssets[0]!.expression = 'Red angry face'; recipe.character.faceAssets[0]!.intensity = 'strong';
    expect((await invoke(recipe)).ok).toBe(true);
  });
  it.each([
    ['missing face', (r: ReturnType<typeof base>) => { r.states.ready.faceAssetId = 'missing'; }],
    ['missing body', (r: ReturnType<typeof base>) => { r.states.ready.bodyVariantId = 'missing'; }],
    ['missing motion', (r: ReturnType<typeof base>) => { r.states.ready.motionId = 'missing'; }],
    ['conflicting hands', (r: ReturnType<typeof base>) => { r.states.ready.handMode = 'default-clasped'; }],
    ['duplicate face', (r: ReturnType<typeof base>) => { r.character.faceAssets.push({ ...r.character.faceAssets[0]! }); }],
    ['crop outside source', (r: ReturnType<typeof base>) => { r.character.faceAssets[0]!.crop.x = 600; }],
    ['unsupported production enlargement', (r: ReturnType<typeof base>) => { r.character.faceAssets[0]!.quality = 'production'; }],
    ['local image in public export', (r: ReturnType<typeof base>) => { r.rights.publicExport = true; }],
    ['asset path escape', (r: ReturnType<typeof base>) => { r.character.faceAssets[0]!.path = '../faces.png'; }],
    ['NUL face path', (r: ReturnType<typeof base>) => { r.character.faceAssets[0]!.path = 'assets/face\0.png'; }],
    ['NUL body path', (r: ReturnType<typeof base>) => { r.character.bodyVariants[0]!.asset.path = 'assets/body\0.png'; }],
    ['attachment outside artboard', (r: ReturnType<typeof base>) => { r.character.bodyVariants[0]!.faceFrame.x = 0.9; }],
    ['geometric head policy', (r: ReturnType<typeof base>) => { r.character.headPolicy = 'circle-avatar'; }],
    ['invalid head source path', (r: ReturnType<typeof base>) => { r.character.headReference.path = 'head\0.png'; }],
    ['blank reduced motion contract', (r: ReturnType<typeof base>) => { r.motion[0]!.reducedMotion = ' '; }],
    ['too many repetitions', (r: ReturnType<typeof base>) => { r.motion[0]!.repeat = 'forever'; }],
  ])('rejects %s before use', async (_name, change) => {
    const recipe = base(); change(recipe); expect((await invoke(recipe)).ok).toBe(false);
  });
  it('keeps legacy v1 recipes valid without requiring modular assets', async () => {
    const recipe = base();
    const schema = JSON.parse(await readFile('plugins/fantasy-mouse-ui/protocol/mouse-ui-project.schema.json','utf8'));
    const { character, productStyle, components, motion, ...legacy } = recipe;
    const { faceAssetId, bodyVariantId, motionId, ...legacyState } = recipe.states.ready;
    expect((await invoke({ ...legacy, protocolVersion: 1, identityAnchors: schema.allOf[0].then.properties.identityAnchors.prefixItems.map((x: { const: string }) => x.const), states: { ready: legacyState } })).ok).toBe(true);
  });
  it.each([null, [], 12, { protocolVersion: 2 }, { ...base(), character: null }])('rejects malformed input with bounded JSON', async (recipe) => {
    expect((await invoke(recipe)).ok).toBe(false);
  });
});
