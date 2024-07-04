"use strict";
import {base_url} from "./variables.js"
import { getToken } from "./jwt.js"

let durationIntervals = [];
let datastores = [];
let databaseEngine = {};
let jobData = {};
const pageLoading =  `
<a class="btn btn" type="button" disabled>
<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Fetching data...
</a>
`
const savingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Saving...`;
const deletingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Deleting...`;



document.addEventListener("DOMContentLoaded", function(event){
    const jobFormEl = document.querySelector("#job-form");
    const jobListContainerEl = document.querySelector("#job-list-container");

    // load create or update job detail
    if(jobFormEl){

        const methodType = jobFormEl.getAttribute("data-method-type");
        loadBasicInfo(methodType);

        // Add listener to form
        document.getElementById(`job-form`).addEventListener("submit", function(event){
            event.preventDefault();
            const methodType = this.getAttribute("data-method-type");
            const jobId = this.getAttribute("data-job-id");
            saveJob(methodType, jobId);
        });

    }

    // load list of job
    if(jobListContainerEl){
        loadJobRecord()

        // Add listener to confirm delete button
        document.getElementById(`confirm-delete`).addEventListener("click", function(event){


            const jobId = this.getAttribute("data-id");
            const jobRowEl = document.getElementById(`job-list-row-id-${jobId}`);
            const confirmDeleteClose = document.getElementById("delete-job-modal-close");
            this.innerHTML = deletingData;


            // Delete data
            fetch (`/jobs/${jobId}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }).then(res => {

                return res.json();

            }).then(jsonData => {

                console.log(jsonData);

                if (jsonData.success){

                    this.innerHTML = "Confirm delete";

                    // BEGIN remove job card
                    jobRowEl.classList.add("list-fade");
                    jobRowEl.style.opacity = '0';
                    setTimeout(() => jobRowEl.remove(), 1000);
                    // EMD remove job card

                    confirmDeleteClose.click();
                    $.notify("Job Deleted.", "success");

                }else{
                    // error prompt here
                    this.innerHTML = "Confirm delete";
                    document.getElementById("delete-job-error-notify").innerHTML = jsonData.message;
                }

            }).catch(err => {
                
                this.innerHTML = "Confirm delete";
                console.log(err.message);
                document.getElementById("delete-job-error-notify").innerHTML = err.message;

            });





        });

    }




});



const loadBasicInfo = (methodType) => {

    // Start spinner
    document.querySelector("#page-spinner").style.display = "block";
    document.querySelector("#job-form").style.display = "none";

    const url = `${base_url}/generalinfo`;
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
             "Authorization": `Bearer ${getToken()}`
            }
    }).then(res => {

        if (res.status === 200){
           return res.json();
        }else if(res.status === 401){
            window.location.href = "/login";
        }

    }).then(jsonData => {

        console.log(jsonData)
        let optionContent = "";

        // Get data
        durationIntervals = jsonData.backup_frequency_types;
        datastores = jsonData.datastores;
        console.log(durationIntervals)

        // load database credential ID
        optionContent = '<option value="" selected disabled>--please choose--</option>';
        for (let interval of durationIntervals){
            optionContent += `<option value="${interval._id}">${interval.name}</option>`;
        }
        document.getElementById("interval-type").innerHTML = optionContent
        


        // load database engine and storage provider
        optionContentDatabaseEngine = '<option value="" selected disabled>--please choose--</option>';
        optionContentStorageProvider = '<option value="" selected disabled>--please choose--</option>';
        for (let datastore of datastores){
            if (datastore.ds_details.ds_type === "datastore-engine"){
                optionContentDatabaseEngine += `<option value="${datastore._id}">${datastore.ds_details.name} => ${datastore._id}</option>`;
            }else if (datastore.ds_details.ds_type === "storage-provider"){
                optionContentStorageProvider += `<option value="${datastore._id}">${datastore.ds_details.name} => ${datastore._id}</option>`;
            }
        }
        document.getElementById("database-credential-id").innerHTML = optionContentDatabaseEngine;
        document.getElementById("backup-storage-provider-credential-id").innerHTML = optionContentStorageProvider;


        // Update  
        document.querySelector("#page-spinner").style.display = "none";
        document.querySelector("#job-form").style.display = "block";

        if(methodType === "PUT"){
            loadJobForUpdate();
        }



    }).catch(error => {

        console.log(error.message);

    })
}


const loadJobRecord = () => {

    // Start spinner
    const jobListContainerEl = document.querySelector("#job-list-container");
    jobListContainerEl.style.display = "none";
    const spinnerEl = document.querySelector("#spinner-content");
    spinnerEl.innerHTML = pageLoading;
    const url = `${base_url}/jobs`;

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
             "Authorization": `Bearer ${getToken()}`
            }
    }).then(res => {

        if (res.status === 200){
           return res.json();
        }else if(res.status === 401){
            window.location.href = "/login";
        }

    }).then(jsonData => {

        console.log(jsonData.jobs);
        displayTableContent(jsonData.jobs);
        deleteJob();
        jobListContainerEl.style.display = "block";
        spinnerEl.innerHTML = "";

    }).catch(error => {

        console.log(error.message);

    })
}

const loadJobForUpdate = () => {

    // Start spinner
    document.querySelector("#page-spinner").style.display = "block";
    const jobFormEl = document.querySelector("#job-form");
    jobFormEl.style.display = "none";
    const jobId = jobFormEl.getAttribute("data-job-id");


    fetch(`/jobs/${jobId}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then(res => {

        if (res.status === 200){
           return res.json();
        }

    }).then(jsonData => {

        console.log(jsonData.job);
        displaySavedJob(jsonData.job);

        // Update  
        document.querySelector("#page-spinner").style.display = "none";
        document.querySelector("#job-form").style.display = "block";

    }).catch(error => {

        console.log(error.message);

    })
}



const displayTableContent = (data) => {

    let content = "";
    let count = 1;
    for(let job of data){
        content += formatJobData(job, count)
        count += 1;
    }

    // update table content
    if (data.length){
        document.querySelector("#job-list-table-body").innerHTML = content;
    }else{
        // no data found
    }

}


const formatJobData = (job, count) => {

    return `
            <tr id="job-list-row-id-${job._id}" class="list-fade">
                <td>${count}</td>
                <td>${job.job_name}</td>
                <td>${job.job_start_time_12_hour_time}</td>
                <td>${job.interval_value} ${job.interval_type}</td>
                <td>${job.database_engine.engine_or_storage_provider.name}</td>
                <td>${job.storage_provider.engine_or_storage_provider.storage_name}</td>

                <td style="float: right">
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <a type="button" class="btn btn-primary" href="/job_edit/${job._id}"><i class="ri-edit-box-line"></i></a>
                        <a type="button" data-id="${job._id}"  data-job-name="${job.job_name}" data-bs-toggle="modal" data-bs-target="#delete-job-modal" class="btn btn-danger delete-job"><i class="bx bxs-trash-alt"></i></a>
                    </div>
                </td>

            </tr>
    `
}



const validateInput = () => {
    let isValid = true;


    const jobName = document.querySelector(`#job-name`).value;
    const description = document.querySelector(`#description`).value;
    const enableAutomaticBackedUp = document.querySelector(`#enable-automatic-backed-up`).checked;
    const jobStartTime = document.querySelector(`#job-start-time`).value;
    const intervalType = document.querySelector(`#interval-type`).value;
    const intervalValue = document.querySelector(`#interval-value`).value;
    const databaseCredentialId = document.querySelector(`#database-credential-id`).value;
    const backupStorageProviderCredentialId = document.querySelector(`#backup-storage-provider-credential-id`).value;


    // form data
    jobData = {
        job_name: jobName,
        description: description,
        enable_automatic_backed_up: enableAutomaticBackedUp,
        job_start_time: jobStartTime,
        interval_type: intervalType,
        interval_value: intervalValue,
        database_credential_id: databaseCredentialId,
        backup_storage_provider_credential_id: backupStorageProviderCredentialId,
    }


    if (jobName === ""){
        document.getElementById(`job-name-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`job-name-error`).style.display = "none";
    }


    if (jobStartTime === ""){
        document.getElementById(`job-start-time-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`job-start-time-error`).style.display = "none";
    }

    if (intervalType === ""){
        document.getElementById(`interval-type-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`interval-type-error`).style.display = "none";
    }

    if (intervalValue === ""){
        document.getElementById(`interval-value-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`interval-value-error`).style.display = "none";
    }

    if (databaseCredentialId === ""){
        document.getElementById(`database-credential-id-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`database-credential-id-error`).style.display = "none";
    }

    if (backupStorageProviderCredentialId === ""){
        document.getElementById(`backup-storage-provider-credential-id-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`backup-storage-provider-credential-id-error`).style.display = "none";
    }

    return isValid;

}


const saveJob = (methodType, jobId) => {
    const btnSaveEl = document.getElementById(`btn-save-job`);


    // Validate form input
    if (validateInput()){

        btnSaveEl.innerHTML = savingData;
        const errorContainerEl = document.querySelector(`#error-container`);
        const errorEl = document.querySelector(`#error-content`);
        errorContainerEl.style.display = "none";

        
        let url = `${base_url}/jobs/${jobId}`;
        let data = {};

        if (methodType === "POST"){

            url = `${base_url}/jobs`;

            // format data
            data = jobData;


        }else {

            // format data
            data = jobData
        }


        // Save data
        fetch (url, {
            method: methodType,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                 "Authorization": `Bearer ${getToken()}`
                }
        }).then(res => {

            return res.json();

        }).then(jsonData => {

            console.log(jsonData)

            if (jsonData.success){


                btnSaveEl.innerHTML = "Save";
                $.notify("Credential Saved.", "success");
                window.location.href = `/backup_list/<string:job_id>${jsonData.job._id}`;

            }else{

                // error prompt here
                errorEl.innerHTML = jsonData.message
                errorContainerEl.style.display = "block";
                btnSaveEl.innerHTML = "Save";
            }

        }).catch(err => {
            
            btnSaveEl.innerHTML = "Save";
            console.log(err.message);
            errorEl.innerHTML = err.message;
            errorContainerEl.style.display = "block";

        });



    }

}


const deleteJob = () => {

    const deleteEls = document.querySelectorAll(".delete-job");
    deleteEls.forEach(element => {

        element.addEventListener("click", function(event){

            const jobId = this.getAttribute("data-id");
            const jobName = this.getAttribute("data-job-name");
    
            
            const content = `<p>Are you sure, you want to delete the selected job (${jobName})</p>`;
            document.getElementById("delete-job-content").innerHTML = `${content}`;
            
            
            const deleteBtnEl = document.getElementById("confirm-delete");
            deleteBtnEl.setAttribute("data-job-name", jobName);
            deleteBtnEl.setAttribute("data-id", jobId);
    
        });
        
    });


}


const displaySavedJob = (data) => {

    document.getElementById("job-name").value = data.job_name;
    document.getElementById("description").value = data.description;
    document.getElementById("enable-automatic-backed-up").checked = data.enable_automatic_backed_up;
    document.getElementById("job-start-time").value = data.job_start_time;
    document.getElementById("interval-type").value = data.interval_type;
    document.getElementById("interval-value").value = data.interval_value;
    document.getElementById("database-credential-id").value = data.database_credential_id;
    document.getElementById("backup-storage-provider-credential-id").value = data.backup_storage_provider_credential_id;

}




