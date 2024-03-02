const recoverEmailForm = document.getElementById('recoverEmailForm');

recoverEmailForm.onsubmit = function(e) {
    e.preventDefault();

    if (recoverEmailForm['name'].value === '') {
        dialog.show({
            title: '경고',
            content: '이름을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['name'].focus();
                    recoverEmailForm['name'].select();
                })
            ]
        });
        return false;
    }

    if (!recoverEmailForm['name'].testRegex()) {
        dialog.show({
            title: '경고',
            content: '올바른 이름을 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['name'].focus();
                    recoverEmailForm['name'].select();
                })
            ]
        });
        return false;
    }

    if (recoverEmailForm['contactFirst'].value === '') {
        dialog.show({
            title: '경고',
            content: '연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactFirst'].focus();
                    recoverEmailForm['contactFirst'].select();
                })
            ]
        });
        return false;
    }

    if (!recoverEmailForm['contactFirst'].testRegex()) {
        dialog.show({
            title: '경고',
            content: '올바른 연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactFirst'].focus();
                    recoverEmailForm['contactFirst'].select();
                })
            ]
        });
        return false;
    }

    if (recoverEmailForm['contactSecond'].value === '') {
        dialog.show({
            title: '경고',
            content: '연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactSecond'].focus();
                    recoverEmailForm['contactSecond'].select();
                })
            ]
        });
        return false;
    }

    if (!recoverEmailForm['contactSecond'].testRegex()) {
        dialog.show({
            title: '경고',
            content: '올바른 연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactSecond'].focus();
                    recoverEmailForm['contactSecond'].select();
                })
            ]
        });
        return false;
    }

    if (recoverEmailForm['contactThird'].value === '') {
        dialog.show({
            title: '경고',
            content: '연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactThird'].focus();
                    recoverEmailForm['contactThird'].select();
                })
            ]
        });
        return false;
    }

    if (!recoverEmailForm['contactThird'].testRegex()) {
        dialog.show({
            title: '경고',
            content: '올바른 연락처를 입력해 주세요.',
            buttons: [
                dialog.createButton('확인', function() {
                    dialog.hide();
                    recoverEmailForm['contactThird'].focus();
                    recoverEmailForm['contactThird'].select();
                })
            ]
        });
        return false;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('name', recoverEmailForm['name'].value);
    formData.append('contactFirst', recoverEmailForm['contactFirst'].value);
    formData.append('contactSecond', recoverEmailForm['contactSecond'].value);
    formData.append('contactThird', recoverEmailForm['contactThird'].value);
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
                    content: '입력한 정보와 일치하는 회원을 찾을 수 없습니다.<br><br>실명과 연락처를 올바르게 입력 하였는지 다시 확인해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function() {
                            dialog.hide();
                            recoverEmailForm['name'].focus();
                            recoverEmailForm['name'].select();

                        })
                    ]
                })
                break;
            case 'success':
                dialog.show({
                    title: '이메일 찾기',
                    content: `입력한 정보로 찾은 이메일은 <b>${responseObject['email']}</b>입니다.<br><br> 아래 <b>로그인하러 가기</b>버튼을 클릭하면 로그인 페이지로 이동합니다.`, // 백틱 사용하여야 함.
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
    xhr.open('POST', './recoverEmail');
    xhr.send(formData);
    loading.show();
}