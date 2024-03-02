const loginForm = document.getElementById('loginForm');

// key의 value가 문자열일 때
if (typeof localStorage.getItem('loginEmail') === 'string') {
    loginForm['email'].value = localStorage.getItem('loginEmail');
    loginForm['password'].focus();
    loginForm['remember'].checked = true;
}

loginForm.onsubmit = function(e) {
    e.preventDefault();

    if (loginForm['email'].value === '') {
        dialog.show({
            title: '이메일',
            content: '이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    loginForm['email'].focus();
                    loginForm['email'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }
    if (!new RegExp(loginForm['email'].dataset.regex).test(loginForm['email'].value)) {
        dialog.show({
            title: '이메일',
            content: '올바른 이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    loginForm['email'].focus();
                    loginForm['email'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    if (loginForm['password'].value === '') {
        dialog.show({
            title: '비밀번호',
            content: '비밀번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    loginForm['password'].focus();
                    loginForm['password'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    if (!new RegExp(loginForm['password'].dataset.regex).test(loginForm['password'].value)) {
        dialog.show({
            title: '비밀번호',
            content: '올바른 비밀번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    loginForm['password'].focus();
                    loginForm['password'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', loginForm['email'].value);
    formData.append('password', loginForm['password'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.show({
                title: '오류',
                content: '요청을 전송하는 도중 예상치 못한 오류가 발생하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                buttons: [dialog.createButton('확인', dialog.hide)]
            });
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        switch (responseObject['result']) {
            case 'failure':
                dialog.show({
                    title: '오류',
                    content: '이메일 혹은 비밀번호가 올바르지 않습니다.',
                    buttons: [
                        dialog.createButton('확인', function() {
                            dialog.hide();
                            loginForm['email'].focus();
                            loginForm['email'].select();
                        })
                    ]
                });
                break;
            case 'failure_suspended':
                dialog.show({
                    title: '오류',
                    content: '해당 계정은 이용이 정지된 계정입니다.<br><br>관리자에게 문의해 주세요.',
                    buttons: [
                        dialog.createButton('확인', () => dialog.hide())
                    ]
                });
                break;
            case 'success':
                if(loginForm['remember'].checked) {
                    // localStorage에 key = loginEmail, value = loginForm['email'].value 저장
                    // localStorage 확인법 : 개발자 도구(F12) -> Application -> Storage - Local storage
                    localStorage.setItem('loginEmail', loginForm['email'].value);
                }
                const url = new URL(location.href);
                if (url.searchParams.get('r')) {
                    location.href = url.searchParams.get('r');
                } else {
                    location.href = '../article/write?code=free';
                }
                break;
            default:
                dialog.show({
                    title: '오류',
                    content: '서버가 예상치 못한 응답을 반환하였습니다..<br><br>잠시 후 다시 시도해 주세요.',
                    buttons: [
                        dialog.createButton('확인', () => dialog.hide())
                    ]
                });
        }
    };
    xhr.open('POST', './login');
    xhr.send(formData);
    loading.show();
}