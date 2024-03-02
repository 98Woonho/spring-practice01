package com.whl.studybbs.controllers;


import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.dtos.CommentDto;
import com.whl.studybbs.entities.*;
import com.whl.studybbs.results.article.*;
import com.whl.studybbs.services.ArticleService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.SmartView;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Arrays;

@Controller
@RequestMapping(value = "article")
public class ArticleController {
    private final ArticleService articleService;

    @Autowired
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @RequestMapping(value = "write",
            method = RequestMethod.GET,
            produces = MediaType.TEXT_HTML_VALUE)
    /**
     * [공부] @RequestParam(value = "code", required = false, defaultValue = "") String code)
     * GET에서 @RequestParam을 사용하면, /write?code=free라고 입력하면 String code에는 free가 할당 됨.
     * 없으면 ""가 할당 되고, required = false 이므로 입력값이 없어도 메서드는 실행됨.
     */
    public ModelAndView getWrite(@SessionAttribute(value = "user", required = false) UserEntity user,
                                 @RequestAttribute(value = "boards") BoardEntity[] boards,
                                 @RequestParam(value = "code", required = false, defaultValue = "") String code) {
        ModelAndView modelAndView = new ModelAndView();
        if (user == null) { // 로그인을 안 했으면
            modelAndView.setViewName("redirect:/user/login"); // 로그인 페이지로 넘어감.
        } else {
            BoardEntity board = null;
            for (BoardEntity b : boards) {
                if (b.getCode().equals(code)) { // 매개 변수로 들어온 code와 b에 있는 code가 같으면
                    board = b; // board를 b로 초기화
                    break;
                }
            }
            // 위 코드 한 줄로
            // BoardEntity board = Arrays.stream(boards).filter(x -> x.getCode().equals(code)).findFirst().orElse(null);

            boolean allowed = board != null && (!board.isAdminWrite() || user.isAdmin());

            modelAndView.addObject("board", board);
            modelAndView.addObject("allowed", allowed);
            modelAndView.setViewName("/article/write");
        }
        return modelAndView;
    }

    @RequestMapping(value = "write",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postWrite(@SessionAttribute(value = "user") UserEntity user,
                            // 첨부파일에 대한 Param. 첨부파일이 없을 수도 있어서 required = false
                            @RequestParam(value = "fileIndexes", required = false) int[] fileIndexes,
                            ArticleEntity article) {
        if (fileIndexes == null) {
            fileIndexes = new int[0];
        }
        WriteResult result = this.articleService.write(article, fileIndexes, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == WriteResult.SUCCESS) {
            responseObject.put("index", article.getIndex());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "file",
            method = RequestMethod.GET)
    public ResponseEntity<byte[]> getFile(@RequestParam(value = "index") int index) {
        ResponseEntity<byte[]> response;
        FileEntity file = this.articleService.getFile(index);
        if (file == null) {
            response = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            /**
             * [공부] ContentDisposition : 파일 다운로드를 할 때 사용되어 웹 서버가 전송한 파일이 브라우저에서 어떻게 처리되어야 하는지를 지정
             * attachment() : 파일을 다운로드로 받음.
             * inline() : 파일이 다운로드되지 않고 웹으로 표시 해줌.
             * filename() : 다운로드 받은 파일 이름
             */
            ContentDisposition contentDisposition = ContentDisposition
                    .attachment()
                    .filename(file.getName(), StandardCharsets.UTF_8)
                    .build();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getType()));
            headers.setContentLength(file.getSize());
            headers.setContentDisposition(contentDisposition);
            response = new ResponseEntity<>(file.getData(), headers, HttpStatus.OK);
        }
        return response;
    }

    @RequestMapping(value = "file",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postFile(@SessionAttribute(value = "user") UserEntity user,
                           @RequestParam(value = "file") MultipartFile mulitpartFile) throws IOException {
        FileEntity file = new FileEntity(mulitpartFile);
        UploadFileResult result = this.articleService.uploadFile(file, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == UploadFileResult.SUCCESS) {
            responseObject.put("index", file.getIndex());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "image",
            method = RequestMethod.GET)
    public ResponseEntity<byte[]> getImage(@RequestParam(value = "index") int index) {
        ResponseEntity<byte[]> response;
        ImageEntity image = this.articleService.getImage(index);
        if (image == null) {
            response = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            // 이미지 데이터를 HTTP 응답으로 전송하는 부분
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(image.getType()));
            headers.setContentLength(image.getSize());
            response = new ResponseEntity<>(image.getData(), headers, HttpStatus.OK);
        }
        return response;
    }

    @RequestMapping(value = "image",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postImage(@SessionAttribute(value = "user") UserEntity user,
                            @RequestParam(value = "upload") MultipartFile file) throws IOException {
        ImageEntity image = new ImageEntity(file);
        UploadImageResult result = this.articleService.uploadImage(image, user);
        JSONObject responseObject = new JSONObject();
        if (result == UploadImageResult.SUCCESS) {
            responseObject.put("url", "/article/image?index=" + image.getIndex());
        } else {
            JSONObject messageObject = new JSONObject();
            messageObject.put("message", "이미지를 업로드하지 못하였습니다.");
            responseObject.put("error", messageObject);
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "read",
            method = RequestMethod.GET,
            produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getRead(@RequestParam(value = "index") int index,
                                @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                                @RequestAttribute(value = "boards") BoardEntity[] boards) {
        ModelAndView modelAndView = new ModelAndView();
        ArticleDto article = this.articleService.getArticleDto(index);
        if (article != null && !article.isDeleted()) {
            BoardEntity board = Arrays.stream(boards)
                    .filter(x -> x.getCode().equals(article.getBoardCode()))
                    .findFirst()
                    .orElse(null);
            // [공부] 부모 타입의 변수는 자식의 객체를 받을 수 있음.
            FileEntity[] files = this.articleService.getFilesOf(article);
            modelAndView.addObject("files", files);
            modelAndView.addObject("board", board);
            modelAndView.addObject("page", page);
        }
        modelAndView.addObject("article", article);
        modelAndView.setViewName("article/read");
        return modelAndView;
    }

    @RequestMapping(value = "read",
    method = RequestMethod.DELETE,
    produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteRead(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "index") int index) {
        DeleteResult result = this.articleService.delete(index, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "comment",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getComment(@RequestParam(value = "articleIndex") int articleIndex,
                             @SessionAttribute(value = "user", required = false) UserEntity user) {
        CommentDto[] comments = this.articleService.getCommentDtos(articleIndex, user == null ? null : user.getEmail());
        JSONArray responseArray = new JSONArray();
        // Date를 String으로 변환
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        for (CommentDto comment : comments) {
            JSONObject commentObject = new JSONObject();
            commentObject.put("index", comment.getIndex());
            commentObject.put("articleIndex", comment.getArticleIndex());
            commentObject.put("userEmail", comment.getUserEmail());
            commentObject.put("userNickname", comment.getUserNickname());
            commentObject.put("commentIndex", comment.getCommentIndex());
            if (comment.getModifiedAt() == null) {
                // 수정 안 했으면 최초 작성 일시
                commentObject.put("at", dateFormat.format(comment.getWrittenAt()));
                commentObject.put("isModified", false);
            } else {
                // 수정 했으면 수정 일시
                commentObject.put("at", dateFormat.format(comment.getModifiedAt()));
                commentObject.put("isModified", true);
            }
            // 댓글 자기가 쓴 건지 안 쓴건지
            commentObject.put("isMine", user != null && (user.getEmail().equals(comment.getUserEmail()) || user.isAdmin()));
            if (!comment.isDeleted()) {
                commentObject.put("content", comment.getContent());
                commentObject.put("likeCount", comment.getLikeCount());
                commentObject.put("dislikeCount", comment.getDislikeCount());
                commentObject.put("likeStatus", comment.getLikeStatus());
            }
            responseArray.put(commentObject);
        }
        return responseArray.toString();
    }

    @RequestMapping(value = "comment",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postComment(@SessionAttribute(value = "user") UserEntity user,
                              CommentEntity comment) {
        WriteCommentResult result = this.articleService.writeComment(comment, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "comment",
    method = RequestMethod.PUT,
    produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String putComment(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "commentIndex") int commentIndex,
                             @RequestParam(value = "status", required = false) Boolean status) {
        AlterCommentLikeResult result = this.articleService.alterCommentLike(commentIndex, status, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == AlterCommentLikeResult.SUCCESS) {
            CommentDto comment = this.articleService.getCommentDto(commentIndex, user.getEmail());
            responseObject.put("likeCount", comment.getLikeCount());
            responseObject.put("dislikeCount", comment.getDislikeCount());
            responseObject.put("likeStatus", comment.getLikeStatus());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "comment",
    method = RequestMethod.DELETE,
    produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteComment(@SessionAttribute(value = "user") UserEntity user,
                                @RequestParam(value = "index") int index) {
        DeleteCommentResult result = this.articleService.deleteComment(index, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "comment",
    method = RequestMethod.PATCH,
    produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchComment(@SessionAttribute(value = "user") UserEntity user,
                               CommentEntity comment) {
        ModifyCommentResult result = this.articleService.modifyComment(comment, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "modify",
    method = RequestMethod.GET,
    produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getModify(@SessionAttribute(value = "user") UserEntity user,
                                  @RequestAttribute(value = "boards") BoardEntity[] boards,
                                  @RequestParam(value = "index") int index) {
        ArticleDto article = this.articleService.getArticleDto(index);
        ModelAndView modelAndView = new ModelAndView();

        if(!article.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
            article = null;
        } else {
            String boardCode = article.getBoardCode();
            BoardEntity board = Arrays.stream(boards)
                    .filter(x -> x.getCode().equals(boardCode))
                    .findFirst()
                    .orElse(null);
            FileEntity[] files = this.articleService.getFilesOf(article);
            modelAndView.addObject("board", board);
            modelAndView.addObject("files", files);
        }
        modelAndView.setViewName("article/modify");
        modelAndView.addObject("article", article);
        return modelAndView;
    }

    @RequestMapping(value = "modify",
    method = RequestMethod.POST,
    produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postModify(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "fileIndexes", required = false) int[] fileIndexes,
                             ArticleEntity article) {
        if (fileIndexes == null) {
            fileIndexes = new int[0];
        }
        ModifyResult result = this.articleService.modify(article, fileIndexes, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }
}
