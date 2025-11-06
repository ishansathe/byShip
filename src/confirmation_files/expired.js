


function showExpired(){
    let url_params = new URLSearchParams(window.location.search)
    const indicator = url_params.get('expired')

    if(indicator == 'true') {

        let p_tag = document.getElementById('expiry_message');
        p_tag.textContent= "Previous link expired."    
    }
}



document.onload(showExpired);