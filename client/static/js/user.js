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
                        <a type="button" class="btn btn-primary" href="/user-profile/${user._id}"><i class="bi bi-eye-fill"></i></a>
                        <a type="button" data-id="${user._id}" data-username="${user.email}"  data-username="${user.username}" data-bs-toggle="modal" data-bs-target="#delete-user-modal" class="btn btn-danger delete-user"><i class="bx bxs-trash-alt"></i></a>
                    </div>
                </td>

            </tr>
    `
}

const saveUserData = (event) => {
    event.preventDefault();
    console.log("Calling saveUserData")

    const formEl = document.querySelector("#user-data-form");
    const actionType = formEl.getAttribute("data-action-type");
    const url = formEl.getAttribute("data-url");
    const btnCreateUserEl = document.getElementById("btn-create-user");
    document.querySelector("#save-error-content-container").style.display = "none";
    document.querySelector("#save-success-content-container").style.display = "none";

    let isValid = false;
    let data = {}

    if (actionType === "POST"){
        isValid = validateUserSaveData();
        const fullName = document.querySelector("#full-name").value;
        const password = document.querySelector("#password").value;
        const username = document.querySelector("#username").value;
        const phone = document.querySelector("#phone").value;
        const email = document.querySelector("#email").value;
        
        data = {
            username: username,
            full_name: fullName,
            password: password,
            phone: phone,
            email: email
        }
    
    }else {
        isValid = validateUserSaveData();
        
    }

    if (isValid){

        btnCreateUserEl.innerHTML = savingData;
        // Send to server
        fetch("/users", {

            method: actionType,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)

        }).then(res => {

                return res.json();

        }).then(jsonData => {

            if(jsonData.success){
                // on success redirect user to user-list 
                // page
                $.notify("User Saved.", "success");
                window.location.href = "/user-list";
            }else{
                document.querySelector("#save-error-content").innerHTML = jsonData.message;
                document.querySelector("#save-error-content-container").style.display = "block";
            }

            btnCreateUserEl.innerHTML = "Create User";

        }).catch(error => {
            
            document.querySelector("#save-error-content").innerHTML = jsonData.message;
            document.querySelector("#save-error-content-container").style.display = "block";
            btnCreateUserEl.innerHTML = "Create User";
            console.error(error);
        })


    }


}


const validateUserSaveData = () => {
    let isValid = true;
    const username = document.querySelector("#username").value;
    const fullName = document.querySelector("#full-name").value;
    const password = document.querySelector("#password").value;
    const phone = document.querySelector("#phone").value;
    const email = document.querySelector("#email").value;
    

    if(username === ""){
        document.querySelector("#username-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#username-error").style.display = "none";
    }

    if(fullName === ""){
        document.querySelector("#full-name-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#full-name-error").style.display = "none";
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
    const fullName = document.querySelector("#full-name").value;
    const phone = document.querySelector("#phone").value;
    const email = document.querySelector("#email").value;

    if(fullName === ""){
        document.querySelector("#full-name-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#full-name-error").style.display = "none";
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

    return isValid;

}



const getUserProfile =  () => {

    const userProfileContainerEl = document.querySelector("#user-profile-container");
    const id = document.querySelector("#edit-profile-form").getAttribute("data-id")

    fetch(`/users/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then(res => {
        if (res.status === 200){
            return res.json();
        }else{

        }
    }).then(dataJson => {
        const content = displayUserProfile(dataJson.data);
        const overView = displayUserOverView(dataJson.data);
        const profileCard = displayUserProfileCard(dataJson.data)
        document.querySelector("#edit-profile-form").innerHTML = content;
        document.querySelector("#profile-overview").innerHTML = overView;
        document.querySelector("#profile-card").innerHTML = profileCard;
        displayUserSettings(dataJson.data);
    })

}



const displayUserSettings = (data) => {
    // https://stackoverflow.com/questions/8206565/check-uncheck-checkbox-with-javascript
    document.getElementById("changes-made-to-account").checked = data.email_notification.changes_made_to_account;
    document.getElementById("new-assert-added").checked = data.email_notification.new_assert_added;
    document.getElementById("assert-expiring").checked = data.email_notification.assert_expiring;
    document.getElementById("security-notify").checked = data.email_notification.security_notify;
}


const displayUserProfileCard = (data) => {

    return `

        <img src="${data.photo_link}" alt="Profile" class="rounded-circle">
        <h2>${data.full_name}</h2>
        <h3>${data.job_title}</h3>
        <div class="social-links mt-2">
        <a href="${data.social_link.twitter}" class="twitter"><i class="bi bi-twitter"></i></a>
        <a href="${data.social_link.facebook}" class="facebook"><i class="bi bi-facebook"></i></a>
        <a href="${data.social_link.linkedin}" class="linkedin"><i class="bi bi-linkedin"></i></a>
        </div>  
    `
}



const displayUserOverView = (data) => {

    return `

        <h5 class="card-title">About</h5>
        <p class="small fst-italic">${data.about}.</p>

        <h5 class="card-title">Profile Details</h5>

        <div class="row">
        <div class="col-lg-3 col-md-4 label ">Username</div>
        <div class="col-lg-9 col-md-8">${data.username}</div>
        </div>

        <div class="row">
        <div class="col-lg-3 col-md-4 label ">Full Name</div>
        <div class="col-lg-9 col-md-8">${data.full_name}</div>
        </div>


        <div class="row">
        <div class="col-lg-3 col-md-4 label">Job</div>
        <div class="col-lg-9 col-md-8">${data.job_title}</div>
        </div>


        <div class="row">
        <div class="col-lg-3 col-md-4 label">Address</div>
        <div class="col-lg-9 col-md-8">${data.address}</div>
        </div>

        <div class="row">
        <div class="col-lg-3 col-md-4 label">Phone</div>
        <div class="col-lg-9 col-md-8">${data.phone}</div>
        </div>

        <div class="row">
        <div class="col-lg-3 col-md-4 label">Email</div>
        <div class="col-lg-9 col-md-8">${data.email}</div>
        </div>

    
    `



}


const displayUserProfile = (data) => {

    return `

        <div class="row mb-3">
            <label for="profileImage"  class="col-md-4 col-lg-3 col-form-label">Profile Image</label>
            <div class="col-md-8 col-lg-9">
            <img src="${data.photo_link}" alt="Profile">
            <div class="pt-2">
                <a href="#" class="btn btn-primary btn-sm" title="Upload new profile image"><i class="bi bi-upload"></i></a>
                <a href="#" class="btn btn-danger btn-sm" title="Remove my profile image"><i class="bi bi-trash"></i></a>
            </div>
            </div>
        </div>

        <div class="row mb-3">
            <label for="full-name" class="col-md-4 col-lg-3 col-form-label">Full Name <span style="color: red;">*</span></label>
            <div class="col-md-8 col-lg-9">
            <input name="full_name" type="text" class="form-control" id="full-name" value="${data.full_name}">
            </div>
            <p id="full-name-error" style="color: red; display: none;">Full name field required</p>
        </div>

        <div class="row mb-3">
            <label for="about" class="col-md-4 col-lg-3 col-form-label">About</label>
            <div class="col-md-8 col-lg-9">
            <textarea name="about" class="form-control" id="about" style="height: 100px">${data.about}</textarea>
            </div>
        </div>


        <div class="row mb-3">
            <label for="job-title" class="col-md-4 col-lg-3 col-form-label">Job</label>
            <div class="col-md-8 col-lg-9">
            <input name="job_title" type="text" class="form-control" id="job-title" value="${data.job_title}">
            </div>
        </div>


        <div class="row mb-3">
            <label for="address" class="col-md-4 col-lg-3 col-form-label">Address</label>
            <div class="col-md-8 col-lg-9">
            <input name="address" type="text" class="form-control" id="address" value="${data.address}">
            </div>
        </div>

        <div class="row mb-3">
            <label for="phone" class="col-md-4 col-lg-3 col-form-label">Phone <span style="color: red;">*</span></label>
            <div class="col-md-8 col-lg-9">
            <input name="phone" type="text" class="form-control" id="phone" value="${data.phone}">
            </div>
            <p id="phone-error" style="color: red; display: none;">Phone field required</p>
        </div>

        <div class="row mb-3">
            <label for="Email" class="col-md-4 col-lg-3 col-form-label">Email <span style="color: red;">*</span></label>
            <div class="col-md-8 col-lg-9">
            <input name="email" type="email" class="form-control" id="email" value="${data.email}">
            </div>
            <p id="email-error" style="color: red; display: none;">Email field required</p>
        </div>

        <div class="row mb-3">
            <label for="twitter-link" class="col-md-4 col-lg-3 col-form-label">Twitter link</label>
            <div class="col-md-8 col-lg-9">
            <input name="twitter" type="text" class="form-control" id="twitter-link" value="${data.social_link.twitter}">
            </div>
        </div>

        <div class="row mb-3">
            <label for="facebook-link" class="col-md-4 col-lg-3 col-form-label">Facebook link</label>
            <div class="col-md-8 col-lg-9">
            <input name="facebook" type="text" class="form-control" id="facebook-link" value="${data.social_link.facebook}">
            </div>
        </div>

        <div class="row mb-3">
            <label for="linkedin-link" class="col-md-4 col-lg-3 col-form-label">Linkedin link</label>
            <div class="col-md-8 col-lg-9">
            <input name="linkedin" type="text" class="form-control" id="linkedin-link" value="${data.social_link.linkedin}">
            </div>
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
    // document.querySelector("#save-error-content-container").style.display = "none";
    // document.querySelector("#save-success-content-container").style.display = "none";

    let isValid = false;
    let data = {}


    isValid = validateUserUpdateData();
    console.log(isValid)
    
    const fullName = document.querySelector("#full-name").value;
    const phone = document.querySelector("#phone").value;
    const email = document.querySelector("#email").value;
    const about = document.querySelector("#about").value;
    const job_title = document.querySelector("#job-title").value;
    const address = document.querySelector("#address").value;
    const twitterLink = document.querySelector("#twitter-link").value;
    const facebookLink = document.querySelector("#facebook-link").value;
    const linkedinLink = document.querySelector("#linkedin-link").value;
    
    data = {
        action_type: "update-user-data",
        full_name: fullName,
        phone: phone,
        email: email,
        about: about,
        job_title: job_title,
        address: address,
        twitter_link: twitterLink,
        facebook_link: facebookLink,
        linkedin_link: linkedinLink,
    }
    
    

    if (isValid){

        btnSaveChanagesEl.innerHTML = savingData;
        // Send to server
        fetch(`/users/${id}`, {

            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)

        }).then(res => {

                return res.json();

        }).then(jsonData => {

            if(jsonData.success){
                //document.querySelector("#save-success-content-container").style.display = "block";
                $.notify("Profile Detail Saved.", "success");
                const content = displayUserProfile(dataJson.data);
                const overView = displayUserOverView(dataJson.data);
                const profileCard = displayUserProfileCard(dataJson.data)
                document.querySelector("#edit-profile-form").innerHTML = content;
                document.querySelector("#profile-overview").innerHTML = overView;
                document.querySelector("#profile-card").innerHTML = profileCard;
                displayUserSettings(dataJson.data);
                
            }else{
                //document.querySelector("#save-error-content").innerHTML = jsonData.message;
                //document.querySelector("#save-error-content-container").style.display = "block";
            }

            btnSaveChanagesEl.innerHTML = "Save Changes";

        }).catch(error => {
            
            //document.querySelector("#save-error-content").innerHTML = jsonData.message;
            //document.querySelector("#save-error-content-container").style.display = "block";
            btnSaveChanagesEl.innerHTML = "Save Changes";
            //console.error(error);
        })


    }


}

const changePassword = (event) => {
    
    event.preventDefault();

    const formEl = document.querySelector("#edit-profile-form");
    const id = formEl.getAttribute("data-id");
    const btnSaveChanagesEl = document.getElementById("btn-change-password");
    // document.querySelector("#save-error-content-container").style.display = "none";
    // document.querySelector("#save-success-content-container").style.display = "none";

    let isValid = true;
    let data = {}


    isValid = validateUserUpdateData();
    console.log(isValid)
    
    const newPassword = document.querySelector("#new-password").value;
    const renewPassword = document.querySelector("#renew-password").value;
    
    if(newPassword === ""){
        document.querySelector("#new-password-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#new-password-error").style.display = "none";
    }

    if(renewPassword === ""){
        document.querySelector("#renew-password-error").style.display = "block";
        isValid = false;
    }else{
        document.querySelector("#renew-password-error").style.display = "none";
    }

    if (newPassword !== renewPassword){
        document.querySelector("#password-not-match-error").style.display = "block";
        isValid = false;  
    }else{
        document.querySelector("#password-not-match-error").style.display = "none"; 
    }
    
    

    if (isValid){

        btnSaveChanagesEl.innerHTML = savingData;
        // Send to server
        fetch(`/users/${id}`, {

            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({password: newPassword})

        }).then(res => {
            if (res.status === 200){
                btnSaveChanagesEl.innerHTML = "Save Changes";
                $.notify("Password Saved.", "success");
                document.querySelector("#new-password").value = "";
                document.querySelector("#renew-password").value = "";
                // window.location.reload();
            }else{
                return res.json();
            }
        }).then(jsonData => {

            btnSaveChanagesEl.innerHTML = "Save Changes";

        }).catch(error => {
            
            //document.querySelector("#save-error-content").innerHTML = jsonData.message;
            //document.querySelector("#save-error-content-container").style.display = "block";
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
    // Send to server
    fetch(`/users/${id}`, {

        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action_type: "update-user-setting",
            changes_made_to_account: document.getElementById("changes-made-to-account").checked,
            new_assert_added: document.getElementById("new-assert-added").checked,
            assert_expiring: document.getElementById("assert-expiring").checked,
            security_notify: document.getElementById("security-notify").checked
        })

    }).then(res => {
        if (res.status === 200){
            btnSaveChanagesEl.innerHTML = "Save Changes";
            $.notify("Setting Saved.", "success");
        }else{
            return res.json();
        }
    }).then(jsonData => {

        btnSaveChanagesEl.innerHTML = "Save Changes";

    }).catch(error => {
        
        //document.querySelector("#save-error-content").innerHTML = jsonData.message;
        //document.querySelector("#save-error-content-container").style.display = "block";
        btnSaveChanagesEl.innerHTML = "Save Changes";
        //console.error(error);
    })


}

const addDeleteUserListener = () => {
    const deleteBtnEls = document.querySelectorAll(".delete-user");
    // loop over all delete button
    // and event listener to it
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

    // Send to server
    fetch(`/users/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    }).then(res => {

        if (res.status === 204){
            btnDeleteEl.innerHTML = "Delete";
            document.querySelector("#delete-user-modal-close").click();

            // BEGIN remove user row
            userRowEl.classList.add("list-fade");
            userRowEl.style.opacity = '0';
            setTimeout(() => userRowEl.remove(), 1000);
            // EMD remove credential card

            $.notify("User deleted.", "success");

        }else{
            return res.json();
        }

    }).then(jsonData => {

        if(jsonData){

            btnDeleteEl.innerHTML = "Delete";
            console.log("jsonData.message")
            document.querySelector("#delete-user-error-notify").innerHTML = jsonData.message;
        }


    }).catch((error) => {

        console.log(error.message)
        document.querySelector("#delete-user-error-notify").innerHTML = error.message;
        btnDeleteEl.innerHTML = "Delete";
    })


}







