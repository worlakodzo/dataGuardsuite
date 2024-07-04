//https://notifyjs.jpillora.com/
import {base_url} from "./variables.js"
import { getToken } from "./jwt.js"

const pageLoading =  `
<a class="btn btn" type="button" disabled>
<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Fetching data...
</a>
`
const savingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Saving...`;
const deletingData = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Deletings...`;


document.addEventListener("DOMContentLoaded", function(event){

    // Load user list
    const userListContainerEl = document.querySelector("#user-list-container");
    if (userListContainerEl){
        loadUsers();
    }

    // save user data
    const formEl = document.querySelector("#user-data-form");
    if (formEl){
        formEl.onsubmit = saveUserData;
    }

    // update user data
    const editProfileFormEl = document.querySelector("#edit-profile-form");
    if (editProfileFormEl){
        getUserProfile();
        editProfileFormEl.onsubmit = updateUserData;
        document.querySelector("#user-settings-form").onsubmit = updateUserSetting;
        document.querySelector("#profile-change-password-form").onsubmit = changePassword;
    }

    // Delete user data
    const confirmDeleteUserEl = document.querySelector("#confirm-delete");
    if (confirmDeleteUserEl){
        confirmDeleteUserEl.onclick = deleteUser;
    }



});


const loadUsers = () => {

    const url = `${base_url}/users`;
    const userListContainerEl = document.querySelector("#user-list-container");
    userListContainerEl.style.display = "none";
    const spinnerEl = document.querySelector("#spinner-content");
    spinnerEl.innerHTML = pageLoading;



    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
             "Authorization": `Bearer ${getToken()}`
            }
    }).then(res => {

        if (res.status === 200){
            // Convert data to json
            return res.json();
        }else if(res.status === 401){
            window.location.href = "/login";
        }else{

        }

    }).then(dataJson => {

        console.log(dataJson);
        displayTableContent(dataJson)

        userListContainerEl.style.display = "block";
        spinnerEl.innerHTML = " ";
        addDeleteUserListener();

        
    }).catch(error => {


    
    })

}


const displayTableContent = (data) => {

    let content = "";
    let count = 1;
    for(let user of data){
        content += formatUserData(user, count)
        count += 1;
    }

    // update table content
    if (data.length){
        document.querySelector("#user-list-table-body").innerHTML = content;
    }else{
        // no data found
    }

}


const formatUserData = (user, count) => {

    return `
            <tr id="user-list-row-id-${user._id}" class="list-fade" scope="row">
                <td>${count}</td>
                <td>${user.email}</td>
                <td>${user.username}</td>
                <td>${user.is_active}</td>
                <td>${user.role_details.name}</td>
                <td style="float: right">
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <a type="button" class="btn btn-primary" href="/users/profile/${user._id}"><i class="bi bi-eye-fill"></i></a>
                        <a type="button" data-id="${user._id}" data-username="${user.email}"  data-username="${user.username}" data-bs-toggle="modal" data-bs-target="#delete-user-modal" class="btn btn-danger delete-user"><i class="bx bxs-trash-alt"></i></a>
                    </div>
                </td>

            </tr>
    `
}

const saveUserData = (event) => {
    event.preventDefault();

    const btnCreateUserEl = document.getElementById("btn-create-user");
    document.querySelector("#save-error-content-container").style.display = "none";
    document.querySelector("#save-success-content-container").style.display = "none";

    const url = `${base_url}/users`

    let isValid = validateUserSaveData();

    const password = document.querySelector("#password").value;
    const username = document.querySelector("#username").value;
    const phone = document.querySelector("#phone").value;
    const email = document.querySelector("#email").value;
    
    const data = {
        username: username,
        password: password,
        phone: phone,
        email: email
    }

    if (isValid){

        btnCreateUserEl.innerHTML = savingData;
        fetch(url, {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)

        }).then(res => {
            if (res.status === 201){
                $.notify("User Saved.", "success");
                btnCreateUserEl.innerHTML = "Create User";
                window.location.href = "/users";

            }else if(res.status === 401){
                window.location.href = "/login";
            }else{

                document.querySelector("#save-error-content").innerHTML = "Failed to create user";
                document.querySelector("#save-error-content-container").style.display = "block";
            }

        }).catch(error => {
            
            document.querySelector("#save-error-content").innerHTML = jsonData.msg;
            document.querySelector("#save-error-content-container").style.display = "block";
            btnCreateUserEl.innerHTML = "Create User";
            console.error(error);
        })


    }


}


const validateUserSaveData = () => {
    let isValid = true;
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const phone = document.querySelector("#phone").value;
    const email = document.querySelector("#email").value;
    

    if(username === ""){
        document.querySelector("#username-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#username-error").style.display = "none";
    }

    if(phone === ""){
        document.querySelector("#phone-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#phone-error").style.display = "none";
    }

    if(email === ""){
        document.querySelector("#email-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#email-error").style.display = "none";
    }

    if(password === ""){
        document.querySelector("#password-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#password-error").style.display = "none";
    }

    return isValid;

}


const validateUserUpdateData = () => {

    let isValid = true;
    const phone = document.querySelector("#phone").value;

    if(phone === ""){
        document.querySelector("#phone-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#phone-error").style.display = "none";
    }
    return isValid;

}

const getUserProfile =  () => {

    
    const id = document.querySelector("#edit-profile-form").getAttribute("data-id")
    const url =  `${base_url}/users/${id}`

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
        }else{

        }
    }).then(dataJson => {
        const content = displayUserProfile(dataJson);
        const overView = displayUserOverView(dataJson);
        const profileCard = displayUserProfileCard(dataJson)
        document.querySelector("#edit-profile-form").innerHTML = content;
        document.querySelector("#profile-overview").innerHTML = overView;
        document.querySelector("#profile-card").innerHTML = profileCard;
        displayUserSettings(dataJson);
    })

}


const displayUserSettings = (data) => {
    // https://stackoverflow.com/questions/8206565/check-uncheck-checkbox-with-javascript
    document.getElementById("changes-to-user-info").checked = data.email_notification.changes_to_user_info;
    document.getElementById("daily-update-on-jobs").checked = data.email_notification.daily_update_on_jobs;
    document.getElementById("new-db-credential-added").checked = data.email_notification.new_db_credential_added;
    document.getElementById("security-alerts").checked = data.email_notification.security_alerts;
}


const displayUserProfileCard = (data) => {

    return `

        <img src="${data.photo_url}" alt="Profile" class="rounded-circle">
        <h2>${data.email}</h2>
        <h3>${data.role_details.role}</h3>
 
    `
}



const displayUserOverView = (data) => {

    return `

        <h5 class="card-title">About</h5>
        <p class="small fst-italic">${data.user_profile.bio}.</p>

        <h5 class="card-title">Profile Details</h5>

        <div class="row">
        <div class="col-lg-3 col-md-4 label ">Email</div>
        <div class="col-lg-9 col-md-8">${data.email}</div>
        </div>

        <div class="row">
        <div class="col-lg-3 col-md-4 label ">Username</div>
        <div class="col-lg-9 col-md-8">${data.username}</div>
        </div>


        <div class="row">
        <div class="col-lg-3 col-md-4 label">Role</div>
        <div class="col-lg-9 col-md-8">${data.role_details.role}</div>
        </div>


        <div class="row">
        <div class="col-lg-3 col-md-4 label">Address</div>
        <div class="col-lg-9 col-md-8">${data.user_profile.address}</div>
        </div>

        <div class="row">
        <div class="col-lg-3 col-md-4 label">Phone</div>
        <div class="col-lg-9 col-md-8">${data.user_profile.phone}</div>
        </div>

    
    `
}


const displayUserProfile = (data) => {

    return `

        <div class="row mb-3">
            <label for="profileImage"  class="col-md-4 col-lg-3 col-form-label">Profile Image</label>
            <div class="col-md-8 col-lg-9">
            <img src="${data.photo_url}" alt="Profile">
            <div class="pt-2">
                <a href="#" class="btn btn-primary btn-sm" title="Upload new profile image"><i class="bi bi-upload"></i></a>
                <a href="#" class="btn btn-danger btn-sm" title="Remove my profile image"><i class="bi bi-trash"></i></a>
            </div>
            </div>
        </div>

        <div class="row mb-3">
            <label for="about" class="col-md-4 col-lg-3 col-form-label">About</label>
            <div class="col-md-8 col-lg-9">
            <textarea name="about" class="form-control" id="about" style="height: 100px">${data.user_profile.bio}</textarea>
            </div>
        </div>


        <div class="row mb-3">
            <label for="job-title" class="col-md-4 col-lg-3 col-form-label">Job</label>
            <div class="col-md-8 col-lg-9">
            <input name="job_title" type="text" class="form-control" id="job-title" value="${data.user_profile.job_title}">
            </div>
        </div>


        <div class="row mb-3">
            <label for="address" class="col-md-4 col-lg-3 col-form-label">Address</label>
            <div class="col-md-8 col-lg-9">
            <input name="address" type="text" class="form-control" id="address" value="${data.user_profile.address}">
            </div>
        </div>

        <div class="row mb-3">
            <label for="phone" class="col-md-4 col-lg-3 col-form-label">Phone <span style="color: red;">*</span></label>
            <div class="col-md-8 col-lg-9">
            <input name="phone" type="text" class="form-control" id="phone" value="${data.user_profile.phone}">
            </div>
            <p id="phone-error" style="color: red; display: none;">Phone field required</p>
        </div>

        <div class="text-center">
            <button type="submit" id="btn-save-profile-changes" class="btn btn-primary">Save Changes</button>
        </div>

    `
}


const updateUserData = (event) => {
    event.preventDefault();

    
    const formEl = document.querySelector("#edit-profile-form");
    const id = formEl.getAttribute("data-id");
    const btnSaveChanagesEl = document.getElementById("btn-save-profile-changes");
    const url = `${base_url}/users/${id}`
    const isValid = validateUserUpdateData();
    console.log(isValid)
    
    const phone = document.querySelector("#phone").value;
    const about = document.querySelector("#about").value;
    const job_title = document.querySelector("#job-title").value;
    const address = document.querySelector("#address").value;

    const data = {
        user_profile: {
            phone: phone,
            bio: about,
            job_title: job_title,
            address: address,
        }
    }
    
    if (isValid){

        btnSaveChanagesEl.innerHTML = savingData;
        fetch(url, {

            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)

        }).then(res => {
                return res.json();
        }).then(jsonData => {

            if(jsonData.success){
                $.notify("Profile Detail Saved.", "success");
                const content = displayUserProfile(dataJson.data);
                const overView = displayUserOverView(dataJson.data);
                const profileCard = displayUserProfileCard(dataJson.data)
                document.querySelector("#edit-profile-form").innerHTML = content;
                document.querySelector("#profile-overview").innerHTML = overView;
                document.querySelector("#profile-card").innerHTML = profileCard;
                displayUserSettings(dataJson.data);
                
            }
            btnSaveChanagesEl.innerHTML = "Save Changes";

        }).catch(error => {
            btnSaveChanagesEl.innerHTML = "Save Changes";
        })

    }
}

const changePassword = (event) => {
    event.preventDefault();

    const formEl = document.querySelector("#edit-profile-form");
    const id = formEl.getAttribute("data-id");
    const btnSaveChanagesEl = document.getElementById("btn-change-password");
    const url = `${base_url}/users/${id}`;
    let isValid = true;
    
    const newPassword = document.querySelector("#new-password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;
    
    if(newPassword === ""){
        document.querySelector("#new-password-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#new-password-error").style.display = "none";
    }

    if(confirmPassword === ""){
        document.querySelector("#confirm-password-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#confirm-password-error").style.display = "none";
    }

    if (newPassword !== confirmPassword){
        document.querySelector("#password-not-match-error").style.display = "block";
        isValid = false;  
    }else{
        document.querySelector("#password-not-match-error").style.display = "none"; 
    }
    

    if (isValid){
        btnSaveChanagesEl.innerHTML = savingData;
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({password: newPassword})
        }).then(res => {
            if (res.status === 200){
                $.notify("Password Saved.", "success");
                document.querySelector("#new-password").value = "";
                document.querySelector("#confirm-password").value = "";
            }
            btnSaveChanagesEl.innerHTML = "Save Changes";
        }).catch(error => {
            btnSaveChanagesEl.innerHTML = "Save Changes";
            //console.error(error);
        })
    }
}


const updateUserSetting = (event) => {
    event.preventDefault();

    const formEl = document.querySelector("#edit-profile-form");
    const id = formEl.getAttribute("data-id");
    const btnSaveChanagesEl = document.getElementById("btn-save-user-setting");
    btnSaveChanagesEl.innerHTML = savingData;
    const url = `${base_url}/users/${id}`;

    fetch(url, {

        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            email_notification: {
                changes_to_user_info: document.getElementById("changes-to-user-info").checked,
                daily_update_on_jobs: document.getElementById("daily-update-on-jobs").checked,
                new_db_credential_added: document.getElementById("new-db-credential-added").checked,
                security_alerts: document.getElementById("security-alerts").checked
            }
        })

    }).then(res => {
        if (res.status === 200){
            $.notify("Setting Saved.", "success");
        }else if(res.status === 401){
            window.location.href = "/login";
        }
        btnSaveChanagesEl.innerHTML = "Save Changes";

    }).catch(error => {
        btnSaveChanagesEl.innerHTML = "Save Changes";
    })
}

const addDeleteUserListener = () => {
    const deleteBtnEls = document.querySelectorAll(".delete-user");
    deleteBtnEls.forEach(element => {

        element.addEventListener("click", function(event){
            const userId = this.getAttribute("data-id");
            const username = this.getAttribute("data-username");

            const message =  `<p>Are you sure you want to delete user <strong>${username}</strong>. This operation will delete all asset related to user <strong>${username}</strong></p>`
            document.getElementById("delete-user-content").innerHTML= message;
            const deleteBtnEl = document.getElementById("confirm-delete");
            deleteBtnEl.setAttribute("data-username", username);
            deleteBtnEl.setAttribute("data-id", userId);
      });

    });
  }

const deleteUser = (event) => {
    event.preventDefault();

    const btnDeleteEl = document.querySelector("#confirm-delete");
    const id = btnDeleteEl.getAttribute("data-id");
    const userRowEl = document.querySelector(`#user-list-row-id-${id}`);
    btnDeleteEl.innerHTML = deletingData;
    const url = `${base_url}/users/${id}`;

    fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
    }).then(res => {

        if (res.status === 204){
            btnDeleteEl.innerHTML = "Delete";
            document.querySelector("#delete-user-modal-close").click();
            userRowEl.classList.add("list-fade");
            userRowEl.style.opacity = '0';
            $.notify("User deleted.", "success");

        }else if(res.status === 401){
            window.location.href = "/login";
        }else{
            return res.json();
        }

    }).then(jsonData => {
        if(jsonData){
            btnDeleteEl.innerHTML = "Delete";
            console.log("jsonData.msg")
            document.querySelector("#delete-user-error-notify").innerHTML = jsonData.message;
        }
    }).catch((error) => {
        console.log(error.message)
        document.querySelector("#delete-user-error-notify").innerHTML = error.message;
        btnDeleteEl.innerHTML = "Delete";
    })

}