import { constants } from "node:fs";
import { lstat, open, readFile } from "node:fs/promises";

const MAX_INPUT_BYTES = 1024 * 1024;
const OPEN_FLAGS =
  constants.O_RDONLY |
  (constants.O_NONBLOCK ?? 0) |
  (constants.O_NOFOLLOW ?? 0);
const MAX_ERRORS = 8;
const MAX_ITEMS = 256;
const MAX_OUTPUT_BYTES = 1024;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROOT_KEYS = new Set([
  "protocolVersion",
  "id",
  "purpose",
  "users",
  "entities",
  "screens",
  "actions",
  "states",
  "primaryJourney",
  "surfaces",
  "constraints",
]);
const REQUIRED_KEYS = [...ROOT_KEYS];
const SCREEN_KEYS = new Set(["id", "purpose"]);
const ACTION_KEYS = new Set(["id", "label", "kind", "from", "to"]);
const ACTION_KINDS = new Set(["primary", "secondary", "destructive", "recovery", "utility", "navigation"]);

function emitFailure(code, errors = []) {
  const payload = {
    ok: false,
    code,
    errors: errors.slice(0, MAX_ERRORS).map((message) => String(message).slice(0, 120)),
  };
  let output = `${JSON.stringify(payload)}\n`;
  if (Buffer.byteLength(output) > MAX_OUTPUT_BYTES) {
    output = `${JSON.stringify({ ok: false, code, errors: ["validation output truncated"] })}\n`;
  }
  process.stderr.write(output);
  process.exitCode = 1;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function recordError(errors, message) {
  if (errors.length < MAX_ERRORS) errors.push(message);
}

function unknownKeys(value, allowed, location, errors) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) recordError(errors, `${location} contains an unknown property`);
    if (errors.length >= MAX_ERRORS) break;
  }
}

function requireKeys(value, required, location, errors) {
  for (const key of required) {
    if (!Object.hasOwn(value, key)) recordError(errors, `${location} is missing '${key}'`);
    if (errors.length >= MAX_ERRORS) break;
  }
}

function requireText(value, location, errors) {
  if (typeof value !== "string" || value.trim().length === 0) recordError(errors, `${location} must be non-empty text`);
}

function requireId(value, location, errors) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) recordError(errors, `${location} must be lower-case hyphen-case`);
}

function validateIdArray(value, location, { minItems = 1 } = {}, errors) {
  if (!Array.isArray(value)) {
    recordError(errors, `${location} must be an array`);
    return [];
  }
  if (value.length < minItems) recordError(errors, `${location} must contain at least ${minItems} item`);
  if (value.length > MAX_ITEMS) {
    recordError(errors, `${location} must contain at most ${MAX_ITEMS} items`);
    return [];
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (errors.length >= MAX_ERRORS) return;
    requireId(item, `${location}[${index}]`, errors);
    if (typeof item === "string" && seen.has(item)) recordError(errors, `${location} contains a duplicate id`);
    seen.add(item);
  });
  return value;
}

function validateTextArray(value, location, errors) {
  if (!Array.isArray(value)) {
    recordError(errors, `${location} must be an array`);
    return;
  }
  if (value.length > MAX_ITEMS) {
    recordError(errors, `${location} must contain at most ${MAX_ITEMS} items`);
    return;
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (errors.length >= MAX_ERRORS) return;
    requireText(item, `${location}[${index}]`, errors);
    if (typeof item === "string" && seen.has(item)) recordError(errors, `${location} contains duplicate value`);
    seen.add(item);
  });
}

function validateBrief(brief) {
  const errors = [];
  if (!isRecord(brief)) return ["workflow brief must be an object"];

  unknownKeys(brief, ROOT_KEYS, "workflow brief", errors);
  requireKeys(brief, REQUIRED_KEYS, "workflow brief", errors);
  if (brief.protocolVersion !== 1) recordError(errors, "protocolVersion must equal 1");
  requireId(brief.id, "id", errors);
  requireText(brief.purpose, "purpose", errors);
  validateIdArray(brief.users, "users", {}, errors);
  validateIdArray(brief.entities, "entities", {}, errors);
  const states = validateIdArray(brief.states, "states", {}, errors);
  const journey = validateIdArray(brief.primaryJourney, "primaryJourney", {}, errors);
  validateTextArray(brief.constraints, "constraints", errors);

  const screenIds = new Set();
  if (!Array.isArray(brief.screens) || brief.screens.length === 0) {
    recordError(errors, "screens must contain at least 1 item");
  } else if (brief.screens.length > MAX_ITEMS) {
    recordError(errors, `screens must contain at most ${MAX_ITEMS} items`);
  } else {
    brief.screens.forEach((screen, index) => {
      if (!isRecord(screen)) {
        recordError(errors, `screens[${index}] must be an object`);
        return;
      }
      unknownKeys(screen, SCREEN_KEYS, `screens[${index}]`, errors);
      requireKeys(screen, SCREEN_KEYS, `screens[${index}]`, errors);
      requireId(screen.id, `screens[${index}].id`, errors);
      requireText(screen.purpose, `screens[${index}].purpose`, errors);
      if (screenIds.has(screen.id)) recordError(errors, "screens contains a duplicate id");
      screenIds.add(screen.id);
    });
  }

  const actionIds = new Set();
  const stateIds = new Set(states);
  if (!Array.isArray(brief.actions) || brief.actions.length === 0) {
    recordError(errors, "actions must contain at least 1 item");
  } else if (brief.actions.length > MAX_ITEMS) {
    recordError(errors, `actions must contain at most ${MAX_ITEMS} items`);
  } else {
    brief.actions.forEach((action, index) => {
      if (!isRecord(action)) {
        recordError(errors, `actions[${index}] must be an object`);
        return;
      }
      unknownKeys(action, ACTION_KEYS, `actions[${index}]`, errors);
      requireKeys(action, ACTION_KEYS, `actions[${index}]`, errors);
      requireId(action.id, `actions[${index}].id`, errors);
      requireText(action.label, `actions[${index}].label`, errors);
      if (!ACTION_KINDS.has(action.kind)) recordError(errors, `actions[${index}].kind is invalid`);
      requireId(action.from, `actions[${index}].from`, errors);
      requireId(action.to, `actions[${index}].to`, errors);
      if (typeof action.from === "string" && !stateIds.has(action.from)) recordError(errors, `actions[${index}].from is undeclared`);
      if (typeof action.to === "string" && !stateIds.has(action.to)) recordError(errors, `actions[${index}].to is undeclared`);
      if (actionIds.has(action.id)) recordError(errors, "actions contains a duplicate id");
      if (screenIds.has(action.id)) recordError(errors, "screen and action ids must not collide");
      actionIds.add(action.id);
    });
  }

  if (!Array.isArray(brief.surfaces) || brief.surfaces.length === 0) {
    recordError(errors, "surfaces must contain at least 1 item");
  } else if (brief.surfaces.length > MAX_ITEMS) {
    recordError(errors, `surfaces must contain at most ${MAX_ITEMS} items`);
  } else {
    const seenSurfaces = new Set();
    brief.surfaces.forEach((surface, index) => {
      requireId(surface, `surfaces[${index}]`, errors);
      if (seenSurfaces.has(surface)) recordError(errors, "surfaces contains a duplicate value");
      seenSurfaces.add(surface);
    });
  }

  const journeyReferences = new Set([...screenIds, ...actionIds]);
  journey.forEach((reference) => {
    if (typeof reference === "string" && !journeyReferences.has(reference)) {
      recordError(errors, "primaryJourney references a missing id");
    }
  });

  return errors;
}

// Evaluates only the JSON Schema keywords used by the bundled recipe schema.
// This dependency-free CLI validates metadata, never rendered quality or file rights.
function schemaErrors(value, schema, root, location = "recipe", depth = 0) {
  const errors = [];
  const add = (message) => recordError(errors, `${location} ${message}`);
  if (depth > 40) return [`${location} exceeds nesting limit`];
  if (schema === false) return [`${location} is not allowed`];
  if (schema === true) return [];
  if (schema.$ref) {
    const target = schema.$ref.split("/").slice(1).reduce((node, key) => node?.[key], root);
    if (!target) return [`${location} has an unresolved schema reference`];
    return schemaErrors(value, target, root, location, depth + 1);
  }
  const validType = !schema.type || ({
    object: isRecord(value), array: Array.isArray(value), string: typeof value === "string",
    number: typeof value === "number" && Number.isFinite(value), integer: Number.isInteger(value),
    boolean: typeof value === "boolean",
  })[schema.type];
  if (!validType) return [`${location} has an invalid type`];
  if (Object.hasOwn(schema, "const") && value !== schema.const) add("has an invalid constant");
  if (schema.enum && !schema.enum.includes(value)) add("has an invalid choice");
  if (schema.anyOf && !schema.anyOf.some((branch) => schemaErrors(value, branch, root, location, depth + 1).length === 0)) add("matches no allowed variant");
  if (schema.allOf) for (const branch of schema.allOf) errors.push(...schemaErrors(value, branch, root, location, depth + 1));
  if (schema.if && schemaErrors(value, schema.if, root, location, depth + 1).length === 0 && schema.then) errors.push(...schemaErrors(value, schema.then, root, location, depth + 1));
  if (typeof value === "string") {
    const length = Array.from(value).length;
    if (length < (schema.minLength ?? 0) || length > (schema.maxLength ?? Infinity)) add("has an invalid length");
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) add("has an invalid format");
  }
  if (typeof value === "number" && (value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity))) add("is outside its allowed range");
  if (Array.isArray(value)) {
    if (value.length > MAX_ITEMS) return [`${location} exceeds collection limit`];
    if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity)) add("has an invalid item count");
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) add("contains duplicate values");
    value.forEach((item, index) => {
      const itemSchema = schema.prefixItems?.[index] ?? schema.items;
      if (itemSchema !== undefined && errors.length < MAX_ERRORS) errors.push(...schemaErrors(item, itemSchema, root, `${location}[${index}]`, depth + 1));
    });
  }
  if (isRecord(value)) {
    const keys = Object.keys(value);
    if (keys.length > MAX_ITEMS) return [`${location} exceeds collection limit`];
    if (keys.length < (schema.minProperties ?? 0) || keys.length > (schema.maxProperties ?? Infinity)) add("has an invalid property count");
    if (schema.required) requireKeys(value, schema.required, location, errors);
    for (const key of keys) {
      if (errors.length >= MAX_ERRORS) break;
      if (schema.propertyNames) errors.push(...schemaErrors(key, schema.propertyNames, root, `${location} property name`, depth + 1));
      const childSchema = Object.hasOwn(schema.properties ?? {}, key) ? schema.properties[key] : schema.additionalProperties;
      // Do not echo untrusted keys or values in bounded CLI errors.
      const childLocation = Object.hasOwn(schema.properties ?? {}, key) ? `${location}.${key}` : `${location} entry`;
      if (childSchema !== undefined) errors.push(...schemaErrors(value[key], childSchema, root, childLocation, depth + 1));
    }
  }
  return errors.slice(0, MAX_ERRORS);
}

function validateRecipe(recipe, schema) {
  const errors = schemaErrors(recipe, schema, schema);
  if (errors.length || recipe.protocolVersion !== 2) return errors;
  const uniqueIds = (items, label) => {
    const ids = new Set(items.map((item) => item.id));
    if (ids.size !== items.length) recordError(errors, `${label} contains duplicate ids`);
    return ids;
  };
  const faces = uniqueIds(recipe.character.faceAssets, "faceAssets");
  const bodies = uniqueIds(recipe.character.bodyVariants, "bodyVariants");
  const motions = uniqueIds(recipe.motion, "motion");
  uniqueIds(recipe.components, "components");
  const head = recipe.character.headReference;
  const headCrop = head.crop ?? { x: 0, y: 0, width: head.sourceWidth, height: head.sourceHeight };
  if (headCrop.x + headCrop.width > head.sourceWidth || headCrop.y + headCrop.height > head.sourceHeight) recordError(errors, "head reference crop exceeds source bounds");
  if (recipe.rights.publicExport && head.useScope !== "redistributable") recordError(errors, "public export references a local-project head");
  for (const face of recipe.character.faceAssets) {
    const crop = face.crop ?? { x: 0, y: 0, width: face.sourceWidth, height: face.sourceHeight };
    if (crop.x + crop.width > face.sourceWidth || crop.y + crop.height > face.sourceHeight) recordError(errors, "face crop exceeds source bounds");
    if (face.quality === "production" && face.displayWidth > crop.width) recordError(errors, "production face exceeds source resolution");
    if (recipe.rights.publicExport && face.useScope !== "redistributable") recordError(errors, "public export references a local-project face");
  }
  for (const body of recipe.character.bodyVariants) {
    const { asset, faceFrame } = body;
    const crop = asset.crop ?? { x: 0, y: 0, width: asset.sourceWidth, height: asset.sourceHeight };
    if (crop.x + crop.width > asset.sourceWidth || crop.y + crop.height > asset.sourceHeight) recordError(errors, "body crop exceeds source bounds");
    if (faceFrame.x + faceFrame.width > 1 || faceFrame.y + faceFrame.height > 1) recordError(errors, "face attachment frame exceeds artboard");
    if (recipe.rights.publicExport && asset.useScope !== "redistributable") recordError(errors, "public export references a local-project body");
  }
  for (const state of Object.values(recipe.states)) {
    if (!faces.has(state.faceAssetId)) recordError(errors, "state references a missing face asset");
    if (!bodies.has(state.bodyVariantId)) recordError(errors, "state references a missing body variant");
    const body = recipe.character.bodyVariants.find((item) => item.id === state.bodyVariantId);
    if (body && body.handMode !== state.handMode) recordError(errors, "state and body hand modes disagree");
    if (state.motionId && !motions.has(state.motionId)) recordError(errors, "state references a missing motion");
  }
  return errors;
}

const recipeMode = process.argv[2] === "--recipe";
const inputPath = process.argv[recipeMode ? 3 : 2];
if (!inputPath || process.argv.length !== (recipeMode ? 4 : 3)) {
  emitFailure("usage", ["provide a workflow JSON path, or --recipe followed by a recipe JSON path"]);
} else {
  let inputHandle;
  let inputFailure;
  let source;
  try {
    const inputLinkStat = await lstat(inputPath);
    if (!inputLinkStat.isFile()) {
      inputFailure = ["input-unavailable", ["workflow input could not be read"]];
    } else if (inputLinkStat.size > MAX_INPUT_BYTES) {
      inputFailure = ["input-too-large", ["workflow input exceeds 1 MiB"]];
    } else {
      inputHandle = await open(inputPath, OPEN_FLAGS);
      const inputStat = await inputHandle.stat();
      if (!inputStat.isFile()) {
        inputFailure = ["input-unavailable", ["workflow input could not be read"]];
      } else if (inputStat.size > MAX_INPUT_BYTES) {
        inputFailure = ["input-too-large", ["workflow input exceeds 1 MiB"]];
      } else {
        const inputBuffer = Buffer.alloc(MAX_INPUT_BYTES + 1);
        const { bytesRead } = await inputHandle.read(
          inputBuffer,
          0,
          MAX_INPUT_BYTES + 1,
          0,
        );
        if (bytesRead > MAX_INPUT_BYTES) {
          inputFailure = ["input-too-large", ["workflow input exceeds 1 MiB"]];
        } else {
          source = inputBuffer.subarray(0, bytesRead);
        }
      }
    }
  } catch {
    inputFailure = ["input-unavailable", ["workflow input could not be read"]];
  } finally {
    if (inputHandle) {
      try {
        await inputHandle.close();
      } catch {
        inputFailure = ["input-unavailable", ["workflow input could not be read"]];
        source = undefined;
      }
    }
  }

  if (inputFailure) {
    emitFailure(...inputFailure);
  } else if (source) {
    let brief;
    try {
      brief = JSON.parse(source.toString("utf8"));
    } catch {
      emitFailure("invalid-json", ["workflow input is not valid JSON"]);
    }

    if (brief !== undefined) {
      let recipeSchema;
      if (recipeMode) {
        try {
          recipeSchema = JSON.parse(await readFile(new URL("../protocol/mouse-ui-project.schema.json", import.meta.url), "utf8"));
        } catch {
          emitFailure("schema-unavailable");
        }
      }
      const errors = recipeMode
        ? (recipeSchema ? validateRecipe(brief, recipeSchema) : ["recipe schema unavailable"])
        : validateBrief(brief);
      if (errors.length > 0) {
        emitFailure(recipeMode ? "invalid-recipe" : "invalid-workflow", errors);
      } else {
        const output = recipeMode ? {
          ok: true, id: brief.id, protocolVersion: brief.protocolVersion,
          states: Object.keys(brief.states).length, validation: "metadata-only",
        } : {
          ok: true,
          id: brief.id,
          screens: brief.screens.length,
          actions: brief.actions.length,
          states: brief.states.length,
        };
        process.stdout.write(`${JSON.stringify(output)}\n`);
      }
    }
  }
}
