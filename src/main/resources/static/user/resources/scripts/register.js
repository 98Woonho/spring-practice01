const mainForm = document.getElementById('main');
const addressFind = document.getElementById('addressFind');

mainForm['prev'].onclick = function () {
    const minStep = 1;
    const maxStep = 3;
    let step = parseInt(mainForm.dataset.step) - 1;
    if (step < minStep) {
        step = minStep;
    }
    if (step > maxStep) {
        step = maxStep;
    }
    mainForm.dataset.step = step + '';
}

mainForm['infoEmailSend'].onclick = function () {
    if (mainForm['infoEmail'].value === '') {
        dialog.show({
            title: '이메일',
            content: '이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    mainForm['infoEmail'].focus();
                    mainForm['infoEmail'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }
    if (!new RegExp(mainForm['infoEmail'].dataset.regex).test(mainForm['infoEmail'].value)) {
        dialog.show({
            title: '이메일',
            content: '올바른 이메일을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    mainForm['infoEmail'].focus();
                    mainForm['infoEmail'].select();
                    dialog.hide();
                })
            ]
        });
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', mainForm['infoEmail'].value);
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
                case 'failure_duplicate_email':
                    dialog.show({
                        title: '오류',
                        content: '해당 이메일은 이미 사용 중입니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [
                            dialog.createButton('확인', () => dialog.hide())
                        ]
                    });
                    break;
                case 'success':
                    mainForm['infoEmailSalt'].value = responseObject['salt'];
                    mainForm['infoEmail'].setAttribute('disabled', ''); // name="infoEmail"인 태그에 disabled 속성 추가. ''은 속성값인데 disabled는 속성값이 없으므로 공백.
                    mainForm['infoEmailSend'].setAttribute('disabled', ''); // name="infoEmailSend"인 태그에 disabled 속성 추가. ''은 속성값인데 disabled는 속성값이 없으므로 공백.
                    mainForm['infoEmailCode'].removeAttribute('disabled'); // name="infoEmailCode"인 태그에 disabled 속성 제거
                    mainForm['infoEmailVerify'].removeAttribute('disabled'); // name="infoEmailVerify"인 태그에 disabled 속성 제거
                    dialog.show({
                        title: '성공',
                        content: '입력하신 이메일로 인증번호가 포함된 메일을 전송하였습니다.<br><br>해당 인증번호는 <b>5분간만 유효</b>하니 유의해 주세요.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                mainForm['infoEmailCode'].focus();
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
    xhr.open('POST', './registerEmail');
    xhr.send(formData);
    loading.show();
}

mainForm['infoEmailVerify'].onclick = function () {
    if (mainForm['infoEmailCode'].value === '') {
        dialog.show({
            title: '인증번호',
            content: '인증번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    mainForm['infoEmailCode'].focus();
                    dialog.hide();
                })
            ]
        });
        return;
    }

    if (!new RegExp(mainForm['infoEmailCode'].dataset.regex).test(mainForm['infoEmailCode'].value)) {
        dialog.show({
            title: '인증번호',
            content: '올바른 인증번호를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function () {
                    dialog.hide();
                    mainForm['infoEmailCode'].focus();
                    mainForm['infoEmailCode'].select();
                })
            ]
        });
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', mainForm['infoEmail'].value);
    formData.append('code', mainForm['infoEmailCode'].value);
    formData.append('salt', mainForm['infoEmailSalt'].value);
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
                                mainForm['infoEmailSalt'].value = '';
                                mainForm['infoEmail'].removeAttribute('disabled');
                                mainForm['infoEmail'].focus();
                                mainForm['infoEmail'].select();
                                mainForm['infoEmailSend'].removeAttribute('disabled');
                                mainForm['infoEmailCode'].value = '';
                                mainForm['infoEmailCode'].setAttribute('disabled', '');
                                mainForm['infoEmailVerify'].setAttribute('disabled', '');
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
                                mainForm['infoEmailCode'].focus();
                                mainForm['infoEmailCode'].select();
                            })
                        ]
                    });
                    break;
                case 'success':
                    mainForm.querySelector('[rel="infoEmailComplete"]').classList.add('visible');
                    dialog.show({
                        title: '이메일 인증',
                        content: '이메일 및 인증번호를 확인하였습니다.',
                        buttons: [
                            dialog.createButton('확인', function () {
                                dialog.hide();
                                mainForm['infoEmailCode'].setAttribute('disabled', '');
                                mainForm['infoEmailVerify'].setAttribute('disabled', '');
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
    xhr.open('PATCH', './registerEmail');
    xhr.send(formData);
    loading.show();
}

mainForm['infoAddressFind'].onclick = function () {
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: function (data) {
            mainForm['infoAddressPostal'].value = data['zonecode'];
            mainForm['infoAddressPrimary'].value = data['address'];
            addressFind.classList.remove('visible');
            mainForm['infoAddressSecondary'].focus();
            mainForm['infoAddressSecondary'].select();
        }
    }).embed(addressFind.querySelector(':scope > .modal'))
    addressFind.classList.add('visible');
}

mainForm.onsubmit = function (e) { // <input type="submit"> 태그 동작 시(하단 다음 버튼)
    e.preventDefault();

    const step = parseInt(mainForm.dataset.step); // mainForm.dataset.step 속성값을 정수로 변환하여 step에 저장.
    switch (step) {
        case 1:
            if (!mainForm['termPolicyAgree'].checked) { // <input type="checkbox" name="termPolicyAgree"> 체크박스가 체크가 되어있지 않을 때
                dialog.show({
                    title: '서비스 이용약관',
                    content: '서비스 이용약관을 읽고 동의해 주세요.',
                    buttons: [
                        dialog.createButton('확인', () => dialog.hide())
                    ]
                });
                return false;
            }
            if (!mainForm['termPrivacyAgree'].checked) {
                dialog.show({
                    title: '개인정보 처리방침',
                    content: '개인정보 처리방침을 읽고 동의해 주세요.',
                    buttons: [
                        dialog.createButton('확인', () => dialog.hide())
                    ]
                });
                return false;
            }
            if (!mainForm['termMarketingAgree'].checked) {
                dialog.show({
                    title: '마케팅 및 광고 활용 동의',
                    content: '마케팅 및 광고 활용에 동의하시면 다양한 혜택을 받아보실 수 있습니다.<br><br>다시 확인해 보시려면 [닫기]버튼을, 동의하지 않고 진행하시려면 <b>계속하기</b> 버튼을 클릭해 주세요.',
                    buttons: [
                        dialog.createButton('닫기', () => dialog.hide())
                        ,
                        dialog.createButton('계속하기', function () {
                            mainForm.dataset.step = '2';
                            dialog.hide();
                        })
                    ]
                });
            } else {
                mainForm.dataset.step = '2';
            }
            break;
        case 2:
            if (!mainForm['infoEmail'].hasAttribute('disabled') || !mainForm['infoEmailCode'].hasAttribute('disabled')) {
                dialog.show({
                    title: '경고',
                    content: '이메일 인증을 완료해 주세요.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
                return;
            }
            if (mainForm['infoPassword'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '비밀번호를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoPassword'].focus();
                        mainForm['infoPassword'].select();
                    })]
                });
                return;
            }
            if (!mainForm['infoPassword'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 비밀번호를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoPassword'].focus();
                        mainForm['infoPassword'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoPasswordCheck'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '비밀번호를 한 번 더 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoPasswordCheck'].focus();
                        mainForm['infoPasswordCheck'].select();
                    })]
                });
                return;
            }
            if (mainForm['infoPassword'].value !== mainForm['infoPasswordCheck'].value) {
                dialog.show({
                    title: '경고',
                    content: '비밀번호가 일치하지 않습니다. 한 번 더 확인해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoPasswordCheck'].focus();
                        mainForm['infoPasswordCheck'].select();
                    })]
                });
                return;
            }
            if (mainForm['infoNickname'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '닉네임을 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoNickname'].focus();
                        mainForm['infoNickname'].select();
                    })]
                });
                return;
            }
            if (!mainForm['infoNickname'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 닉네임 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoNickname'].focus();
                        mainForm['infoNickname'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoName'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '이름을 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoName'].focus();
                        mainForm['infoName'].select();
                    })]
                });
                return;
            }
            if (!mainForm['infoName'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 이름을 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoName'].focus();
                        mainForm['infoName'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoContactCompany'].value === '-1') {
                dialog.show({
                    title: '경고',
                    content: '통신사를 선택해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactCompany'].focus();
                        mainForm['infoContactCompany'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoContactFirst'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactFirst'].focus();
                        mainForm['infoContactFirst'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoContactSecond'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactSecond'].focus();
                        mainForm['infoContactSecond'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoContactThird'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactThird'].focus();
                        mainForm['infoContactThird'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoContactFirst'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactFirst'].focus();
                        mainForm['infoContactFirst'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoContactSecond'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactSecond'].focus();
                        mainForm['infoContactSecond'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoContactThird'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 연락처를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoContactThird'].focus();
                        mainForm['infoContactThird'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoAddressPostal'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '우편번호를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressPostal'].focus();
                        mainForm['infoAddressPostal'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoAddressPrimary'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '주소 찾기 버튼을 통해 기본 주소를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressPrimary'].focus();
                        mainForm['infoAddressPrimary'].select();
                    })]
                })
                return;
            }
            if (mainForm['infoAddressSecondary'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '상세 주소를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressSecondary'].focus();
                        mainForm['infoAddressSecondary'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoAddressPostal'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 우편번호를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressPostal'].focus();
                        mainForm['infoAddressPostal'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoAddressPrimary'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 기본 주소를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressPrimary'].focus();
                        mainForm['infoAddressPrimary'].select();
                    })]
                })
                return;
            }
            if (!mainForm['infoAddressSecondary'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 상세주소를 입력해 주세요.',
                    buttons: [dialog.createButton('확인', function () {
                        dialog.hide();
                        mainForm['infoAddressSecondary'].focus();
                        mainForm['infoAddressSecondary'].select();
                    })]
                })
                return;
            }
            const xhr = new XMLHttpRequest();
            const formData = new FormData;
            formData.append('termMarketingAgreed', mainForm['termMarketingAgree'].checked);
            formData.append('email', mainForm['infoEmail'].value);
            formData.append('code', mainForm['infoEmailCode'].value);
            formData.append('salt', mainForm['infoEmailSalt'].value);
            formData.append('password', mainForm['infoPassword'].value);
            formData.append('nickname', mainForm['infoNickname'].value);
            formData.append('name', mainForm['infoName'].value);
            formData.append('contactCompanyCode', mainForm['infoContactCompany'].value);
            formData.append('contactFirst', mainForm['infoContactFirst'].value);
            formData.append('contactSecond', mainForm['infoContactSecond'].value);
            formData.append('contactThird', mainForm['infoContactThird'].value);
            formData.append('addressPostal', mainForm['infoAddressPostal'].value);
            formData.append('addressPrimary', mainForm['infoAddressPrimary'].value);
            formData.append('addressSecondary', mainForm['infoAddressSecondary'].value);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status >= 200 && xhr.status <= 300) {
                    const responseObject = JSON.parse(xhr.responseText);
                    switch (responseObject['result']) {
                        case 'failure':
                            dialog.show({
                                title: '오류',
                                content: '회원가입에 실패 하였습니다.\n\n잠시 후 다시 시도해 주세요.',
                                buttons: [
                                    dialog.createButton('확인', function () {
                                        dialog.hide();
                                    })]
                            });
                            break;
                        case 'failure_duplicate_email':
                            dialog.show({
                                title: '오류',
                                content: '해당 이메일은 이미 사용 중입니다.<br><br>회원가입 도중 해당 이메일이 이미 회원가입에 사용 되었을 수 있습니다.',
                                buttons: [
                                    dialog.createButton('확인', function () {
                                        dialog.hide();
                                        mainForm['infoEmailSalt'].value = '';
                                        mainForm['infoEmail'].removeAttribute('disabled');
                                        mainForm['infoEmail'].focus();
                                        mainForm['infoEmail'].select();
                                        mainForm['infoEmailSend'].removeAttribute('disabled');
                                        mainForm['infoEmailCode'].value = '';
                                        mainForm.querySelector('[rel="infoEmailComplete"]').classList.remove('visible');
                                    })]
                            });
                            break;
                        case 'failure_duplicate_nickname':
                            dialog.show({
                                title: '오류',
                                content: '해당 닉네임은 이미 사용 중입니다. <br><br>다른 닉네임을 입력해 주세요.',
                                buttons: [
                                    dialog.createButton('확인', function () {
                                        dialog.hide();
                                        mainForm['infoNickname'].focus();
                                        mainForm['infoNickname'].select();
                                    })
                                ]
                            });
                            break;
                        case 'failure_duplicate_contact':
                            dialog.show({
                                title: '오류',
                                content: '해당 연락처는 이미 사용 중입니다. <br><br>다른 연락처를 입력해 주세요.',
                                buttons: [
                                    dialog.createButton('확인', function () {
                                        dialog.hide();
                                        mainForm['infoContactSecond'].focus();
                                        mainForm['infoContactSecond'].select();
                                    })
                                ]
                            });
                            break;
                        case 'success':
                            dialog.show({
                                title: '회원가입',
                                content: '회원가입이 완료되었습니다.<br><br><b>로그인하러 가기</b> 버튼을 클릭하여 로그인해 주세요.',
                                buttons: [
                                    dialog.createButton('로그인하러 가기', function () {
                                        dialog.hide();
                                        mainForm.dataset.step = '3';
                                    })
                                ]
                            });
                            break;
                        default:
                            dialog.show({
                                title: '오류',
                                content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                                buttons: [dialog.createButton('확인', dialog.hide)]
                            });
                    }
                    return;
                }
            }
            xhr.open('POST', './register');
            xhr.send(formData);
            break;
        case 3:
            break;
    }
}

addressFind.querySelector('[rel="close"]').onclick = function () {
    addressFind.classList.remove('visible');
}