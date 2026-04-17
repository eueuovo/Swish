/**@type {HTMLFormElement}*/
const $registerForm = document.forms['registerForm'];

/**@type {HTMLElement[]}*/
const $steps = Array.from($registerForm.querySelectorAll(':scope > .step > .item'));
/**@type {HTMLElement[]}*/
const $contents = Array.from($registerForm.querySelectorAll(':scope > .content'));
const loading = new Loading();

//map으로 따로 구성
//오브젝트 설명 / 값의 형태는 정해져있지만 키 이름 안정해져있어서 p로! / 아무 이름아나 주되 값은 숫자여야 함
//배열로 들고와서 반복으로 돌릴수도 있음 (아래 set step에서 진행 중)
/**@type {{[p: string]: boolean[]}}*/
const buttonVisibilityMap = {
    //html name과 일치해야 함
    cancel: [true, true, true, false],
    previous: [false, true, true, false],
    next: [true, true, true, false],
    complete: [false, false, false, true]
}

/**@param {number} step*/
const setStep = (step) => {
    //forEach = 다 돌려서 엑티브 없애고 숨기겠다.
    $steps.forEach(($steps) => $steps.classList.remove('active'));
    $contents.forEach(($contents) => $contents.hide());
    //at = step 중에서!
    $steps.at(step - 1)?.classList.add('active');
    $contents.at(step - 1)?.show();
    //$registerForm['cancel'] ~ ['complete'] 가지고 오는 중..
    Object.keys(buttonVisibilityMap).forEach((buttonName) => {
        /**@type {HTMLButtonElement}*/
        const $button= $registerForm[buttonName];
        //$registerForm['cancel']
        const $visibilityArray = buttonVisibilityMap[buttonName];
        //buttonVisibilityMap['cancel'] >>> [true, true, true, false]
        $button.setVisible($visibilityArray.at(step -1));
    });
}

const handleTerm = () => {
    /**@type {HTMLTextAreaElement}*/
    const $termPolicy = $registerForm['termPolicy'];
    /**@type {HTMLInputElement}*/
    const $termPolicyCheck = $registerForm['termPolicyCheck'];

    /**@type {HTMLTextAreaElement}*/
    const $termPrivacy = $registerForm['termPrivacy'];
    /**@type {HTMLInputElement}*/
    const $termPrivacyCheck = $registerForm['termPrivacyCheck'];

    if (!$termPolicyCheck.checked){
        dialog.showSimpleOk('경고', '서비스 이용약관에 동의하지 않을 경우 회원가입을 계속할 수 없습니다.');
        $termPolicy.focus();
        return;
    }
    if (!$termPrivacyCheck.checked){
        dialog.showSimpleOk('경고', '개인 정보 처리 방침에 동의하지 않을 경우 회원가입을 계속할 수 없습니다.');
        $termPrivacy.focus();
        return;
    }
    //term에 엑티브 빼고 베리피케이션한테 주는거
    //term에 비지블 빼고 베리피케이션한테 주는거
    //스텝을 1에서 2로 바꾸는 것
    //여기서 위 3개를 해야 함
    setStep(++step);
}

const handleVerification = () => {
    /**@type {HTMLButtonElement}*/
    const $emailCodeSendButton = $registerForm['emailCodeSendButton'];
    /**@type {HTMLButtonElement}*/
    const $emailCodeVerifyButton = $registerForm['emailCodeVerifyButton'];

    if (!$emailCodeVerifyButton.disabled || !$emailCodeSendButton.disabled){
        dialog.showSimpleOk('경고', '이메일 인증을 완료해 주세요.');
        return;
    }
    setStep(++step);
}

const handleInformation = () => {
    /**@type {CustomLabelObject}*/
    const passwordLabel = labelObjectMap['registerPassword'];
    /**@type {HTMLInputElement}*/
    const $passwordInput = $registerForm['password'];
    /**@type {HTMLInputElement}*/
    const $passwordCheckInput = $registerForm['passwordCheck'];
    passwordLabel.hideWarning();
    if ($passwordInput.value === ''){
        passwordLabel.showWarning('비밀번호를 입력해 주세요.');
        $passwordInput.focus();
        return;
    }
    if (!/^[\da-zA-Z`~!@#$%^&*()\-_=+\[{\]}\\|;:'",<.>\/?]{6,50}$/g.test($passwordInput.value)){
        passwordLabel.showWarning('올바른 비밀번호를 입력해 주세요.');
        $passwordInput.focus();
        $passwordInput.select();
        return;
    }
    if ($passwordCheckInput.value === ''){
        passwordLabel.showWarning('비밀번호를 한 번 더 입력해 주세요.');
        $passwordCheckInput.focus();
        return;
    }
    if ($passwordCheckInput.value !== $passwordInput.value){
        passwordLabel.showWarning('입력한 비밀번호가 서로 일치하지 않습니다.');
        $passwordCheckInput.focus();
        return;
    }
    /**@type {CustomLabelObject}*/
    const nicknameLabel = labelObjectMap['registerNicknameLabel'];
    /**@type {HTMLInputElement}*/
    const $nicknameInput = $registerForm['nickname'];
    /**@type {HTMLButtonElement}*/
    const $nicknameCheckButton = $registerForm['nicknameCheckButton'];
    nicknameLabel.hideWarning();
    if (!$nicknameInput.disabled || !$nicknameCheckButton.disabled){
        nicknameLabel.showWarning('닉네임 중복 검사를 완료해 주세요.');
        $nicknameInput.focus();
        return;
    }
    /**@type {CustomLabelObject}*/
    const contactLabel = labelObjectMap['registerContactLabel'];
    /**@type {HTMLSelectElement}*/
    const $contactMvno = $registerForm['contactMvno'];
    /**@type {HTMLSelectElement}*/
    const $contactFirst = $registerForm['contactFirst'];
    /**@type {HTMLInputElement}*/
    const $contactSecond = $registerForm['contactSecond'];
    /**@type {HTMLInputElement}*/
    const $contactThird = $registerForm['contactThird'];
    if ($contactMvno.value === '-1'){
        contactLabel.showWarning('통신사를 선택해 주세요.');
        $contactMvno.focus();
        return;
    }
    if ($contactSecond.value === ''){
        contactLabel.showWarning('연락처를 입력해 주세요.');
        $contactSecond.focus();
        return;
    }
    if (!/^\d{3,4}$/g.test($contactSecond.value)){
        contactLabel.showWarning('올바른 연락처를 입력해 주세요.');
        $contactSecond.focus();
        $contactSecond.select();
        return;
    }
    if ($contactThird.value === ''){
        contactLabel.showWarning('연락처를 입력해 주세요.');
        $contactThird.focus();
        return;
    }
    if (!/^\d{4}$/g.test($contactThird.value)){
        contactLabel.showWarning('올바른 연락처를 입력해 주세요.');
        $contactThird.focus();
        $contactThird.select();
        return;
    }

    /**@type {HTMLInputElement}*/
    const $emailInput = $registerForm['email'];
    /**@type {HTMLInputElement}*/
    const $emailCodeInput = $registerForm['emailCode'];
    /**@type {HTMLInputElement}*/
    const $emailSaltInput = $registerForm['emailSalt'];
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('termMarketingAgreed', $registerForm['termMarketingCheck'].checked);
    formData.append('email', $emailInput.value);
    formData.append('loginId', $registerForm['loginId'].value);
    formData.append('code', $emailCodeInput.value);
    formData.append('salt', $emailSaltInput.value);
    formData.append('password', $passwordInput.value);
    formData.append('nickname', $nicknameInput.value);
    formData.append('contactMvnoCode', $contactMvno.value);
    formData.append('contact', `${$contactFirst.value}-${$contactSecond.value}-${$contactThird.value}`);
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){
            dialog.showSimpleOk('오류',`요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${xhr.status})`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result){
            case 'FAILURE':
                dialog.showSimpleOk('경고', '알 수 없는 이유로 회원가입에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                break;
            case 'FAILURE_EMAIL_DUPLICATE':
                dialog.showSimpleOk('경고', `입력하신 이메일(${$emailInput.value})은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.`, {
                    buttonOnclick: () => {
                        $emailInput.disabled = false;
                        $registerForm['emailCodeSendButton'].disabled = false;
                        $emailCodeInput.disabled = true;
                        $emailCodeInput.value = '';
                        $registerForm['emailCodeVerifyButton'].disabled = true;
                        $emailSaltInput.value = '';
                        setStep(2);
                    }
                });
                break;
            case 'FAILURE_NICKNAME_DUPLICATE':
                dialog.showSimpleOk('경고', `입력하신 닉네임(${$nicknameInput.value})은 이미 사용 중입니다.`, {
                    buttonOnclick: () => {
                        $nicknameInput.disabled = false;
                        $nicknameCheckButton.disabled = false;
                        $nicknameInput.focus();
                        $nicknameInput.select();
                    }
                });
                break;
            case 'SUCCESS':
                setStep(++step);
                break;
            default:
                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/user/');
    xhr.send(formData);
}

const handleComplete = () => {
    location.href = '/user/login';
}

let step = 1;

$registerForm['emailCodeSendButton'].addEventListener('click', () => {

    /**@type {CustomLabelObject}*/
    const emailLabel = labelObjectMap['registerEmailLabel'];

    /**@type {HTMLInputElement}*/
    const $emailInput = $registerForm['email'];

    /**@type {HTMLButtonElement}*/
    const $emailCodeSendButton = $registerForm['emailCodeSendButton'];
    emailLabel.hideWarning();

    if ($emailInput.value === ''){
        emailLabel.showWarning('이메일을 입력해 주세요.');
        $emailInput.focus();
        return;
    }
    //만족하는가? 에서 !정규식 -> 이 정규식을 만족하지 않는다면!
    if (!/^(?=.{8,50}$)([\da-zA-Z_.]{4,25})@([\da-z\-]+\.)?([\da-z\-]{2,})\.([a-z]{2,15}\.)?([a-z]{2,3})$/g.test($emailInput.value)){
        emailLabel.showWarning('올바른 이메일을 입력해 주세요.');
        $emailInput.focus();
        $emailInput.select();
        return;
    }
    //TODO : XHR
    const xhr = new XMLHttpRequest();
    const formDate = new FormData();
    formDate.append('email', $emailInput.value)
    formDate.append('type', '0');
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 400) {
            dialog.showSimpleOk('오류', `요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요(${xhr.status})`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'FAILURE':
                dialog.showSimpleOk('경고', '알 수 없는 이유로 이메일을 전송하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                break;
            case 'FAILURE_EMAIL_DUPLICATE':
                dialog.showSimpleOk('경고', `입력하신 이메일(${$emailInput.value})은 이미 사용 중입니다.`, {
                    buttonOnclick: () => {
                        $emailInput.focus();
                        $emailInput.select();
                    }
                });
                break;
            case 'SUCCESS':
                const $emailCodeInput = $registerForm['emailCode'];
                const $emailCodeVerifyButton = $registerForm['emailCodeVerifyButton'];
                const $emailCodeSendButton = $registerForm['emailCodeSendButton'];
                $registerForm['emailSalt'].value = response['salt'];
                $emailInput.disabled = true;
                $emailCodeSendButton.disabled = true;
                $emailCodeInput.disabled = false;
                $emailCodeVerifyButton.disabled = false;
                dialog.showSimpleOk('알림', `입력하신 이메일(${$emailInput.value})로 인증번호를 전송하였습니다.`,{
                    buttonOnclick: () => {
                        $emailInput.focus();
                        $emailInput.select();
                    }
                });
                break;
            default:
                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/user/email');
    xhr.send(formDate);
    loading.show();
});

$registerForm['emailCodeVerifyButton'].addEventListener('click', () => {
    /**@type {CustomLabelObject}*/
    const labelObject = labelObjectMap['registerEmailCodeLabel'];
    /**@type {HTMLInputElement}*/
    const $emailCodeInput = $registerForm['emailCode'];
    /**@type {HTMLButtonElement}*/
    const $emailCodeVerifyButton = $registerForm['emailCodeVerifyButton'];
    labelObject.hideWarning();
    if ($emailCodeInput.value === '') {
        labelObject.showWarning('이메일 인증번호를 입력해 주세요.');
        $emailCodeInput.focus();
        return;
    }
    if (!/^(\d{6})$/g.test($emailCodeInput.value)) {
        labelObject.showWarning('올바른 이메일 인증번호를 입력해 주세요.');
        $emailCodeInput.focus();
        $emailCodeInput.select();
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $registerForm['email'].value);
    formData.append('code', $emailCodeInput.value);
    formData.append('salt', $registerForm['emailSalt'].value);
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){
            dialog.showSimpleOk('오류', `요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${xhr.status})`)
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result){
            case 'FAILURE':
                dialog.showSimpleOk('경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.', {
                    buttonOnclick: () => {
                        $emailCodeInput.focus();
                        $emailCodeInput.select();
                    }
                });
                break;
            case 'FAILURE_EXPIRED':
                dialog.showSimpleOk('경고', '인증 세션이 만료되었습니다. 인증 절차를 다시 시작해 주세요.', {
                    buttonOnclick: () => {
                        $registerForm['email'].disabled = false;
                        $registerForm['email'].focus();
                        $registerForm['emailCodeSendButton'].disabled = false;
                        $registerForm['emailSalt'].value = '';
                        $registerForm['emailCode'].disabled = true;
                        $registerForm['emailCode'].value = '';
                        $registerForm['emailCodeVerifyButton'].disabled = true;
                    }
                });
                break;
            case 'SUCCESS':
                $emailCodeInput.disabled = true;
                $emailCodeVerifyButton.disabled = true;
                $registerForm['emailRO'].value = $registerForm['email'].value;
                dialog.showSimpleOk('알림', '이메일 인증이 완료되었습니다. 다음 버튼을 클릭하여 회원 정보를 입력해 주세요.');
                break;
            default:
                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('PATCH', '/user/email');
    xhr.send(formData);
});

$registerForm['nicknameCheckButton'].addEventListener('click', () => {
    /**@type {CustomLabelObject}*/
    const nicknameLabel = labelObjectMap['registerNicknameLabel'];

    /**@type {HTMLInputElement}*/
    const $nicknameInput = $registerForm['nickname'];
    /**@type {HTMLButtonElement}*/
    const $nicknameCheckButtons = $registerForm['nicknameCheckButton'];
    nicknameLabel.hideWarning();
    if ($nicknameInput.value === ''){
        nicknameLabel.showWarning('닉네임을 입력해 주세요.');
        $nicknameInput.focus();
        return;
    }
    if (!/^[\da-zA-Z가-힣]{1,10}$/g.test($nicknameInput.value)){
        nicknameLabel.showWarning('올바른 닉네임을 입력해 주세요. 숫자, 영어, 대/소문자, 완성 한글 1~10자로 이루어져야 합니다.');
        $nicknameInput.focus();
        $nicknameInput.select();
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){
            dialog.showSimpleOk('오류', `요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${xhr.status})`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result){
            case 'FAILURE' :
                dialog.showSimpleOk('경고', `입력하신 닉네임(${$nicknameInput.value})은 이미 사용 중입니다.`);
                break;
            case 'SUCCESS' :
                dialog.showSimpleYesNo('알림', `입력하신 닉네임(${$nicknameInput.value})은 사용 가능합니다. 해당 닉네임을 사용할까요?`, {
                    yesButtonOnclick: () => {
                        $nicknameInput.disabled = true;
                        $nicknameCheckButtons.disabled = true;
                    }
                });
                break;
            default:
                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
        }

/*
        switch (response.result){
            case 'FAILURE':
                dialog.showSimpleOk('경고', `입력하신 닉네임(${$nicknameInput.value})은/는 이미 사용 중입니다.`);
                break;
            case 'SUCCESS':
                dialog.showSimpleOk('경고', `입력하신 닉네임(${$nicknameInput.value})은/는 사용할 수 있습니다.`);
                break;
            default:
                dialog.showSimpleOk('경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
        }
        위 방법은 아래와 같은것임! 성능은 위가 더 좋다하셨나..? 크흠~*/
/*
        const[title, content] = {
            FAILURE: ['경고', `입력하신 닉네임(${$nicknameInput.value})은/는 이미 사용 중입니다.`],
            SUCCESS: ['알림', `입력하신 닉네임(${$nicknameInput.value})은/는 사용할 수 있습니다.`]
        } [response.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        dialog.showSimpleOk(title, content);
*/
    };
    //window.origin이라 써도 됨
    //get은 formData 못씀. 그래서 아래와 같은 방법 사용
    const url = new URL(origin);
    url.pathname = '/user/nickname-status';
    url.searchParams.set('nickname', $nicknameInput.value);
    xhr.open('GET', url);
    xhr.send();
});

$registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    switch (step){
        case 1:
            handleTerm();
            break;
        case 2:
            handleVerification();
            break;
        case 3:
            handleInformation();
            break;
        case 4:
            handleComplete();
            break;
    }

    //위 아래 둘 중 하나만 쓰면 됨!!!!!
    //아래는 스위치문 한줄로 축약 / 객체를 실행하고 null이면 오류
/*    ({
        //함수 지칭 (호출 x)
        1: handleTerm(),
        2: handleVerification(),
        3: handleInformation(),
        4: handleComplete()
    }[step] ?? null)?.();*/
    //step : 1 집어넣으면 1의 함수 지칭으로 바뀌게 됨 / handleTerm ?? null 로 바뀌게 되고, 있는 함수이니 handleTerm?.()이 됨 / null이 아니기에 handleTerm()과 (호출)같음


});











