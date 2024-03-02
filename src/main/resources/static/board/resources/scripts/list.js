if (document.head.querySelector(':scope > meta[name="_board-status"]').getAttribute('content') === 'false') {
    dialog.show({
        title: '경고',
        content: '존재하지 않는 게시판입니다.<br><br>경로를 다시 확인해 주세요.',
        buttons: [dialog.createButton('확인', function () {
            if (history.length > 1) {
                history.back();
            } else {
                window.close();
            }
        })]
    });
}