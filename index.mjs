let _url = "";

function init(scriptUrl) {
  if (!scriptUrl) throw new Error("[FormToSheet] Missing Apps Script URL");
  _url = scriptUrl.replace(/\/+$/, "");
}

function _ensureInit() {
  if (!_url)
    throw new Error(
      "[FormToSheet] Call FormToSheet.init(url) before submitting"
    );
}

export function submit(data) {
  _ensureInit();
  const body = Array.isArray(data) ? { rows: data } : data;

  return fetch(_url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  }).then(() => ({ status: "ok" }));
}

export function bind(selectorOrEl, opts = {}) {
  _ensureInit();
  const form =
    typeof selectorOrEl === "string"
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;

  if (!form)
    throw new Error("[FormToSheet] Form not found: " + selectorOrEl);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const row = Object.fromEntries(formData);

    submit(row)
      .then((res) => {
        if (opts.onSuccess) opts.onSuccess(res);
        if (opts.resetOnSuccess !== false) form.reset();
      })
      .catch((err) => {
        if (opts.onError) opts.onError(err);
      });
  });
}

export { init };
export default { init, submit, bind };
