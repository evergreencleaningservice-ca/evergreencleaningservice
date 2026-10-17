/** /admin/sign-in/: ask for a code, then enter it. */
import { $, api } from './common';

const emailForm = $<HTMLFormElement>('[data-step="email"]');
const codeForm = $<HTMLFormElement>('[data-step="code"]');
const error = $('[data-error]');
let email = '';

const fail = (message: string) => {
  error.hidden = false;
  error.textContent = message;
};

emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  error.hidden = true;
  email = String(new FormData(emailForm).get('email') ?? '').trim();
  const btn = emailForm.querySelector('button')!;
  btn.disabled = true;
  try {
    await api('/auth/start', { method: 'POST', body: JSON.stringify({ email }) });
    $('[data-to]').textContent = email;
    emailForm.hidden = true;
    codeForm.hidden = false;
    codeForm.querySelector('input')!.focus();
  } catch (err) {
    fail((err as Error).message);
  } finally {
    btn.disabled = false;
  }
});

codeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  error.hidden = true;
  const code = String(new FormData(codeForm).get('code') ?? '');
  const btn = codeForm.querySelector<HTMLButtonElement>('button[type=submit]')!;
  btn.disabled = true;
  try {
    const back = new URLSearchParams(location.search).get('return') ?? '/admin/';
    const body = await api<{ return: string }>('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code, return: back }) });
    location.href = body.return;
  } catch (err) {
    fail((err as Error).message);
    btn.disabled = false;
  }
});

$('[data-again]').addEventListener('click', () => {
  codeForm.reset();
  codeForm.hidden = true;
  emailForm.hidden = false;
  error.hidden = true;
});
