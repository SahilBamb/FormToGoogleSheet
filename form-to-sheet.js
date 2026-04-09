/**
 * 
 * Sahil Bambulkar (https://www.linkedin.com/in/sahil-bambulkar/)
 * FormToGoogleSheet — tiny client library (no dependencies, ~1 KB)
 *
 * Usage (script tag):
 *   <script src="form-to-sheet.js"></script>
 *   <script>
 *     FormToSheet.init("https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec");
 *     FormToSheet.submit({ name: "Ada", email: "ada@example.com" });
 *   </script>
 *
 * Usage (ES module):
 *   import { init, submit } from "./form-to-sheet.js";
 *   init("https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec");
 *   submit({ name: "Ada", email: "ada@example.com" });
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    root.FormToSheet = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var _url = "";

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

  /**
   * Submit a single row (object) or multiple rows (array of objects).
   * Returns a Promise that resolves with the Apps Script JSON response.
   */
  function submit(data) {
    _ensureInit();
    var body = Array.isArray(data) ? { rows: data } : data;

    return fetch(_url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    }).then(function (res) {
      // Google Apps Script redirects and returns opaque responses in no-cors
      // mode, so we can't reliably read the body. If the fetch didn't throw,
      // the request was accepted.
      if (res.type === "opaque") {
        return { status: "ok", note: "opaque response (no-cors mode)" };
      }
      return res.json();
    });
  }

  /**
   * Convenience: bind to a <form> element. On submit it reads all named
   * inputs, sends them to the sheet, and calls your callback.
   *
   *   FormToSheet.bind("#my-form", {
   *     onSuccess: () => alert("Saved!"),
   *     onError:   (err) => console.error(err),
   *   });
   */
  function bind(selectorOrEl, opts) {
    _ensureInit();
    opts = opts || {};
    var form =
      typeof selectorOrEl === "string"
        ? document.querySelector(selectorOrEl)
        : selectorOrEl;

    if (!form) throw new Error("[FormToSheet] Form not found: " + selectorOrEl);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var row = {};
      formData.forEach(function (value, key) {
        row[key] = value;
      });

      submit(row)
        .then(function (res) {
          if (opts.onSuccess) opts.onSuccess(res);
          if (opts.resetOnSuccess !== false) form.reset();
        })
        .catch(function (err) {
          if (opts.onError) opts.onError(err);
        });
    });
  }

  return { init: init, submit: submit, bind: bind };
});
