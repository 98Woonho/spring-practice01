if (document.head.querySelector(':scope > meta[name="_allowed-status"]').getAttribute('content') === 'false') {
    dialog.show({
        title: '경고',
        content: '해당 게시판에 게시글을 작성할 권한이 없습니다.',
        buttons: [dialog.createButton('확인', function () {
            if (history.length > 1) {
                history.back();
            } else {
                window.close();
            }
        })]
    });
}

const modifyForm = document.getElementById('modifyForm');

// ckeditor
if (modifyForm) {
    ClassicEditor
        .create(modifyForm['content'], {
            // 게시글에 이미지를 띄우기 위해 Markdown 기능 비활성화
            removePlugins: ['Markdown'],
            // 이미지 업로드
            simpleUpload: {
                uploadUrl: './image' //   /article/image
            }
        })
        .then(function (editor) {
            modifyForm.editor = editor;
        })
        .catch(function (error) {
            console.log(error)
        });

    // name="fileAdd"인 button이 클릭 되었을 때, name="file"인 태그가 클릭이 되는 동작 구현
    modifyForm['fileAdd'].onclick = function (e) {
        e.preventDefault();

        modifyForm['file'].click();
    }

    modifyForm['file'].onchange = function () {
        // .files : 파일 입력(input type="file")에서 선택한 파일에 대한 정보를 제공하는 FileList 객체에 접근
        const file = modifyForm['file'].files[0];
        if (!file) {
            return;
        }
        const fileList = modifyForm.querySelector('[rel="fileList"]');
        // 주어진 HTML 문자열을 사용하여 새로운 DOM 요소를 만들고, 그 요소를 나타내는 JavaScript 객체를 생성
        const item = new DOMParser().parseFromString(`
            <li class="item" rel="item">
                <span class="progress" rel="progress"></span>
                <span class="text-container">
                    <span class="name" title="${file['name']}">${file['name']}</span>
                    <!-- toLocaleString() : 숫자에 천 단위로 쉼표 붙여줌-->
                    <span class="size">${(Math.floor(file['size'] / 1024 * 100) / 100).toLocaleString()}KB</span>
                </span>
                <a rel="delete" class="common-button">삭제</a>
            </li>`, 'text/html').querySelector('[rel="item"]');
        const progressEl = item.querySelector('[rel="progress"]');
        const deleteEl = item.querySelector('[rel="delete"]');

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status > 300) {
                item.classList.add('error');
            }
            const responseObject = JSON.parse(xhr.responseText);
            switch (responseObject['result']) {
                case 'success':
                    // item.dataset.index : item에 'data-index' 속성을 추가하는 속성(dataset은 HTML 요소의 'data-' 접두사로 시작하는 모든 속성에 접근할 수 있는 속성)
                    item.dataset.index = responseObject['index'];
                    item.classList.add('complete');
                    break;
                default:
                    item.classList.add('error');
            }
        }
        // progress라는 span 태그를 이용하여 업로드 진행 현황을 표현하는 기능
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                // e.loaded : 현재 완성된 바이트 양
                // e.total : 전체 바이트 양
                // width: 0 에서 100%까지 오르면서 css에서 설정한대로 background-color가 바뀜.
                progressEl.style.width = `${Math.floor(e.loaded / e.total * 100)}%`
            }
        }

        xhr.open('POST', './file');
        xhr.send(formData);

        deleteEl.onclick = function () {
            item.remove();
        }
        fileList.append(item);
        fileList.scrollLeft = fileList.scrollWidth; // 파일이 추가 되면 스크롤을 오른쪽 끝으로 알아서 당겨줌.
        modifyForm['file'].value = '';
    }

    // modify 작성하기 버튼 클릭 시
    modifyForm.onsubmit = function (e) {
        e.preventDefault();

        const fileList = modifyForm.querySelector('[rel="fileList"]');
        // fileList에 저장된 file들을 모두 선택해서 배열로 저장
        const fileItems = Array.from(fileList.querySelectorAll(':scope > [rel="item"]'));

        // complete 클래스가 없는 file이 하나라도 있다면
        if (fileItems.some(fileItem => !fileItem.classList.contains('complete'))) {
            dialog.show({
                title: '경고',
                content: '업로드가 실패하였거나 아직 업로드가 진행중인 파일이 있습니다.<br><br>실패한 항목을 삭제하거나 업로드가 완료 된 후 다시 시도해 주세요.',
                buttons: [dialog.createButton('확인', dialog.hide)]
            });
            return false;
        }
        if (modifyForm['title'].value === '') {
            dialog.show({
                title: '경고',
                content: '제목을 입력해 주세요.',
                buttons: [dialog.createButton('확인', function () {
                    dialog.hide();
                    modifyForm['title'].focus();
                })]
            });
            return;
        }
        if (!modifyForm['title'].testRegex()) {
            dialog.show({
                title: '경고',
                content: '올바른 제목을 입력해 주세요.',
                buttons: [dialog.createButton('확인', function () {
                    dialog.hide();
                    modifyForm['title'].focus();
                    modifyForm['title'].select();
                })]
            });
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        // file이 업로드 되면서 file의 index를 article이 알고 있어야 함. 그래서 file의 data-index를 배열로 formData에 추가 해주어야 함.
        for (const fileItem of fileItems) {
            formData.append('fileIndexes', parseInt(fileItem.dataset.index));
        }
        formData.append('index', modifyForm['index'].value);
        formData.append('title', modifyForm['title'].value);
        // modifyForm.editor.getData() : editor에 작성된 내용을 HTML로 변환해줌.
        formData.append('content', modifyForm.editor.getData());
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
                        content: '알 수 없는 이유로 게시글을 수정하지 못하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [dialog.createButton('확인', dialog.hide)]
                    });
                    break;
                case 'success':
                    location.href = `./read?index=${modifyForm['index'].value}`;
                    break;
                default:
                    dialog.show({
                        title: '오류',
                        content: '서버가 예상치 못한 응답을 반환하였습니다.<br><br>잠시 후 다시 시도해 주세요.',
                        buttons: [dialog.createButton('확인', dialog.hide)]
                    });
            }
        };
        xhr.open('POST', './modify');
        xhr.send(formData);
        loading.show();
    }
}

{
    const fileList = modifyForm.querySelector('[rel="fileList"]');
    const files = fileList.querySelectorAll(':scope > [rel="item"]');
    for (const file of files) {
        const deleteEl = file.querySelector('[rel="delete"]');
        deleteEl.onclick = function () {
            file.remove();
        }
    }
}