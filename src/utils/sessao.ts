export function getSessionId(): string {
  const chave = 'session_id';
  let id = localStorage.getItem(chave);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(chave, id);
  }
  return id;
}