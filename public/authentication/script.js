console.log("hello")
function goBack() {
    history.back();
}
async function requestOTP() {
    let requestOtp = document.querySelectorAll('.requestOtp');
    const email = document.getElementById('phoneNo').value;
    if (!email) {
        alert('EmailId is required');
        return;
    }
    else{
        
        requestOtp[0].style.background="#2b425780"
        requestOtp[0].style.color="#00000066"
    }
    try {
        const response = await fetch('/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (response.ok) {
            // alert('OTP sent successfully to ',email);
        } else {
            alert(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error requesting OTP:', error);
    }
}

async function verifyOTP() {
    const email = document.getElementById('phoneNo').value;
    const otp = document.getElementById('otp').value;

    if (!email || !otp) {
        alert('Phone number and OTP are required');
        return;
    }

    try {
        const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await response.json();
        console.log(data)
        if(data=="Invalid OTP"){
            alert("Invalid OTP")
        }
        if (data.isNewUser) {
            document.getElementById('newUserFields').style.display = 'flex';
        } else {
            window.isLoggedIn = true;
            window.cId = data.cId
            console.log("CID:", data.cId)
            sessionStorage.setItem('cId', data.cId)
            sessionStorage.setItem('isLoggedIn', 'true');
            document.getElementById('newUserFields').style.display = 'none';
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
            

        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
    }
}

async function saveNewUser() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const bloodType = document.getElementById('bloodType').value;
    const email = document.getElementById('email').value; // Corrected this line

    if (!name || !age || !gender || !phone || !state || !city || !bloodType || !email) {
        alert('All fields are required');
        return;
    }

    try {
        const response = await fetch('/save-new-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age, gender, phone, state, city, bloodType, email })
        });

        const result = await response.json();
        if (response.ok) {
            // Clear the form fields or redirect to another page if needed
            document.getElementById('newUserFields').style.display = 'none';
            window.isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            if (result.redirectTo) {
                window.location.href = result.redirectTo;
            }
        } else {
            alert('Error saving new user: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving new user:', error);
    }
}


