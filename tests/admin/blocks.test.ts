/**
 * @vitest-environment node
 *
 * The admin's blocks become HTML served on the live site, under the site's
 * own origin. Everything typed must come out as text, and only addresses
 * that pass the checks may become links or images.
 */
import { describe, expect, it } from 'vitest';
import { blocksToHtml, cleanBlocks, embedPlatform, imageUrl, inline, linkUrl, youtubeId } from '../../src/lib/admin/blocks';

describe('inline text', () => {
  it('escapes everything typed', () => {
    expect(inline('<script>alert(1)</script> & "q"')).toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;q&quot;');
  });

  it('makes **bold**, _italic_ and [words](address)', () => {
    expect(inline('**Clean** and _quick_, see [our services](/services/)')).toBe(
      '<strong>Clean</strong> and <em>quick</em>, see <a href="/services/">our services</a>'
    );
  });

  it('marks an outside link noopener, and not the site itself', () => {
    expect(inline('[x](https://example.com/a)')).toBe('<a href="https://example.com/a" rel="noopener">x</a>');
    expect(inline('[x](https://www.evergreencleaningservice.ca/a/)')).toBe('<a href="https://www.evergreencleaningservice.ca/a/">x</a>');
  });

  it('leaves a javascript: or protocol-relative link as the typed words', () => {
    expect(inline('[x](javascript:alert(1))')).not.toContain('<a');
    expect(inline('[x](//evil.example/)')).not.toContain('<a');
    expect(inline('[x](data:text/html,hi)')).not.toContain('<a');
  });

  it('cannot break out of an href with quotes', () => {
    expect(inline('[x](/a"onmouseover="alert(1))')).not.toContain('onmouseover="');
  });

  it('ignores a typed placeholder character', () => {
    expect(inline('\u00000\u0000 [a](/b/)')).toBe('0 <a href="/b/">a</a>');
  });

  it('does not italicise snake_case words', () => {
    expect(inline('file_name_here')).toBe('file_name_here');
  });
});

describe('addresses', () => {
  it('takes only https images', () => {
    expect(imageUrl('https://img.evergreencleaningservice.ca/uploads/a.jpg')).toBe('https://img.evergreencleaningservice.ca/uploads/a.jpg');
    expect(imageUrl('http://x.example/a.jpg')).toBe('');
    expect(imageUrl('https://x.example/a.jpg" onerror="x')).toBe('');
    expect(imageUrl('javascript:alert(1)')).toBe('');
  });

  it('takes site paths, http(s), mailto and tel links', () => {
    expect(linkUrl('/request-a-quote/')).toBe('/request-a-quote/');
    expect(linkUrl('tel:+14168034880')).toBe('tel:+14168034880');
    expect(linkUrl('//x')).toBe('');
    expect(linkUrl('vbscript:x')).toBe('');
  });

  it('reads YouTube ids and embed platforms', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://www.youtube.com/shorts/abcdef123')).toBe('abcdef123');
    expect(embedPlatform('https://www.instagram.com/p/abc/')).toBe('Instagram');
    expect(embedPlatform('https://evilinstagram.com/p/abc/')).toBeNull();
    expect(embedPlatform('http://www.instagram.com/p/abc/')).toBeNull();
  });
});

describe('blocks to HTML', () => {
  it('renders each kind of block', () => {
    const html = blocksToHtml([
      { t: 'h2', text: 'The job' },
      { t: 'p', text: 'One.\n\n- a\n- b\n\n1. x\n2. y' },
      { t: 'quote', text: 'Spotless.' },
      { t: 'list', ordered: true, items: ['first', ''] },
      { t: 'img', url: 'https://img.evergreencleaningservice.ca/uploads/a.jpg', alt: 'Lobby', caption: 'After' },
      { t: 'grid', cols: 3, cells: [{ heading: 'Before', text: 'Dusty', url: '', alt: '' }] },
      { t: 'embed', url: 'https://youtu.be/dQw4w9WgXcQ' },
      { t: 'embed', url: 'https://www.linkedin.com/posts/abc' },
    ]);
    expect(html).toContain('<h2>The job</h2>');
    expect(html).toContain('<p>One.</p>');
    expect(html).toContain('<ul><li>a</li><li>b</li></ul>');
    expect(html).toContain('<ol><li>x</li><li>y</li></ol>');
    expect(html).toContain('<blockquote><p>Spotless.</p></blockquote>');
    expect(html).toContain('<ol><li>first</li></ol>');
    expect(html).toContain('alt="Lobby"');
    expect(html).toContain('<figcaption>After</figcaption>');
    expect(html).toContain('minmax(200px,1fr)');
    expect(html).toContain('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(html).toContain('See this on LinkedIn');
    expect(html).not.toContain('<iframe');
  });

  it('drops empty blocks, unknown types and bad images', () => {
    const html = blocksToHtml(
      cleanBlocks([
        { t: 'h2', text: '  ' },
        { t: 'script', text: 'x' },
        { t: 'img', url: 'javascript:alert(1)', alt: '', caption: '' },
        { t: 'embed', url: 'https://evil.example/' },
        null,
      ])
    );
    expect(html).toBe('');
  });

  it('escapes alt text and captions', () => {
    const html = blocksToHtml([{ t: 'img', url: 'https://a.example/x.jpg', alt: '"><script>', caption: '<b>' }]);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
  });

  it('ends with the social row when there are slots', () => {
    const html = blocksToHtml([{ t: 'p', text: 'Hi' }], [
      { name: 'Facebook', href: 'https://www.facebook.com/x' },
      { name: 'Bad', href: 'javascript:x' },
    ]);
    expect(html).toContain('Follow this job on social');
    expect(html).toContain('https://www.facebook.com/x');
    expect(html).not.toContain('javascript:');
  });
});
