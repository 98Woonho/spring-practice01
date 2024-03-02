const resetPasswordForm = document.getElementById('resetPasswordForm');

resetPasswordForm['emailSend'].onclick = function() {
    if (resetPasswordForm['email'].value === '') {
        dialog.show({
            title: '이메일',
            content: '이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    resetPasswordForm['email'].focus();
                    resetPasswordForm['email'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }
    if (!new RegExp(resetPasswordForm['email'].dataset.regex).test(resetPasswordForm['email'].value)) {
        dialog.show({
            title: '이메일',
            content: '올바른 이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    resetPasswordForm['email'].focus();
                    resetPasswordForm['email'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', resetPasswordForm['email'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status >= 200 && xhr.status < 300) {
            const responseObject = JSON.parse(xhr.responseText);
            switch (responseObject['result']) {
                case 'failure':
                    dialog.show({
                        title: '오류',
                        content: '알 수 없는 이유로 인증번호를 전송하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [
                            dialog.createButton('확인', () => dialog.hide())
                        ]
                    });
                    break;
                case 'failure_unknown_email':
                    dialog.show({
                        title: '오류',
                        content: '존재하지 않는 이메일 입니다.<br><br>이메일을 다시 확인해 주세요.',
                        buttons: [
                            dialog.createButton('확인', () => dialog.hide())
                        ]
                    });
                    break;
                case 'success':
                    resetPasswordForm['emailSalt'].value = responseObject['salt'];
                    resetPasswordForm['email'].setAttribute('disabled', ''); // password="email"인 태그에 disabled 속성 추가. ''은 속성값인데 disabled는 속성값이 없으므로 공백.
                    resetPasswordForm['emailSend'].setAttribute('disabled', ''); // password="emailSend"인 태그에 disabled 속성 추가. ''은 속성값인데 disabled는 속성값이 없으므로 공백.
                    resetPasswordForm['emailCode'].removeAttribute('disabled'); // password="emailCode"인 태그에 disabled 속성 제거
                    resetPasswordForm['emailVerify'].removeAttribute('disabled'); // password="emailVerify"인 태그에 disabled 속성 제거
                    dialog.show({
                        title: '성공',
                        content: '입력하신 이메일로 인증번호가 포함된 메일을 전송하였습니다.<br><br>해당 인증번호는 <b>5분간만 유효</b>하니 유의해 주세요.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                resetPasswordForm['emailCode'].focus();
                            })
                        ]
                    })
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
        } else {
            dialog.show({
                title: '오류',
                content: '요청을 전송하는 도중에 오류가 발생하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                buttons: [
                    dialog.createButton('확인', () => dialog.hide())
                ]
            });
        }
    }
    xhr.open('POST', './resetPasswordEmail');
    xhr.send(formData);
    loading.show();
}


resetPasswordForm['emailVerify'].onclick = function () {
    if (resetPasswordForm['emailCode'].value === '') {
        dialog.show({
            title: '인증번호',
            content: '인증번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    resetPasswordForm['emailCode'].focus();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    if (!new RegExp(resetPasswordForm['emailCode'].dataset.regex).test(resetPasswordForm['emailCode'].value)) {
        dialog.show({
            title: '인증번호',
            content: '올바른 인증번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    dialog.hide();
                    resetPasswordForm['emailCode'].focus();
                    resetPasswordForm['emailCode'].select();
                })
            ]
        });
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', resetPasswordForm['email'].value);
    formData.append('code', resetPasswordForm['emailCode'].value);
    formData.append('salt', resetPasswordForm['emailSalt'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status >= 200 && xhr.status < 300) {
            const responseObject = JSON.parse(xhr.responseText);
            switch (responseObject['result']) {
                case 'failure':
                    dialog.show({
                        title: '오류',
                        content: '알 수 없는 이유로 인증번호를 확인하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [
                            dialog.createButton('확인', () => dialog.hide())
                        ]
                    });
                    break;
                case 'failure_expired':
                    dialog.show({
                        title: '오류',
                        content: '이메일 인증번호 세션이 만료되었습니다.<br><br>아래 확인 버튼을 눌러 이메일 인증을 재진행해 주세요.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                resetPasswordForm['emailSalt'].value = '';
                                resetPasswordForm['email'].removeAttribute('disabled');
                                resetPasswordForm['email'].focus();
                                resetPasswordForm['email'].select();
                                resetPasswordForm['emailSend'].removeAttribute('disabled');
                                resetPasswordForm['emailCode'].value = '';
                                resetPasswordForm['emailCode'].setAttribute('disabled', '');
                                resetPasswordForm['emailVerify'].setAttribute('disabled', '');
                            })
                        ]
                    });
                    break;
                case 'failure_invalid_code':
                    dialog.show({
                        title: '오류',
                        content: '이메일 인증번호가 올바르지 않습니다.<br><br>입력하신 인증번호를 다시 확인해 주세요.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                resetPasswordForm['emailCode'].focus();
                                resetPasswordForm['emailCode'].select();
                            })
                        ]
                    });
                    break;
                case 'success':
                    resetPasswordForm.querySelector('[rel="emailComplete"]').classList.add('visible');
                    dialog.show({
                        title: '이메일 인증',
                        content: '이메일 및 인증번호를 확인하였습니다.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                resetPasswordForm['emailCode'].setAttribute('disabled', '');
                                resetPasswordForm['emailVerify'].setAttribute('disabled', '');
                                resetPasswordForm['password'].removeAttribute('disabled');
                                resetPasswordForm['passwordCheck'].removeAttribute('disabled');
                                resetPasswordForm['resetPassword'].removeAttribute('disabled');
                            })
                        ]
                    })
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
        } else {
            dialog.show({
                title: '오류',
                content: '요청을 전송하는 도중에 오류가 발생하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                buttons: [
                    dialog.createButton('확인', () => dialog.hide())
                ]
            });
        }
    }
    xhr.open('PATCH', './resetPasswordEmail');
    xhr.send(formData);
    loading.show();
}


resetPasswordForm.onsubmit = function(e) {
    e.preventDefault();

    if (resetPasswordForm['password'].value === '') {
        dialog.show({
            title: '경고',
            content: '비밀번호를 입력해 주세요.',
            buttons: [dialog.createButton('확인', function () {
                dialog.hide();
                resetPasswordForm['password'].focus();
                resetPasswordForm['password'].select();
            })]
        });
        return;
    }
    if (!resetPasswordForm['password'].testRegex()) {
        dialog.show({
            title: '경고',
            content: '올바른 비밀번호를 입력해 주세요.',
            buttons: [dialog.createButton('확인', function () {
                dialog.hide();
                resetPasswordForm['password'].focus();
                resetPasswordForm['password'].select();
            })]
        })
        return;
    }
    if (resetPasswordForm['passwordCheck'].value === '') {
        dialog.show({
            title: '경고',
            content: '비밀번호를 한 번 더 입력해 주세요.',
            buttons: [dialog.createButton('확인', function () {
                dialog.hide();
                resetPasswordForm['passwordCheck'].focus();
                resetPasswordForm['passwordCheck'].select();
            })]
        });
        return;
    }
    if (resetPasswordForm['password'].value !== resetPasswordForm['passwordCheck'].value) {
        dialog.show({
            title: '경고',
            content: '비밀번호가 일치하지 않습니다. 한 번 더 확인해 주세요.',
            buttons: [dialog.createButton('확인', function () {
                dialog.hide();
                resetPasswordForm['passwordCheck'].focus();
                resetPasswordForm['passwordCheck'].select();
            })]
        });
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', resetPasswordForm['email'].value);
    formData.append('password', resetPasswordForm['password'].value);

    xhr.onreadystatechange = function() {
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
                    title: '경고',
                    content: '알 수 없는 이유로 비밀번호 재설정을 실패하였습니다..<br><br>잠시 후 다시 시도해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function() {
                            dialog.hide();
                            resetPasswordForm['password'].focus();
                            resetPasswordForm['password'].select();

                        })
                    ]
                })
                break;
            case 'failure_duplicate_password':
                dialog.show({
                    title: '경고',
                    content: '이전 비밀번호와 동일합니다.<br><br>신규 비밀번호를 다시 입력해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function() {
                            dialog.hide();
                            resetPasswordForm['password'].focus();
                            resetPasswordForm['password'].select();

                        })
                    ]
                })
                break;
            case 'success':
                dialog.show({
                    title: '비밀번호 재설정',
                    content: '비밀번호 재설정을 완료 하였습니다. <br><br> 아래 <b>로그인하러 가기</b>버튼을 클릭하면 로그인 페이지로 이동합니다.',
                    buttons: [
                        dialog.createButton('로그인하러 가기', function() {
                            dialog.hide();
                            location.href = './login';

                        })
                    ]
                })
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
    xhr.open('PATCH', './resetPassword');
    xhr.send(formData);
    loading.show();
}