/**@type {HTMLFormElement}*/
console.log('login.js 로드됨');

const $loginForm = document.forms['loginForm'];
console.log('form:', $loginForm); // null이면 name 못 찾는 것

$loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('submit 실행됨');

    //정규화

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('id', $loginForm['id'].value);
    formData.append('password', $loginForm['password'].value);
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }

        console.log('status:', xhr.status);        // ← 추가
        console.log('response:', xhr.responseText); // ← 추가

        if(xhr.status < 200 || xhr.status >= 400){
            return;
        }
        const response = JSON.parse(xhr.responseText);
        //result
        if (response.success) {
            window.location.href = '/main';
        } else {
            alert(response.message);
        }
    };
    xhr.open('POST', '/user/login');
    xhr.send(formData);
});

$loginForm['register'].addEventListener('click', () => {
    location.href = '/user/register';
});