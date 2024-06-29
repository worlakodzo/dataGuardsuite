'use strict'
import { base_url } from './variables.js';
import { parseJwt } from './jwt.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('error-message').style.display = 'none';
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email !== "" && password !== ""){
            login({"email": email, "password": password});
        }
        
    });


});

const login = async (body) =>  {
    const url = `${base_url}/users/login`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.status !== 200) {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message-text').innerHTML = data.msg;
        return;
    }

    // Save the token in the session storage
    const tokenDecodedJson = parseJwt(data.access_token);
    sessionStorage.setItem('token', data.access_token);
    sessionStorage.setItem('userData', tokenDecodedJson.sub);

    // Redirect to the dashboard
    window.location.href = '/dashboard';
}

export { login };

