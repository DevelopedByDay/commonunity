async function logout() {
    const response = await fetch('./home-routes', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
        document.location.replace('/');
    } else {
        alert(resplonse.statusText);
    }
}

document.querySelector('#logout').addEventListener('click', logout);