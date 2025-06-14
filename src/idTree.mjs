// src/idTree.js
export function validateIdTree (fdl) {
  const fiIds = new Set();
  for (const { id: fiId, label: fiLabel } of fdl.framing_intents ?? []) {
    if (fiIds.has(fiId)) throw new Error(`Framing Intent ${fiId} (${fiLabel}): ID duplicated`);
    fiIds.add(fiId);
  }

  if ('default_framing_intent' in fdl && !fiIds.has(fdl.default_framing_intent)) {
    throw new Error(`Default Framing Intent ${fdl.default_framing_intent}: Not in framing_intents`);
  }

  const cvIds             = new Set();
  const sourceCanvasIds   = new Set();
  const fdIds             = new Set();

  for (const cx of fdl.contexts ?? []) {
    const cxLabel = cx.label;

    for (const cv of cx.canvases ?? []) {
      const { id: cvId, label: cvLabel, source_canvas_id: srcCvId } = cv;

      sourceCanvasIds.add(srcCvId);

      if (cvIds.has(cvId)) throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}): ID duplicated`);
      cvIds.add(cvId);

      for (const fd of cv.framing_decisions ?? []) {
        const { id: fdId, framing_intent_id: fiForDec } = fd;
        const expectedFdId = `${cvId}-${fiForDec}`;

        if (fdIds.has(fdId)) throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: ID duplicated`);
        fdIds.add(fdId);

        if (!fiIds.has(fiForDec)) throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: Framing Intent ID ${fiForDec} not in framing_intents`);
        if (fdId !== expectedFdId) throw new Error(`Context (${cxLabel}) > Canvas ${cvId} (${cvLabel}) > Framing Decision ${fdId}: ID doesn't match expected ${expectedFdId}`);
      }
    }
  }

  const orphans = [...sourceCanvasIds].filter(id => !cvIds.has(id));
  if (orphans.length) throw new Error(`Source Canvas IDs ${JSON.stringify(orphans)} not in canvases`);

  const ctIds = new Set();
  for (const { id: ctId, label: ctLabel } of fdl.canvas_templates ?? []) {
    if (ctIds.has(ctId)) throw new Error(`Canvas Template ${ctId} (${ctLabel}): ID duplicated`);
    ctIds.add(ctId);
  }
}
