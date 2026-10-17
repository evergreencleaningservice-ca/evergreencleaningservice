/**
 * Built pages that are not public pages of the site, so the checks that walk
 * every page (phone links, forms, headings, indexability) leave them out:
 *
 *   admin/…                 the admin, behind Cloudflare Access, noindex,
 *                           with none of the site's chrome
 *   eg-live-post-shell/     the template live posts are drawn in, never
 *                           served at its own address
 *
 * Each one has its own assertions instead (indexability.test.ts).
 */
import path from 'node:path';

export const isPrivatePage = (file: string, out?: string): boolean => {
  const rel = (out ? path.relative(out, file) : file).split(path.sep).join('/');
  return rel.startsWith('admin/') || rel.startsWith('eg-live-post-shell/');
};
