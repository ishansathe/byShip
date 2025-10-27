



window.addEventListener("load", () => {

    let userType = document.getElementById('user_type');

    console.log(window.location.search)

    let query_string = window.location.search;

    const url_params = new URLSearchParams(query_string);

    let user_type = url_params.get('role');
    userType.value = user_type;
})