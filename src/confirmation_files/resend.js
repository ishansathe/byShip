
function resendEmail() {
    let cookies = document.cookie.split(';');
    for (let i in cookies){
        if(cookies[i].slice(0,5) == "email"){
            let email = cookies[i].slice(6, cookies[i].length)
        }
    }

    fetch('localhost:5419/resend-email')
}