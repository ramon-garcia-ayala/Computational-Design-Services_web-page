/**
 * The only place an archetype maps to its builder — the same shape as
 * ProposalRenderer's switch, and for the same reason: when there is one place,
 * adding a kind is a three-line change and forgetting to wire it is impossible.
 */

import { buildPipeline } from "./pipeline.mjs";
import { buildTransform } from "./transform.mjs";
import { buildIterate } from "./iterate.mjs";
import { buildExchange } from "./exchange.mjs";

const BUILDERS = {
  pipeline: buildPipeline,
  transform: buildTransform,
  iterate: buildIterate,
  exchange: buildExchange,
};

export function build(spec) {
  const fn = BUILDERS[spec.archetype];
  if (!fn) throw new Error(`no builder for archetype ${spec.archetype}`);
  return fn(spec);
}
