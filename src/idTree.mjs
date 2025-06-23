// src/idTree.js

// Validates the structure and internal ID references in an FDL object.
// Throws an Error if any integrity rule is violated.
export function validateIdTree (fdl) {
  const fiIds = new Set();

  // Validate Framing Intents
  for (const { id: fiId, label: fiLabel } of fdl.framing_intents ?? []) {
    // Ensure each framing intent ID is unique
    if (fiIds.has(fiId)) 
      throw new Error(`Framing Intent ${fiId} (${fiLabel}): ID duplicated`);
    fiIds.add(fiId);
  }

  // Check that default framing intent exists in the declared intents
  if ('default_framing_intent' in fdl && !fiIds.has(fdl.default_framing_intent)) {
    throw new Error(`Default Framing Intent ${fdl.default_framing_intent}: Not in framing_intents`);
  }

  // Validate Contexts, Canvases, and Framing Decisions
  const cvIds             = new Set();
  const sourceCanvasIds   = new Set();
  const fdIds             = new Set();

  for (const cx of fdl.contexts ?? []) {
    const cxLabel = cx.label;

    for (const cv of cx.canvases ?? []) {
      const { id: cvId, label: cvLabel, source_canvas_id: srcCvId } = cv;

      // Track referenced source_canvas_id for later orphan check
      sourceCanvasIds.add(srcCvId);

      // Canvas IDs must be unique
      if (cvIds.has(cvId))
        throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}): ID duplicated`);
      cvIds.add(cvId);

      for (const fd of cv.framing_decisions ?? []) {
        const { id: fdId, framing_intent_id: fiForDec } = fd;
        const expectedFdId = `${cvId}-${fiForDec}`;

        // Framing decision IDs must be unique
        if (fdIds.has(fdId))
          throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: ID duplicated`);
        fdIds.add(fdId);

        // Framing decision must refer to a valid framing intent
        if (!fiIds.has(fiForDec))
          throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: Framing Intent ID ${fiForDec} not in framing_intents`);
        
        // Framing decision ID must match expected pattern: canvasID-intentID
        if (fdId !== expectedFdId)
          throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: ID doesn't match expected ${expectedFdId}`);
      }
    }
  }

  // Validate Source Canvas References
  // All source_canvas_id values must reference an actual canvas
  const orphans = [...sourceCanvasIds].filter(id => !cvIds.has(id));
  if (orphans.length) 
    throw new Error(`Source Canvas IDs ${JSON.stringify(orphans)} not in canvases`);

  // Validate Canvas Templates
  const ctIds = new Set();
  for (const { id: ctId, label: ctLabel } of fdl.canvas_templates ?? []) {
    // Canvas Template IDs must be unique
    if (ctIds.has(ctId)) 
      throw new Error(`Canvas Template ${ctId} (${ctLabel}): ID duplicated`);
    ctIds.add(ctId);
  }
}
