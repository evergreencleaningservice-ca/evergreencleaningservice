import { describe, expect, it } from 'vitest';
import { publishProblems } from '../src/lib/project-gate';

const ok = {
  photos: [{ approved: true }],
  clientNameApproved: false,
  outcomes: [],
  initialNeeds: ['a'],
  scope: ['b'],
};

describe('case-study publish gate', () => {
  it('passes a complete, approved entry', () => {
    expect(publishProblems(ok)).toEqual([]);
  });
  it('refuses an unapproved photo, testimonial or client name', () => {
    expect(publishProblems({ ...ok, photos: [{ approved: false }] })).toHaveLength(1);
    expect(publishProblems({ ...ok, testimonial: { approved: false } })).toHaveLength(1);
    expect(publishProblems({ ...ok, clientName: 'Acme' })).toHaveLength(1);
  });
  it('refuses unverified outcomes and empty substance', () => {
    expect(publishProblems({ ...ok, outcomes: ['x'] })).toHaveLength(1);
    expect(publishProblems({ ...ok, scope: [] })).toHaveLength(1);
    expect(publishProblems({ ...ok, photos: [] })).toHaveLength(1);
  });
});
