const API_KEY = "UHRuWEg-qB63_0IsTvwhjo8khlo";
const API_URL = "https://ci-jshint.herokuapp.com/api";
const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));

document.getElementById("status").addEventListener("click", e => getStatus(e));
document.getElementById("submit").addEventListener("click", e => postForm(e));

function processOptions(form) {
    let optArray = [];

    for (let e of form.entries()) {
        if (e[0] === "options") {
            optArray.push(e[1]);
        }
    }

    form.delete("options");

    form.append("options", optArray.join());

    return form;
}

async function postForm(e) {

    const form = processOptions(new FormData(document.getElementById("checksform")));

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form,
    });

    const data = await response.json();

    if (response.ok) {
        displayErrors(data);
    } else {
        displayException(data);
        throw new Error(data.error);
    }

}

function displayErrors(data){
    let results = "";

    let heading = `JSHint Results for ${data.file}`;
    if (data.total_errors === 0) {
        results = `<div class="no_errors">No errors reported!</div>`;
    } else {
        results = `<div>Total Errors: <span class="error_count">${data.total_errors}</span></div>`;
        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class="column">${error.col}:</span></div>`;
            results += `<div class="error">${error.error}</div>`;
        }
    }

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = results;
    resultsModal.show();
}

async function getStatus(e){
    const queryString = `${API_URL}?api_key=${API_KEY}`;
    console.log(queryString);


    const response = await fetch(queryString);
    const data = await response.json();

    if(response.ok){
        displayStatus(data);
    }else{
        displayException(data);
        throw new Error(data.error);
    }
}


function displayStatus(data){

    document.getElementById("resultsModalTitle").innerHTML = "API Key Status";
    document.getElementById("results-content").innerHTML = `
    Your key is valid until <br>
    ${data.expiry}
    `;

    resultsModal.show();
}

function displayException(error){
    let exception = error;

    let heading = `An Exception Occurred`;
    let statusCode = exception.status_code;
    let errorNo = exception.error_no;
    let errorMessage = exception.error;

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = `
    The API Returned Status Code ${statusCode} <br>
    Error Number <b> ${errorNo} </b> <br>
    Error text: <b> ${errorMessage} </b>`;
    resultsModal.show();
}