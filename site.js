// Landing page logic — agent prompt copy, code copy, modal
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzy_TeRQhspEV9PR5ROLbw3H4aMRUP8dUqbszRfZpN4BosVFbCZRiNygfVYNN4YpFVZhQ/exec";

// ---- Init FormToSheet for the hire-me modal form ----
FormToSheet.init(APPS_SCRIPT_URL);

// ---- "Have Your Agent Do It" button ----
var agentPrompt = [
  "Install the form-to-google-sheet npm package in my project to capture form submissions",
  "and send them to a Google Sheet. Here's what to do:\n",
  "1. Run: npm install form-to-google-sheet",
  "2. In my Google Sheet, go to Extensions > Apps Script, delete any existing code,",
  "   and paste the Code.gs from https://github.com/sahilbambulkar/form-to-google-sheet",
  "3. Deploy the Apps Script: Deploy > New Deployment > Web App > Execute as Me > Access: Anyone > Deploy",
  "4. Copy the deployment URL and add this to my app:\n",
  '   import FormToSheet from "form-to-google-sheet";',
  '   FormToSheet.init("PASTE_DEPLOYMENT_URL_HERE");',
  '   FormToSheet.bind("#my-form");\n',
  "5. Make sure the form input 'name' attributes match my Google Sheet column headers.",
  "\nThe Google Sheet URL is: [PASTE YOUR GOOGLE SHEET URL HERE]",
].join("\n");

document.getElementById("agent-btn").addEventListener("click", function () {
  navigator.clipboard.writeText(agentPrompt).then(function () {
    var tip = document.getElementById("agent-tip");
    tip.classList.add("show");
    setTimeout(function () { tip.classList.remove("show"); }, 2000);
  });
});

// ---- Code snippet copy ----
var codeSnippet = [
  '<script src="https://unpkg.com/form-to-google-sheet"></script>',
  "",
  "<script>",
  '  FormToSheet.init("YOUR_APPS_SCRIPT_URL");',
  '  FormToSheet.bind("#my-form");',
  "</script>",
].join("\n");

document.getElementById("copy-code-btn").addEventListener("click", function () {
  var btn = this;
  navigator.clipboard.writeText(codeSnippet).then(function () {
    btn.textContent = "Copied!";
    setTimeout(function () { btn.textContent = "Copy"; }, 2000);
  });
});

// ---- $100 hire-me modal ----
var modal = document.getElementById("hire-modal");
var modalFormBody = document.getElementById("modal-form-body");
var modalSuccess = document.getElementById("modal-success");

document.getElementById("hire-btn").addEventListener("click", function () {
  modalFormBody.style.display = "";
  modalSuccess.style.display = "none";
  modal.classList.add("open");
});

document.getElementById("modal-close").addEventListener("click", function () {
  modal.classList.remove("open");
});

modal.addEventListener("click", function (e) {
  if (e.target === modal) modal.classList.remove("open");
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") modal.classList.remove("open");
});

// Wire up the modal form with loading state
var hireForm = document.getElementById("hire-form");
var submitBtn = hireForm.querySelector(".modal-submit");
var submitBtnText = submitBtn.textContent;

FormToSheet.bind("#hire-form", {
  onSuccess: function () {
    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtnText;
    modalFormBody.style.display = "none";
    modalSuccess.style.display = "";
  },
  onError: function () {
    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtnText;
  },
  resetOnSuccess: false,
});

hireForm.addEventListener("submit", function () {
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
});
