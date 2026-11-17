async function contarPendientes() {
  const res = await fetch(`${NP_API_URL}/v1/regalos?estado=pendiente`, {
    headers: { Authorization: `Bearer ${NP_TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const regalos = await res.json();
  return regalos.length;
}
