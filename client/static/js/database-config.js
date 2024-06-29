let manageCredentialTypes = [];
let manageCredentials = [];
let databaseEngine = {};
let backUpStorageProvider = {};
let credentialCount = 0;
let credentialData = {};
const pageLoading =  `
<a class="btn btn" type="button" disabled>
<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Fetching data...
</a>
`
const savingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Saving...`;
const deletingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Deleting...`;



document.addEventListener("DOMContentLoaded", function(event){

    loadManageCredentialRecord();


    document.querySelector("#btn-add-new-credential").addEventListener("click", function(event){

        const divEl = document.createElement("div");
        divEl.setAttribute("class", "col-lg-12");
        divEl.setAttribute("data-form-id", credentialCount);
        divEl.setAttribute("id", `credential-form-container-${credentialCount}`);
        divEl.innerHTML = `

                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title"></h5>

                        <form id="credential-form-${credentialCount}" style="display: block;" data-form-id="${credentialCount}" class="form" action="#" data-method-type="POST" data-credential-id="" data-engine-or-storage-provider="">

                            <div class="col-12 other-info">
                                <label for="type-${credentialCount}" class="form-label"><strong>Type</strong> <span style="color: red;">*</span></label>
                                <select required id="type-${credentialCount}" data-form-id="${credentialCount}" class="form-select credential-type">
                                    <option value="" selected disabled>--please choose--</option>
                                    ${loadCredentialTypeIntoSelectedOption()}
                                </select>
                                <p id="type-${credentialCount}-error" style="color: red; display: none;">Type required</p>
                            </div>


                            <div class="col-12 other-info">
                                <label for="engine-or-storage-provider-${credentialCount}" id="engine-or-storage-provider-lb-${credentialCount}" class="form-label"><strong>Engine</strong> <span style="color: red;">*</span></label>
                                <select required id="engine-or-storage-provider-${credentialCount}" data-form-id="${credentialCount}" class="form-select">
                                    

                                </select>
                                <p id="engine-or-storage-provider-${credentialCount}-error" style="color: red; display: none;">Engine or Provider required</p>
                            </div>


                            <div id="form-${credentialCount}-content-detail">  




                            
                            </div>



                            <div>
                                <button style="float: right;" id="btn-save-credential-${credentialCount}" data-form-id="${credentialCount}"  type="submit" class="btn btn-primary">Save Changes</button>
                                <button style="float: right; margin-right: 5px;" type="button" id="btn-delete-credential-${credentialCount}" data-form-id="${credentialCount}" class="btn btn-danger">Delete</button>
                            </div>

                        </form>

                        <div id="error-container-${credentialCount}" style="display: none; margin-top: 100px;" class="alert alert-danger alert-dismissible fade show" role="alert">
                            <p id="error-p-${credentialCount}" ></p>
                        </div>

                    </div>

                </div>
        `;
        


        document.getElementById("credentials-container").appendChild(divEl);

        // Add listener to credential type selected
        document.getElementById(`type-${credentialCount}`).addEventListener("change", function(event){
            const credentialType = this.value;
            const formId = this.getAttribute("data-form-id");
            const formContentDetailEl = document.getElementById(`form-${formId}-content-detail`).innerHTML = "";

            // Load engine or provider
            if (credentialType === "database_engines"){
                document.getElementById(`engine-or-storage-provider-${formId}`).innerHTML = loadEngineIntoSelectedOption();
                document.getElementById(`engine-or-storage-provider-lb-${formId}`).innerHTML = `<strong>Engine</strong> <span style="color: red;">*</span>`;
            } else if (credentialType === "storage_providers"){
                document.getElementById(`engine-or-storage-provider-${formId}`).innerHTML = loadStorageProviderIntoSelectedOption();
                document.getElementById(`engine-or-storage-provider-lb-${formId}`).innerHTML = `<strong>Provider</strong> <span style="color: red;">*</span>`;
            }

        });



        // Add listener to database engine or storage provider selected
        document.getElementById(`engine-or-storage-provider-${credentialCount}`).addEventListener("change", function(event){
            const engineOrStorageProvider = this.value;
            const formId = this.getAttribute("data-form-id");
            document.getElementById(`credential-form-${formId}`).setAttribute("data-engine-or-storage-provider", engineOrStorageProvider);
            loadFormFields(engineOrStorageProvider, formId, {}, false);
        });

        // Add listener to delete button
        document.getElementById(`btn-delete-credential-${credentialCount}`).addEventListener("click", function(event){
            const credentialType = this.value;
            const formId = this.getAttribute("data-form-id");
            const credentialFormContainer = document.getElementById(`credential-form-container-${formId}`);

            // BEGIN remove credential card
            credentialFormContainer.classList.add("list-fade");
            credentialFormContainer.style.opacity = '0';
            setTimeout(() => credentialFormContainer.remove(), 1000);
            // EMD remove credential card
        });


        // Add listener to form
        document.getElementById(`credential-form-${credentialCount}`).addEventListener("submit", function(event){
            event.preventDefault();
            const engineOrStorageProvider = this.getAttribute("data-engine-or-storage-provider");
            const methodType = this.getAttribute("data-method-type");
            const credentialId = this.getAttribute("data-credential-id");
            const formId = this.getAttribute("data-form-id");
            
            saveCredential(engineOrStorageProvider, methodType, credentialId, formId);
        });


        // Increase count
        credentialCount += 1;
        


    });




    // Add listener to confirm delete button
    document.getElementById(`confirm-delete`).addEventListener("click", function(event){

        const formId = this.getAttribute("data-form-id");
        const credentialId = this.getAttribute("data-credential-id");
    
        const credentialFormContainer = document.getElementById(`credential-form-container-${formId}`);
        const confirmDeleteClose = document.getElementById("delete-credential-modal-close");
        this.innerHTML = deletingData;

        // Delete data
        fetch (`/credentials/${credentialId}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"}
        }).then(res => {

            return res.json();

        }).then(jsonData => {

            console.log(jsonData)

            if (jsonData.success){

                this.innerHTML = "Confirm delete";

                // BEGIN remove credential card
                credentialFormContainer.classList.add("list-fade");
                credentialFormContainer.style.opacity = '0';
                setTimeout(() => credentialFormContainer.remove(), 1000);
                // EMD remove credential card

                confirmDeleteClose.click();
                $.notify("Credential Deleted.", "success");

            }else{

                // error prompt here
                this.innerHTML = "Confirm delete";
                document.getElementById("delete-credential-error-notify").innerHTML = jsonData.message;
            }

        }).catch(err => {
            
            this.innerHTML = "Confirm delete";
            console.log(err.message);
            document.getElementById("delete-credential-error-notify").innerHTML = err.message;

        });





    });





});


loadFormFields = (engineOrStorageProvider, formId, credential, hasData) => {
    const formContentDetailEl = document.getElementById(`form-${formId}-content-detail`);
    
    switch(engineOrStorageProvider) {

        case "mysql":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "postgresql":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "mariadb":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "sqlite":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "mongodb":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "elasticsearch":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "redis":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "memcached":
            formContentDetailEl.innerHTML = loadDatabaseCredentialTemplate(formId, credential, hasData);
          break;
        case "aws_s3":
            formContentDetailEl.innerHTML = loadAWSStorageCredentialTemplate(formId, credential, hasData);
          break;
        case "azure_blobs":
            formContentDetailEl.innerHTML = loadAWSStorageCredentialTemplate(formId, credential, hasData);
          break;
        case "gcp_gcs":
            formContentDetailEl.innerHTML = loadAWSStorageCredentialTemplate(formId, credential, hasData);
          break;
        default:
            console.log("error")
          break;

      }

}



const loadCredentialTypeIntoSelectedOption = () => {
    let content = "";

    for (let type_ of manageCredentialTypes){
        content += `<option value="${type_._id}">${type_.name}</option>`;
    }

    return content;
}

const loadStorageProviderIntoSelectedOption = () => {
    let content = `<option value="0" selected disabled>--please choose--</option>`;

    for (let provider of backUpStorageProvider.providers){
        content += `<option value="${provider._id}">${provider.name} (${provider.storage_name})</option>`;
    }

    return content;
}

const loadEngineIntoSelectedOption = () => {
    let content = `<option value="0" selected disabled>--please choose--</option>`;

    for (let engine of databaseEngine.engines){
        content += `<option value="${engine._id}">${engine.name}</option>`;
    }

    return content;
}


const loadManageCredentialRecord = () => {

    // Start spinner
    document.querySelector("#page-spinner").style.display = "none";

    fetch("/credentials", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then(res => {

        if (res.status === 200){
           return res.json();
        }

    }).then(jsonData => {

        console.log(jsonData)
        // Get data
        manageCredentialTypes = jsonData.credential_types;
        manageCredentials = jsonData.credentials;

        for (let type_ of manageCredentialTypes){

            if (type_._id === "database_engines"){
                databaseEngine = type_;
            }else if (type_._id === "storage_providers"){
                backUpStorageProvider = type_;
            }
        }


        for (let credentialData of manageCredentials){

            displaySavedCredential(credentialCount, credentialData, false);

            credentialCount += 1;
        }


    }).catch(error => {

        console.log(error.message);

    })
}


const loadDatabaseCredentialTemplate = (formId, credential, hasData=false) => {

    const databaseName = hasData == true? credential.database_name : "";
    const databaseHost = hasData == true? credential.database_host : "";
    const databaseUser = hasData == true? credential.database_user : "";
    const databasePassword = hasData == true? credential.database_password : "";
    const databasePort = hasData == true? credential.database_port : "";
    const credentialId = hasData == true? credential.credential_id : "";
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
            <label for="credential-identifier-${formId}" class="form-label"><strong>Credential Identifier</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" ${readOnly} id="credential-identifier-${formId}"  value="${credentialId}">
            <p id="credential-identifier-${formId}-error" style="color: red; display: none;">Credential identifier required</p>
        </div>
    
    `
}


const loadAWSStorageCredentialTemplate = (formId, credential, hasData=false) => {

    const accessKeyId = hasData == true? credential.access_key_id : "";
    const secretAccessKey = hasData == true? credential.secret_access_key : "";
    const region = hasData == true? credential.region : "";
    const bucketName = hasData == true? credential.bucket_name : "";
    const keyOrDestination = hasData == true? credential.key_or_destination : "";
    const credentialId = hasData == true? credential.credential_id : "";
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
            <label for="credential-identifier-${formId}" class="form-label"><strong>Credential Identifier</strong><span style="color: red;">*</span></label>
            <input type="text" class="form-control" ${readOnly} id="credential-identifier-${formId}"  value="${credentialId}">
            <p id="credential-identifier-${formId}-error" style="color: red; display: none;">Credential identifier required</p>
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

    let credentialType = "";
    let engineOrStorageProvider = "";
    const databaseName = document.querySelector(`#database-name-${formId}`).value;
    const host = document.querySelector(`#host-${formId}`).value;
    const port = document.querySelector(`#port-${formId}`).value;
    const username = document.querySelector(`#username-${formId}`).value;
    const password = document.querySelector(`#password-${formId}`).value;
    const credentialId = document.querySelector(`#credential-identifier-${formId}`).value;
    const credentialTypeEl = document.querySelector(`#type-${formId}`);
    const engineOrStorageProviderEl = document.querySelector(`#engine-or-storage-provider-${formId}`);


    // form data
    credentialData = {
        database_name: databaseName,
        database_host: host,
        database_port: port,
        database_user: username,
        database_password: password,
        credential_id: credentialId
    }



    if(credentialTypeEl){
        credentialType = credentialTypeEl.value;
        
        if (credentialType === ""){
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

    if (credentialId === ""){
        document.getElementById(`credential-identifier-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`credential-identifier-${formId}-error`).style.display = "none";
    }

    return isValid;

}



const validateAWSStorageInput = (formId) => {
    let isValid = true;

    let credentialType = "";
    let engineOrStorageProvider = "";
    const accessKeyId = document.querySelector(`#access-key-id-${formId}`).value;
    const secretAccessKey = document.querySelector(`#secret-access-key-${formId}`).value;
    const region = document.querySelector(`#region-${formId}`).value;
    const bucketName = document.querySelector(`#bucket-name-${formId}`).value;
    const keyOrDestination = document.querySelector(`#key-or-destination-${formId}`).value;
    const credentialId = document.querySelector(`#credential-identifier-${formId}`).value;
    const credentialTypeEl = document.querySelector(`#type-${formId}`);
    const engineOrStorageProviderEl = document.querySelector(`#engine-or-storage-provider-${formId}`);


    // format data
    credentialData = {
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
        region: region,
        bucket_name: bucketName,
        key_or_destination: keyOrDestination,
        credential_id: credentialId
    }



    if(credentialTypeEl){
        credentialType = credentialTypeEl.value;
        
        if (credentialType === ""){
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

    if (credentialId === ""){
        document.getElementById(`credential-identifier-${formId}-error`).style.display = "block";
        isValid = false;
    }else{
        document.getElementById(`credential-identifier-${formId}-error`).style.display = "none";
    }



    return isValid;

}



const validateAzureStorageInput = () => {



}

const validateGCPStorageInput = () => {



}



const saveCredential = (engineOrStorageProvider, methodType, credentialId, formId) => {
    const btnSaveEl = document.getElementById(`btn-save-credential-${formId}`);


    // Validate form input
    if (validateInput(engineOrStorageProvider, formId)){

        btnSaveEl.innerHTML = savingData;
        const errorContainerEl = document.querySelector(`#error-container-${formId}`);
        const errorEl = document.querySelector(`#error-p-${formId}`);
        errorContainerEl.style.display = "none";
        let engineOrStorageProviderData = {}


        
        let url = `/credentials/${credentialId}`;
        let data = {};

        if (methodType === "POST"){

            url = "/credentials";


            const credentialType = document.querySelector(`#type-${formId}`).value;
            const engineOrStorageProvider = document.querySelector(`#engine-or-storage-provider-${formId}`).value;
            
            if (credentialType === "database_engines"){

                for (let engine of databaseEngine.engines){
                    if (engineOrStorageProvider === engine._id){
                        engineOrStorageProviderData = engine;
                    }    
                }

            } else if (credentialType === "storage_providers"){

                for (let provider of backUpStorageProvider.providers){
                    if (engineOrStorageProvider === provider._id){
                        engineOrStorageProviderData = provider;
                    }    
                }

            }

            // format data
            data = {

                _id: credentialData.credential_id,
                type: credentialType,
                engine_or_storage_provider: engineOrStorageProviderData,
                credential: credentialData
            };


        }else {

            // format data
            data = {
                credential: credentialData
            };
        }





        // Save data
        fetch (url, {
            method: methodType,
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        }).then(res => {

            return res.json();

        }).then(jsonData => {

            console.log(jsonData)

            if (jsonData.success){

                displaySavedCredential(formId, jsonData.credential_data, true)
                btnSaveEl.innerHTML = "Save Changes";
                $.notify("Credential Saved.", "success");

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


const displaySavedCredential = (formId, credential, performReplace=false) => {


    const divEl = document.createElement("div");
    divEl.setAttribute("class", "col-lg-12");
    divEl.setAttribute("data-form-id", formId);
    divEl.setAttribute("id", `credential-form-container-${formId}`);
    divEl.setAttribute("data-engine-or-storage-provider-name", credential.engine_or_storage_provider.name);

    console.log(credential)
    divEl.innerHTML = `

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${credential.engine_or_storage_provider.name}</h5>

                    <form id="credential-form-${formId}" style="display: block;" data-form-id="${formId}" class="form" action="#" data-method-type="PUT" data-credential-id="${credential._id}" data-engine-or-storage-provider="${credential.engine_or_storage_provider._id}">

                        <div class="col-12 other-info">
                            <img height="120" src="/static/img/${credential.engine_or_storage_provider.image}" />
                        </div>





                        <div id="form-${formId}-content-detail">  




                        
                        </div>



                        <div>
                            <button style="float: right;" id="btn-save-credential-${formId}" data-form-id="${formId}" data-credential-id="${credential._id}"  type="submit" class="btn btn-primary">Save Changes</button>
                            <button style="float: right; margin-right: 5px;" type="button" id="btn-delete-credential-${formId}" data-form-id="${formId}" data-credential-id="${credential._id}" data-bs-toggle="modal" data-bs-target="#delete-credential-modal" class="btn btn-danger">Delete</button>
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
        const oldChild = document.querySelector(`#credential-form-container-${formId}`);
        
        // get handle to the parent node
        const parentNode = oldChild.parentNode;
        
        parentNode.replaceChild(divEl, oldChild);
    }else{
        document.getElementById("credentials-container").appendChild(divEl);    
    }




    loadFormFields(credential.engine_or_storage_provider._id, formId, credential.credential, true);




    // Add listener to form
    document.getElementById(`credential-form-${formId}`).addEventListener("submit", function(event){
        event.preventDefault();
        const engineOrStorageProvider = this.getAttribute("data-engine-or-storage-provider");
        const methodType = this.getAttribute("data-method-type");
        const credentialId = this.getAttribute("data-credential-id");
        const formId = this.getAttribute("data-form-id");
        
        saveCredential(engineOrStorageProvider, methodType, credentialId, formId);
    });



    // Add listener to delete button
    document.getElementById(`btn-delete-credential-${formId}`).addEventListener("click", function(event){

        const formId = this.getAttribute("data-form-id");
        const credentialId = this.getAttribute("data-credential-id");
    
        const credentialFormContainer = document.getElementById(`credential-form-container-${formId}`)
        const engineOrStorageProviderName = credentialFormContainer.getAttribute("data-engine-or-storage-provider-name");

        
        const content = `<p>Are you sure, you want to delete the selected ${engineOrStorageProviderName} credentials with ID (${credentialId})</p>`;
        document.getElementById("delete-body-modal").innerHTML=`${content}`;

        const deleteBtnEl = document.getElementById("confirm-delete");
        deleteBtnEl.setAttribute("data-credential-id", credentialId);
        deleteBtnEl.setAttribute("data-form-id", formId);

    });



}




