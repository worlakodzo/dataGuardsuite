"use strict";
import {base_url} from "./variables.js"
import { getToken } from "./jwt.js"

let datastoreTypes = {};
let backupFrequencyTypes = [];
let datastores = [];
let databaseEngines = [];
let backUpStorageProviders = [];
let datastoreCount = 0;
let datastoreData = {};

const pageLoading =  `
<a class="btn btn" type="button" disabled>
<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Fetching data...
</a>
`
const savingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Saving...`;
const deletingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Deleting...`;

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener("DOMContentLoaded", function(event){

    loadDatastoreRecord();


    document.querySelector("#add-new-datastore").addEventListener("click", function(event){

        const divEl = document.createElement("div");
        divEl.setAttribute("class", "col-lg-12");
        divEl.setAttribute("data-form-id", datastoreCount);
        divEl.setAttribute("id", `datastore-form-container-${datastoreCount}`);
        divEl.innerHTML = `

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title"></h5>

                        <form id="datastore-form-${datastoreCount}" style="display: block;" data-form-id="${datastoreCount}" class="form" action="#" data-method-type="POST" data-datastore-id="" data-engine-or-storage-provider="">

                            <div class="col-12 other-info">
                                <label for="type-${datastoreCount}" class="form-label"><strong>Type</strong> <span style="color: red;">*</span></label>
                                <select required id="type-${datastoreCount}" data-form-id="${datastoreCount}" class="form-select datastore-type">
                                    <option value="" selected disabled>--please choose--</option>
                                    ${loadDatastoreTypeIntoSelectedOption()}
                                </select>
                                <p id="type-${datastoreCount}-error" style="color: red; display: none;">Type required</p>
                            </div>


                            <div class="col-12 other-info">
                                <label for="engine-or-storage-provider-${datastoreCount}" id="engine-or-storage-provider-lb-${datastoreCount}" class="form-label"><strong>Engine</strong> <span style="color: red;">*</span></label>
                                <select required id="engine-or-storage-provider-${datastoreCount}" data-form-id="${datastoreCount}" class="form-select">
                                    

                                </select>
                                <p id="engine-or-storage-provider-${datastoreCount}-error" style="color: red; display: none;">Engine or Provider required</p>
                            </div>

                            <div id="form-${datastoreCount}-content-detail">  

                            </div>

                            <div>
                                <button style="float: right;" id="btn-save-datastore-${datastoreCount}" data-form-id="${datastoreCount}"  type="submit" class="btn btn-primary">Save Changes</button>
                                <button style="float: right; margin-right: 5px;" type="button" id="btn-delete-datastore-${datastoreCount}" data-form-id="${datastoreCount}" class="btn btn-danger">Delete</button>
                            </div>

                        </form>

                        <div id="error-container-${datastoreCount}" style="display: none; margin-top: 100px;" class="alert alert-danger alert-dismissible fade show" role="alert">
                            <p id="error-p-${datastoreCount}" ></p>
                        </div>

                    </div>

                </div>
        `;
        


        document.getElementById("datastores-container").appendChild(divEl);

        // Add listener to datastore type selected
        document.getElementById(`type-${datastoreCount}`).addEventListener("change", function(event){
            const datastoreType = this.value;
            const formId = this.getAttribute("data-form-id");
            const formContentDetailEl = document.getElementById(`form-${formId}-content-detail`).innerHTML = "";

            // Load engine or provider
            if (datastoreType === "datastore-engine"){
                document.getElementById(`engine-or-storage-provider-${formId}`).innerHTML = loadEngineIntoSelectedOption();
                document.getElementById(`engine-or-storage-provider-lb-${formId}`).innerHTML = `<strong>Engine</strong> <span style="color: red;">*</span>`;
            } else if (datastoreType === "storage-provider"){
                document.getElementById(`engine-or-storage-provider-${formId}`).innerHTML = loadStorageProviderIntoSelectedOption();
                document.getElementById(`engine-or-storage-provider-lb-${formId}`).innerHTML = `<strong>Provider</strong> <span style="color: red;">*</span>`;
            }

        });



        // Add listener to database engine or storage provider selected
        document.getElementById(`engine-or-storage-provider-${datastoreCount}`).addEventListener("change", function(event){
            const engineOrStorageProvider = this.value;
            const formId = this.getAttribute("data-form-id");
            document.getElementById(`datastore-form-${formId}`).setAttribute("data-engine-or-storage-provider", engineOrStorageProvider);
            loadFormFields(engineOrStorageProvider, formId, {}, false);
        });

        // Add listener to delete button
        document.getElementById(`btn-delete-datastore-${datastoreCount}`).addEventListener("click", function(event){
            const datastoreType = this.value;
            const formId = this.getAttribute("data-form-id");
            const datastoreFormContainer = document.getElementById(`datastore-form-container-${formId}`);

            // BEGIN remove datastore card
            datastoreFormContainer.classList.add("list-fade");
            datastoreFormContainer.style.opacity = '0';
            setTimeout(() => datastoreFormContainer.remove(), 1000);
            // EMD remove datastore card
        });


        // Add listener to form
        document.getElementById(`datastore-form-${datastoreCount}`).addEventListener("submit", function(event){
            event.preventDefault();
            const engineOrStorageProvider = this.getAttribute("data-engine-or-storage-provider");
            const methodType = this.getAttribute("data-method-type");
            const datastoreId = this.getAttribute("data-datastore-id");
            const formId = this.getAttribute("data-form-id");
            
            savedatastore(engineOrStorageProvider, methodType, datastoreId, formId);
        });


        // Increase count
        datastoreCount += 1;
        


    });




    // Add listener to confirm delete button
    document.getElementById(`confirm-delete`).addEventListener("click", function(event){

        const formId = this.getAttribute("data-form-id");
        const datastoreId = this.getAttribute("data-datastore-id");
    
        const datastoreFormContainer = document.getElementById(`datastore-form-container-${formId}`);
        const confirmDeleteClose = document.getElementById("delete-datastore-modal-close");
        this.innerHTML = deletingData;
        const url = `${base_url}/datastores/${datastoreId}`;


        fetch (url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            }
        }).then(res => {
            if (res.status === 204){
                this.innerHTML = "Confirm delete";
                datastoreFormContainer.classList.add("list-fade");
                datastoreFormContainer.style.opacity = '0';
                setTimeout(() => datastoreFormContainer.remove(), 1000);

                confirmDeleteClose.click();
                $.notify("Datastore Deleted.", "success");
                document.getElementById("delete-datastore-error-notify").innerHTML = jsonData.message;
            }else{
                
                document.getElementById("delete-datastore-error-notify").innerHTML = "Something went wrong";
            }

        }).catch(err => {
            
            this.innerHTML = "Confirm delete";
            console.log(err.message);
            document.getElementById("delete-datastore-error-notify").innerHTML = err.message;

        });

    });





});


const loadFormFields = (engineOrStorageProvider, formId, datastore, hasData) => {
    const formContentDetailEl = document.getElementById(`form-${formId}-content-detail`);
    
    switch(engineOrStorageProvider) {

        case "mysql":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "postgresql":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "mariadb":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "sqlite":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "mongodb":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "elasticsearch":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "redis":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "memcached":
            formContentDetailEl.innerHTML = loadDatastoreTemplate(formId, datastore, hasData);
          break;
        case "aws_s3":
            formContentDetailEl.innerHTML = loadAWSStorageTemplate(formId, datastore, hasData);
          break;
        case "azure_blobs":
            formContentDetailEl.innerHTML = loadAWSStorageTemplate(formId, datastore, hasData);
          break;
        case "gcp_gcs":
            formContentDetailEl.innerHTML = loadAWSStorageTemplate(formId, datastore, hasData);
          break;
        default:
            console.log("error")
          break;

      }

}



const loadDatastoreTypeIntoSelectedOption = () => {
    let content = "";
    for (let type_ in datastoreTypes){
        content += `<option value="${type_}">${datastoreTypes[type_]}</option>`;
    }
    return content;
}


const loadStorageProviderIntoSelectedOption = () => {
    let content = `<option value="0" selected disabled>--please choose--</option>`;
    for (let provider of backUpStorageProviders){
        content += `<option value="${provider._id}">${provider.name} (${provider.storage_name})</option>`;
    }
    return content;
}

const loadEngineIntoSelectedOption = () => {
    let content = `<option value="0" selected disabled>--please choose--</option>`;
    for (let engine of databaseEngines){
        content += `<option value="${engine._id}">${engine.name}</option>`;
    }
    return content;
}


const loadDatastoreRecord = () => {

    document.querySelector("#page-spinner").style.display = "none";
    const url = `${base_url}/datastores`;

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    }).then(res => {
        if (res.status === 200){
           return res.json();
        }
    }).then(jsonData => {

        const datastoreTypes_ = jsonData.datastore_types;
        backupFrequencyTypes = jsonData.backup_frequency_types;
        datastores = jsonData.datastores;

        for (let datastoreType of datastoreTypes_) {

            datastoreTypes[datastoreType.ds_type] = datastoreType.ds_type.replace("-", " ").split(' ').map(capitalize).join(' ');
            
            // Filter datastore engine and storage provider
            if(datastoreType.ds_type === "datastore-engine"){
                databaseEngines.push(datastoreType);
            }else if(datastoreType.ds_type === "storage-provider"){
                backUpStorageProviders.push(datastoreType);
            }
        }

        for (let datastoreData of datastores){
            displayDatastore(datastoreCount, datastoreData, false);
            datastoreCount += 1;
        }


    }).catch(error => {

        console.log(error.message);

    })
}


const loadDatastoreTemplate = (formId, datastore, hasData=false) => {

    const databaseName = hasData == true? datastore.database_name : "";
    const databaseHost = hasData == true? datastore.database_host : "";
    const databaseUser = hasData == true? datastore.database_user : "";
    const databasePassword = hasData == true? datastore.database_password : "";
    const databasePort = hasData == true? datastore.database_port : "";
    const datastoreId = hasData == true? datastore.datastore_id : "";
    const readOnly = hasData == true? "readonly" : "";

    return `

        <div  class="col-12 other-info">
            <label for="database-name-${formId}" class="form-label"><strong>Database name</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="database-name-${formId}" value="${databaseName}" >
            <p id="database-name-${formId}-error" style="color: red; display: none;">Database name required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="host-${formId}" class="form-label"><strong>Host</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="host-${formId}" value="${databaseHost}">
            <p id="host-${formId}-error" style="color: red; display: none;">Host required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="port-${formId}" class="form-label"><strong>Port</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="port-${formId}" value="${databasePort}">
            <p id="port-${formId}-error" style="color: red; display: none;">Port required</p>
        </div>



        <div  class="col-12 other-info">
            <label for="username-${formId}" class="form-label"><strong>Username</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="username-${formId}" value="${databaseUser}">
            <p id="username-${formId}-error" style="color: red; display: none;">Username required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="password-${formId}" class="form-label"><strong>Password</strong><span style="color: red;">*</span></label>
            <input type="password" class="form-control" id="password-${formId}" value="${databasePassword}">
            <p id="password-${formId}-error" style="color: red; display: none;">Password name required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="datastore-identifier-${formId}" class="form-label"><strong>datastore Identifier</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" ${readOnly} id="datastore-identifier-${formId}"  value="${datastoreId}">
            <p id="datastore-identifier-${formId}-error" style="color: red; display: none;">datastore identifier required</p>
        </div>
    
    `
}


const loadAWSStorageTemplate = (formId, datastore, hasData=false) => {

    const accessKeyId = hasData == true? datastore.access_key_id : "";
    const secretAccessKey = hasData == true? datastore.secret_access_key : "";
    const region = hasData == true? datastore.region : "";
    const bucketName = hasData == true? datastore.bucket_name : "";
    const keyOrDestination = hasData == true? datastore.key_or_destination : "";
    const datastoreId = hasData == true? datastore.datastore_id : "";
    const readOnly = hasData == true? "readonly" : "";

    return `

        <div  class="col-12 other-info">
            <label for="access-key-id-${formId}" class="form-label"><strong>Access key ID</strong><span style="color: red;">*</span></label>
            <input type="password" class="form-control" id="access-key-id-${formId}" value="${accessKeyId}">
            <p id="access-key-id-${formId}-error" style="color: red; display: none;">Access key ID required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="secret-access-key-${formId}" class="form-label"><strong>Secret access key</strong><span style="color: red;">*</span></label>
            <input type="password" class="form-control" id="secret-access-key-${formId}" value="${secretAccessKey}">
            <p id="secret-access-key-${formId}-error" style="color: red; display: none;">Secret access key required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="region-${formId}" class="form-label"><strong>Region</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="region-${formId}" value="${region}">
            <p id="region-${formId}-error" style="color: red; display: none;">Region required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="bucket-name-${formId}" class="form-label"><strong>S3 Bucket name</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="bucket-name-${formId}" value="${bucketName}">
            <p id="bucket-name-${formId}-error" style="color: red; display: none;">Bucket name required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="key-or-destination-${formId}" class="form-label"><strong>Key/Destination</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="key-or-destination-${formId}" value="${keyOrDestination}">
            <p id="key-or-destination-${formId}-error" style="color: red; display: none;">Key required</p>
        </div>


        <div  class="col-12 other-info">
            <label for="datastore-identifier-${formId}" class="form-label"><strong>datastore Identifier</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" ${readOnly} id="datastore-identifier-${formId}"  value="${datastoreId}">
            <p id="datastore-identifier-${formId}-error" style="color: red; display: none;">datastore identifier required</p>
        </div>
    
    `
}

const validateInput = (engineOrStorageProvider, formId) => {

    let isValid = true;
    switch(engineOrStorageProvider) {
    
        case "mysql":
            isValid = validateDatabaseInput(formId);
          break;
        case "postgresql":
            isValid = validateDatabaseInput(formId);
          break;
        case "mariadb":
            isValid = validateDatabaseInput(formId);
          break;
        case "sqlite":
            isValid = validateDatabaseInput(formId);
          break;
        case "mongodb":
            isValid = validateDatabaseInput(formId);
          break;
        case "elasticsearch":
            isValid = validateDatabaseInput(formId);
          break;
        case "redis":
            isValid = validateDatabaseInput(formId);
          break;
        case "memcached":
            isValid = validateDatabaseInput(formId);
          break;
        case "aws_s3":
            isValid = validateAWSStorageInput(formId);
          break;
        case "azure_blobs":
            isValid = validateAzureStorageInput(formId);
          break;
        case "gcp_gcs":
            isValid = validateGCPStorageInput(formId);
          break;
        default:
            console.log("error")
            isValid = true;
          break;

      }


      return isValid;

}

const validateDatabaseInput = (formId) => {
    let isValid = true;

    let datastoreType = "";
    let engineOrStorageProvider = "";
    const databaseName = document.querySelector(`#database-name-${formId}`).value;
    const host = document.querySelector(`#host-${formId}`).value;
    const port = document.querySelector(`#port-${formId}`).value;
    const username = document.querySelector(`#username-${formId}`).value;
    const password = document.querySelector(`#password-${formId}`).value;
    const datastoreId = document.querySelector(`#datastore-identifier-${formId}`).value;
    const datastoreTypeEl = document.querySelector(`#type-${formId}`);
    const engineOrStorageProviderEl = document.querySelector(`#engine-or-storage-provider-${formId}`);


    // form data
    datastoreData = {
        database_name: databaseName,
        database_host: host,
        database_port: port,
        database_user: username,
        database_password: password,
        datastore_id: datastoreId
    }



    if(datastoreTypeEl){
        datastoreType = datastoreTypeEl.value;
        
        if (datastoreType === "datastore-engine"){
            document.getElementById(`type-${formId}-error`).style.display = "block";
            isValid = false;
        }else if(datastoreType === "storage-provider"){
            document.getElementById(`type-${formId}-error`).style.display = "none";
        }
    }


    if(engineOrStorageProviderEl){
        engineOrStorageProvider = engineOrStorageProviderEl.value;
        
        if (engineOrStorageProvider === ""){
            document.getElementById(`engine-or-storage-provider-${formId}-error`).style.display = "block";
            isValid = false;
        }else{
            document.getElementById(`engine-or-storage-provider-${formId}-error`).style.display = "none";
        }
    }


    if (databaseName === ""){
        document.getElementById(`database-name-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`database-name-${formId}-error`).style.display = "none";
    }

    if (host === ""){
        document.getElementById(`host-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`host-${formId}-error`).style.display = "none";
    }

    if (port === ""){
        document.getElementById(`port-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`port-${formId}-error`).style.display = "none";
    }

    if (username === ""){
        document.getElementById(`username-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`username-${formId}-error`).style.display = "none";
    }

    if (password === ""){
        document.getElementById(`password-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`password-${formId}-error`).style.display = "none";
    }

    if (datastoreId === ""){
        document.getElementById(`datastore-identifier-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`datastore-identifier-${formId}-error`).style.display = "none";
    }

    return isValid;

}



const validateAWSStorageInput = (formId) => {
    let isValid = true;

    let datastoreType = "";
    let engineOrStorageProvider = "";
    const accessKeyId = document.querySelector(`#access-key-id-${formId}`).value;
    const secretAccessKey = document.querySelector(`#secret-access-key-${formId}`).value;
    const region = document.querySelector(`#region-${formId}`).value;
    const bucketName = document.querySelector(`#bucket-name-${formId}`).value;
    const keyOrDestination = document.querySelector(`#key-or-destination-${formId}`).value;
    const datastoreId = document.querySelector(`#datastore-identifier-${formId}`).value;
    const datastoreTypeEl = document.querySelector(`#type-${formId}`);
    const engineOrStorageProviderEl = document.querySelector(`#engine-or-storage-provider-${formId}`);


    // format data
    datastoreData = {
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
        region: region,
        bucket_name: bucketName,
        key_or_destination: keyOrDestination,
        datastore_id: datastoreId
    }



    if(datastoreTypeEl){
        datastoreType = datastoreTypeEl.value;
        
        if (datastoreType === ""){
            document.getElementById(`type-${formId}-error`).style.display = "block";
            isValid = false;
        }else{
            document.getElementById(`type-${formId}-error`).style.display = "none";
        }
    }


    if(engineOrStorageProviderEl){
        engineOrStorageProvider = engineOrStorageProviderEl.value;
        
        if (engineOrStorageProvider === ""){
            document.getElementById(`engine-or-storage-provider-${formId}-error`).style.display = "block";
            isValid = false;
        }else{
            document.getElementById(`engine-or-storage-provider-${formId}-error`).style.display = "none";
        }
    }


    if (accessKeyId === ""){
        document.getElementById(`access-key-id-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`access-key-id-${formId}-error`).style.display = "none";
    }

    if (secretAccessKey === ""){
        document.getElementById(`secret-access-key-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`secret-access-key-${formId}-error`).style.display = "none";
    }

    if (region === ""){
        document.getElementById(`region-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`region-${formId}-error`).style.display = "none";
    }

    if (bucketName === ""){
        document.getElementById(`bucket-name-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`bucket-name-${formId}-error`).style.display = "none";
    }

    if (keyOrDestination === ""){
        document.getElementById(`key-or-destination-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`key-or-destination-${formId}-error`).style.display = "none";
    }

    if (datastoreId === ""){
        document.getElementById(`datastore-identifier-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`datastore-identifier-${formId}-error`).style.display = "none";
    }



    return isValid;

}



const validateAzureStorageInput = () => {



}

const validateGCPStorageInput = () => {



}



const savedatastore = (engineOrStorageProvider, methodType, datastoreId, formId) => {
    const btnSaveEl = document.getElementById(`btn-save-datastore-${formId}`);


    // Validate form input
    if (validateInput(engineOrStorageProvider, formId)){

        btnSaveEl.innerHTML = savingData;
        const errorContainerEl = document.querySelector(`#error-container-${formId}`);
        const errorEl = document.querySelector(`#error-p-${formId}`);
        errorContainerEl.style.display = "none";
        let engineOrStorageProviderData = {}


        let url = `${base_url}/datastores`;
        let data = {};
        if (methodType === "POST"){

            const datastoreType = document.querySelector(`#type-${formId}`).value;
            const engineOrStorageProvider = document.querySelector(`#engine-or-storage-provider-${formId}`).value;
            
            if (datastoreType === "datastore-engine"){

                for (let engine of databaseEngines){
                    if (engineOrStorageProvider === engine._id){
                        engineOrStorageProviderData = engine;
                    }    
                }

            } else if (datastoreType === "storage-provider"){

                for (let provider of backUpStorageProviders){
                    if (engineOrStorageProvider === provider._id){
                        engineOrStorageProviderData = provider;
                    }    
                }

            }

            // format data
            data = {

                _id: datastoreData.datastore_id,
                type: datastoreType,
                engine_or_storage_provider: engineOrStorageProviderData,
                datastore: datastoreData
            };


        }else {

            // format data
            data = {
                datastore: datastoreData
            };
            url = `${base_url}/datastores/${datastoreId}`;
        }


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

                displayDatastore(formId, jsonData.datastore_data, true)
                btnSaveEl.innerHTML = "Save Changes";
                $.notify("datastore Saved.", "success");

            }else{

                // error prompt here
                errorEl.innerHTML = jsonData.message
                errorContainerEl.style.display = "block";
                btnSaveEl.innerHTML = "Save Changes";
            }

        }).catch(err => {
            
            btnSaveEl.innerHTML = "Save Changes";
            console.log(err.message);
            errorEl.innerHTML = err.message;
            errorContainerEl.style.display = "block";

        });



    }

}


const displayDatastore = (formId, datastore, performReplace=false) => {


    const divEl = document.createElement("div");
    divEl.setAttribute("class", "col-lg-12");
    divEl.setAttribute("data-form-id", formId);
    divEl.setAttribute("id", `datastore-form-container-${formId}`);
    divEl.setAttribute("data-engine-or-storage-provider-name", datastore.engine_or_storage_provider.name);

    console.log(datastore)
    divEl.innerHTML = `

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${datastore.engine_or_storage_provider.name}</h5>

                    <form id="datastore-form-${formId}" style="display: block;" data-form-id="${formId}" class="form" action="#" data-method-type="PUT" data-datastore-id="${datastore._id}" data-engine-or-storage-provider="${datastore.engine_or_storage_provider._id}">

                        <div class="col-12 other-info">
                            <img height="120" src="/static/img/${datastore.engine_or_storage_provider.image}" />
                        </div>

                        <div id="form-${formId}-content-detail">  

                        
                        </div>

                        <div>
                            <button style="float: right;" id="btn-save-datastore-${formId}" data-form-id="${formId}" data-datastore-id="${datastore._id}"  type="submit" class="btn btn-primary">Save Changes</button>
                            <button style="float: right; margin-right: 5px;" type="button" id="btn-delete-datastore-${formId}" data-form-id="${formId}" data-datastore-id="${datastore._id}" data-bs-toggle="modal" data-bs-target="#delete-datastore-modal" class="btn btn-danger">Delete</button>
                        </div>

                    </form>


                    <div id="error-container-${formId}" style="display: none; margin-top:20px;" class="alert alert-danger alert-dismissible fade show" role="alert">
                        <p id="error-p-${formId}" ></p>
                    </div>

                </div>

            </div>
    `;


    if (performReplace){
        // get handle to element to replace
        const oldChild = document.querySelector(`#datastore-form-container-${formId}`);
        
        // get handle to the parent node
        const parentNode = oldChild.parentNode;
        
        parentNode.replaceChild(divEl, oldChild);
    }else{
        document.getElementById("datastores-container").appendChild(divEl);    
    }




    loadFormFields(datastore.engine_or_storage_provider._id, formId, datastore.datastore, true);




    // Add listener to form
    document.getElementById(`datastore-form-${formId}`).addEventListener("submit", function(event){
        event.preventDefault();
        const engineOrStorageProvider = this.getAttribute("data-engine-or-storage-provider");
        const methodType = this.getAttribute("data-method-type");
        const datastoreId = this.getAttribute("data-datastore-id");
        const formId = this.getAttribute("data-form-id");
        
        savedatastore(engineOrStorageProvider, methodType, datastoreId, formId);
    });



    // Add listener to delete button
    document.getElementById(`btn-delete-datastore-${formId}`).addEventListener("click", function(event){

        const formId = this.getAttribute("data-form-id");
        const datastoreId = this.getAttribute("data-datastore-id");
    
        const datastoreFormContainer = document.getElementById(`datastore-form-container-${formId}`)
        const engineOrStorageProviderName = datastoreFormContainer.getAttribute("data-engine-or-storage-provider-name");

        
        const content = `<p>Are you sure, you want to delete the selected ${engineOrStorageProviderName} datastores with ID (${datastoreId})</p>`;
        document.getElementById("delete-body-modal").innerHTML=`${content}`;

        const deleteBtnEl = document.getElementById("confirm-delete");
        deleteBtnEl.setAttribute("data-datastore-id", datastoreId);
        deleteBtnEl.setAttribute("data-form-id", formId);

    });



}




