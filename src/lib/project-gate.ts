/** The pure half of the gate, importable without Astro (and tested). */
export interface GateInput {
  photos: { approved: boolean }[];
  testimonial?: { approved: boolean };
  clientName?: string;
  clientNameApproved: boolean;
  outcomes: string[];
  outcomeVerifiedBy?: string;
  initialNeeds: string[];
  scope: string[];
}

export function publishProblems(p: GateInput): string[] {
  const problems: string[] = [];
  if (p.photos.some((ph) => !ph.approved)) problems.push('a photo is not marked approved');
  if (p.testimonial && !p.testimonial.approved) problems.push('the testimonial is not marked approved');
  if (p.clientName && !p.clientNameApproved) problems.push('the client name is not approved for publication');
  if (p.outcomes.length && !p.outcomeVerifiedBy) problems.push('outcomes have no outcomeVerifiedBy');
  if (!p.initialNeeds.length || !p.scope.length) problems.push('needs and scope are both required');
  if (!p.photos.length && !p.testimonial) problems.push('needs an approved photo or testimonial');
  return problems;
}

