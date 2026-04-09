// ===========================================================
// Google Apps Script — paste this into your Sheet's script editor
// (Extensions > Apps Script), then deploy as a Web App.
// ===========================================================

var SHEET_NAME = "Sheet1"; // change if your tab has a different name

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return _jsonResponse(404, { error: "Sheet '" + SHEET_NAME + "' not found" });
    }

    var data = JSON.parse(e.postData.contents);
    var rows = data.rows || [data]; // accept a single object or { rows: [...] }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String);

    if (headers.length === 0) {
      // Sheet is empty — use the keys from the first row as headers
      headers = Object.keys(rows[0]);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    var output = [];
    rows.forEach(function (row) {
      var newRow = headers.map(function (header) {
        return row[header] !== undefined ? row[header] : "";
      });
      sheet.appendRow(newRow);
      output.push(newRow);
    });

    return _jsonResponse(200, {
      status: "ok",
      rowsAdded: output.length,
      headers: headers,
    });
  } catch (err) {
    return _jsonResponse(500, { error: err.message });
  }
}

function doGet() {
  return _jsonResponse(200, {
    status: "ok",
    message: "FormToGoogleSheet endpoint is live. Send a POST to add rows.",
  });
}

function _jsonResponse(code, payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
