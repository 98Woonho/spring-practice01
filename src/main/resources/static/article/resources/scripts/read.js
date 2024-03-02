const articleTable = document.getElementById('articleTable');

// 게시글 삭제
{ // 해당 스코프 안에 선언된 변수는 해당 스코프에서만 사용이 가능함. 외부에서 사용하면 오류 남
    const deleteEl = articleTable.querySelector('[rel="delete"]');
    if (deleteEl) {
        const deleteFunc = function () {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            // articleTable에서 th:data-index="${article.getIndex()}를 해주었기 때문에 사용 가능
            formData.append('index', articleTable.dataset.index);
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
                            content: '알 수 없는 이유로 게시글을 삭제하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                        break;
                    case 'success':
                        // articleTable에서 th:data-board-code="${board.getCode()}를 해주었기 때문에 사용 가능
                        location.href = `../board/list?code=${articleTable.dataset.boardCode}`;
                        break;
                    default:
                        dialog.show({
                            title: '오류',
                            content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                }
            }
            xhr.open('DELETE', './read');
            xhr.send(formData);
            loading.show();
        }
        deleteEl.onclick = function () {
            dialog.show({
                title: '게시글 삭제',
                content: '정말로 게시글을 삭제할까요?<br><br>게시글에 작성된 댓글이 함께 삭제되며 이는 되돌릴 수 없습니다.',
                buttons: [
                    dialog.createButton('취소', dialog.hide),
                    dialog.createButton('삭제', function () {
                        dialog.hide();
                        deleteFunc();
                    })
                ]
            })
        }
    }
}

const commentTable = document.getElementById('commentTable');

const comment = {};

comment.alterLike = function (commentIndex, status) {
    // 전달 받은 commentIndex 댓글 좋아요 상태를 수정할 수 있는 함수.
    // status
    //    - true : 좋아요
    //    - false : 싫어요
    //    - null/undefined : 중립
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('commentIndex', commentIndex);
    if (typeof status === 'boolean') {
        formData.append('status', status);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
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
                    content: '알 수 없는 이유로 요청을 처리하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
                break;
            case 'success':
                const commentEl = commentTable.querySelector(`[rel="comment"][data-index="${commentIndex}"]`);
                const upVoteEl = commentEl.querySelector(`[data-vote="up"]`);
                const downVoteEl = commentEl.querySelector(`[data-vote="down"]`);
                upVoteEl.querySelector('.value').innerText = responseObject['likeCount'];
                downVoteEl.querySelector('.value').innerText = responseObject['dislikeCount'];
                switch (responseObject['likeStatus']) {
                    case 0:
                        upVoteEl.classList.remove('selected');
                        downVoteEl.classList.remove('selected');
                        break;
                    case 1:
                        upVoteEl.classList.add('selected');
                        downVoteEl.classList.remove('selected');
                        break;
                    case -1:
                        upVoteEl.classList.remove('selected');
                        downVoteEl.classList.add('selected');
                        break;
                }
                break;
            default:
                dialog.show({
                    title: '오류',
                    content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
        }
    }
    xhr.open('PUT', './comment');
    xhr.send(formData);
}

// allComments : 모든 댓글
// targetComment : 타겟 댓글
comment.append = function (allComments, targetComment, step) {
    step ??= 0; // step이 null 또는 undefined인 경우 0으로 초기화
    const commentEl = new DOMParser().parseFromString(`
        <div class="comment ${targetComment['isMine'] === true ? 'mine' : ''}
                            ${typeof targetComment['commentIndex'] === 'number' ? 'sub' : ''}
                            ${typeof targetComment['content'] === 'string' ? '' : 'deleted'}"
                            data-index="${targetComment['index']}" rel="comment">
            <div class="head">
                <span class="nickname" rel="nickname">${targetComment['userNickname']}</span>
                <span class="written-at" rel="writtenAt">
                      ${targetComment['at']}
                      ${targetComment['isModified'] === true ? '(수정됨)' : ''}
                </span>
                <span class="spring"></span>
                ${typeof targetComment['content'] === 'string' && targetComment['isMine'] === true ? '<span class="action" rel="modify">수정</span>' : ''}
                ${typeof targetComment['content'] === 'string' && targetComment['isMine'] === true ? '<span class="action" rel="delete">삭제</span>' : ''}
                ${typeof targetComment['content'] === 'string' && targetComment['isMine'] === true ? '<span class="action" rel="modifyCancel">수정 취소</span>' : ''}
                    </div>
                        <div class="body">
                            <span class="content" rel="content">${typeof targetComment['content'] === 'string' ? targetComment['content'] : '삭제된 댓글입니다.'}</span>
                            ${typeof targetComment['content'] === 'string' ? `
                            <form rel="modifyForm" class="modify-form">
                                <textarea name="content" maxlength="1000" placeholder="댓글을 입력해 주세요."  class="common-field"></textarea>
                                <input type="submit" value="댓글 수정" class="common-button">
                            </form>` : ''}
                        </div>
                        ${typeof targetComment['content'] === 'string' ? `
                        <div class="foot">
                            <span class="vote ${targetComment['likeStatus'] === 1 ? 'selected' : ''}" rel="vote" data-vote="up">
                                <img class="icon" src="./resources/images/comment.vote.up.png" alt="👍">
                                <span class="value">${targetComment['likeCount']}</span>
                            </span>
                            <span class="vote ${targetComment['likeStatus'] === -1 ? 'selected' : ''}" rel="vote" data-vote="down">
                                <img class="icon" src="./resources/images/comment.vote.down.png" alt="👎">
                                <span class="value">${targetComment['dislikeCount']}</span>
                            </span> 
                            <span class="spring"></span>
                            <span class="action" rel="reply">답글 달기</span>
                            <span class="action" rel="replyCancel">답글 달기 취소</span>
                        </div>
                        <form rel="replyForm" class="reply-form">
                            <input hidden type="hidden" name="commentIndex" value="?">
                            <label class="label">
                                <textarea name="content" maxlength="1000" placeholder="답글을 입력해 주세요." data-reget="${commentForm['content'].getAttribute('data-regex')}" class="common-field big"></textarea>
                            </label>
                            <input type="submit" value="답글 달기" class="common-button">
                        </form>` : ''}
                    </div>`, 'text/html').querySelector('[rel="comment"]');
    commentEl.style.marginLeft = `${3 * step}rem`;

    const replyForm = commentEl.querySelector('[rel="replyForm"]');
    if (replyForm) {
        // 답글 달기 눌렀을 때
        commentEl.querySelector('[rel="reply"]').onclick = function () {
            const userStatus = document.head.querySelector('meta[name="_user-status"]').getAttribute('content');
            if (userStatus !== 'true') {
                dialog.show({
                    title: '경고',
                    content: '로그인 후 이용할 수 있습니다.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
                return false;
            }
            commentEl.classList.add('replying');
            replyForm['content'].focus();
        }
        // 답글 달기 취소 눌렀을 때
        commentEl.querySelector('[rel="replyCancel"]').onclick = function () {
            commentEl.classList.remove('replying');
        }
        // 대댓글 창은 댓글마다 있기 때문에 for문 안에 onsubmit을 함께 구현해주어야 함.
        replyForm.onsubmit = function (e) {
            e.preventDefault();
            if (replyForm['content'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '답글을 입력해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function () {
                            dialog.hide();
                            replyForm['content'].focus();
                        })]
                });
                return false;
            }
            if (!replyForm['content'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 답글을 입력해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function () {
                            dialog.hide();
                            replyForm['content'].focus();
                            replyForm['content'].select();
                        })]
                });
                return false;
            }
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('articleIndex', targetComment['articleIndex'] + '');
            formData.append('commentIndex', targetComment['index'] + ''); // 어느 댓글의 대댓글인가에 대한 인덱스
            formData.append('content', replyForm['content'].value);
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
                    case `failure`:
                        dialog.show({
                            title: '오류',
                            content: '알 수 없는 이유로 답글을 작성하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                        break;
                    case 'success':
                        comment.load();
                        break;
                    default:
                        dialog.show({
                            title: '오류',
                            content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                }
            }
            xhr.open('POST', './comment');
            xhr.send(formData);
            loading.show();
        }
    }
    const upVote = commentEl.querySelector('[rel="vote"][data-vote="up"]');
    const downVote = commentEl.querySelector('[rel="vote"][data-vote="down"]');
    if (upVote && downVote) {
        // upVote 눌렀을 때
        upVote.onclick = function () {
            const userStatus = document.head.querySelector('meta[name="_user-status"]').getAttribute('content');
            if (userStatus !== 'true') {
                dialog.show({
                    title: '경고',
                    content: '로그인 후 이용할 수 있습니다.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
                return false;
            }
            if (upVote.classList.contains('selected')) { // 이미 upVote가 눌러져 있을 때
                comment.alterLike(targetComment['index'], null);
            } else {
                comment.alterLike(targetComment['index'], true);
            }
        }
        // downVote 눌렀을 때
        downVote.onclick = function () {
            const userStatus = document.head.querySelector('meta[name="_user-status"]').getAttribute('content');
            if (userStatus !== 'true') {
                dialog.show({
                    title: '경고',
                    content: '로그인 후 이용할 수 있습니다.',
                    buttons: [dialog.createButton('확인', dialog.hide)]
                });
                return false;
            }
            if (downVote.classList.contains('selected')) { // 이미 downVote가 눌러져 있을 때
                comment.alterLike(targetComment['index'], null);
            } else {
                comment.alterLike(targetComment['index'], false);
            }
        }
    }
    const deleteEl = commentEl.querySelector('[rel="delete"]');
    if (deleteEl) {
        deleteEl.onclick = function () {
            dialog.show({
                title: '댓글 삭제',
                content: '정말로 댓글을 삭제할까요?<br><br>댓글에 답글이 있다면 함께 삭제되니 유의해 주세요.',
                buttons: [
                    dialog.createButton('취소', dialog.hide),
                    dialog.createButton('삭제', function () {
                        dialog.hide();
                        const xhr = new XMLHttpRequest();
                        const formData = new FormData();
                        formData.append('index', targetComment['index'])
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
                                case `failure`:
                                    dialog.show({
                                        title: '오류',
                                        content: '알 수 없는 이유로 댓글을 삭제하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                                        buttons: [dialog.createButton('확인', dialog.hide)]
                                    });
                                    break;
                                case 'success':
                                    comment.load();
                                    break;
                                default:
                                    dialog.show({
                                        title: '오류',
                                        content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                                        buttons: [dialog.createButton('확인', dialog.hide)]
                                    });
                            }
                        }
                        xhr.open('DELETE', './comment');
                        xhr.send(formData);
                        loading.show();
                    })
                ]
            });
        }
    }
    const modifyEl = commentEl.querySelector('[rel="modify"]');
    const modifyCancelEl = commentEl.querySelector('[rel="modifyCancel"]');
    if (modifyEl && modifyCancelEl) {
        const modifyForm = commentEl.querySelector('[rel="modifyForm"]');
        modifyEl.onclick = function () {
            commentEl.classList.add('modifying');
            modifyForm['content'].value = commentEl.querySelector('[rel="content"]').innerText;
            modifyForm['content'].focus();
        }
        modifyCancelEl.onclick = function () {
            commentEl.classList.remove('modifying');
        }

        modifyForm.onsubmit = function (e) {
            e.preventDefault();
            if (modifyForm['content'].value === '') {
                dialog.show({
                    title: '경고',
                    content: '댓글을 입력해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function () {
                            dialog.hide();
                            modifyForm['content'].focus();
                            modifyForm['content'].select();
                        })]
                });
                return false;
            }
            if (!modifyForm['content'].testRegex()) {
                dialog.show({
                    title: '경고',
                    content: '올바른 댓글을 입력해 주세요.',
                    buttons: [
                        dialog.createButton('확인', function () {
                            dialog.hide();
                            modifyForm['content'].focus();
                            modifyForm['content'].select();
                        })]
                });
                return false;
            }
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('index', targetComment['index']);
            formData.append('content', modifyForm['content'].value);
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
                    case `failure`:
                        dialog.show({
                            title: '오류',
                            content: '알 수 없는 이유로 댓글을 수정하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                        break;
                    case 'success':
                        commentEl.querySelector('[rel="content"]').innerText = modifyForm['content'].value;
                        commentEl.classList.remove('modifying');
                        break;
                    default:
                        dialog.show({
                            title: '오류',
                            content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                            buttons: [dialog.createButton('확인', dialog.hide)]
                        });
                }
            }
            xhr.open('PATCH', './comment');
            xhr.send(formData);
            loading.show();
        }
    }

    const tbody = commentTable.querySelector(':scope > tbody')
    // 댓글 불러오기를 했을 때 초기화 후 comments에서 댓글을 가져오기 위해서(안 그럼 같은 댓글이 밑에 추가로 계속 생김)
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.append(commentEl);
    tr.append(td);
    tbody.append(tr);

    const subComments = allComments.filter(x => x['commentIndex'] === targetComment['index']); // 현재 댓글의 대댓글 배열
    if (subComments.length > 0) {
        for (const subComment of subComments) {
            comment.append(allComments, subComment, Math.min(step + 1, 4));
        }
    }
}

// 댓글 불러오기
// comment.load() 함수 생성
comment.load = function () {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState != XMLHttpRequest.DONE) {
            return;
        }
        commentTable.classList.remove('loading');
        if (xhr.status < 200 || xhr.status > 300) {
            commentTable.classList.add('error');
            return;
        }
        const comments = JSON.parse(xhr.responseText);
        for (const commentObject of comments.filter(x => typeof x['commentIndex'] !== 'number')) { // 대댓글이 아닌 것만!
            comment.append(comments, commentObject);
        }
        commentForm.querySelector('[rel="count"]').innerText = comments.length;
    }
    xhr.open('GET', `./comment?articleIndex=${commentForm['articleIndex'].value}`);
    xhr.send();
    commentForm.querySelector('[rel="count"]').innerText = '0';
    // 댓글 불러오기를 했을 때, 이미 있는 댓글은 안 불러오고 remove
    commentTable.querySelector(':scope > tbody').innerHTML = '';
    commentTable.classList.remove('error');
    commentTable.classList.add('loading');
}


const commentForm = document.getElementById('commentForm');

if (commentForm) {
    commentForm.querySelector('[rel="refresh"]').onclick = comment.load;
    commentForm.onsubmit = function (e) {
        e.preventDefault();
        const userStatus = document.head.querySelector('meta[name="_user-status"]').getAttribute('content');
        if (userStatus !== 'true') {
            dialog.show({
                title: '경고',
                content: '로그인 후 이용할 수 있습니다.',
                buttons: [dialog.createButton('확인', dialog.hide)]
            });
            return false;
        }
        if (commentForm['content'].value === '') {
            dialog.show({
                title: '경고',
                content: '댓글을 입력해 주세요.',
                buttons: [
                    dialog.createButton('확인', function () {
                        dialog.hide();
                        commentForm['content'].focus();
                        commentForm['content'].select();
                    })]
            });
            return false;
        }
        if (!commentForm['content'].testRegex()) {
            dialog.show({
                title: '경고',
                content: '올바른 댓글을 입력해 주세요.',
                buttons: [
                    dialog.createButton('확인', function () {
                        dialog.hide();
                        commentForm['content'].focus();
                        commentForm['content'].select();
                    })]
            });
            return false;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('articleIndex', commentForm['articleIndex'].value);
        formData.append('content', commentForm['content'].value);
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
                case `failure`:
                    dialog.show({
                        title: '오류',
                        content: '알 수 없는 이유로 댓글을 작성하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [dialog.createButton('확인', dialog.hide)]
                    });
                    break;
                case 'success':
                    commentForm['content'].value = '';
                    commentForm['content'].focus();
                    comment.load();
                    break;
                default:
                    dialog.show({
                        title: '오류',
                        content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [dialog.createButton('확인', dialog.hide)]
                    });
            }
        }
        xhr.open('POST', './comment');
        xhr.send(formData);
        loading.show();
    }
}

// 페이지 들어갈 때 댓글 바로 보이게
comment.load();