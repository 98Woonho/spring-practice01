package com.whl.studybbs.services;

import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.dtos.CommentDto;
import com.whl.studybbs.entities.*;
import com.whl.studybbs.mappers.ArticleMapper;
import com.whl.studybbs.mappers.BoardMapper;
import com.whl.studybbs.regexes.ArticleRegex;
import com.whl.studybbs.regexes.CommentRegex;
import com.whl.studybbs.results.article.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;

@Service
public class ArticleService {
    private final ArticleMapper articleMapper;
    private final BoardMapper boardMapper;

    @Autowired
    public ArticleService(ArticleMapper articleMapper, BoardMapper boardMapper) {
        this.articleMapper = articleMapper;
        this.boardMapper = boardMapper;
    }

    /**
     * 게시글을 작성하기 위한 메서드
     *
     * @param article 게시글 정보를 담을 객체
     * @param user    게시글을 작성할 사용자 정보
     * @return 게시글 작성 성공 or 실패 여부 반환
     */
    public WriteResult write(ArticleEntity article, int[] fileIndexes, UserEntity user) {
        if (!ArticleRegex.TITLE.matches(article.getTitle())) {
            return WriteResult.FAILURE;
        }
        BoardEntity board = this.boardMapper.selectBoardByCode(article.getBoardCode());
        if (board == null) {
            return WriteResult.FAILURE;
        }
        if (board.isAdminWrite() && !user.isAdmin()) {
            return WriteResult.FAILURE;
        }
        article.setUserEmail(user.getEmail()).setView(0).setWrittenAt(new Date()).setModifiedAt(null).setDeleted(false);

        int articleInsertResult = this.articleMapper.insertArticle(article);
        if (articleInsertResult == 0) {
            return WriteResult.FAILURE;
        }
        for (int fileIndex : fileIndexes) {
            FileEntity file = this.articleMapper.selectFileByIndexNoData(fileIndex);
            if (file == null) {
                continue;
            }
            // 어느 게시글의 첨부파일인지 알기 위해 file의 ArticleIndex에 게시글의 index를 set
            file.setArticleIndex(article.getIndex());
            this.articleMapper.updateFileNoData(file);
        }
        return WriteResult.SUCCESS;
    }

    public ImageEntity getImage(int index) {
        return this.articleMapper.selectImageByIndex(index);
    }

    public UploadFileResult uploadFile(FileEntity file, UserEntity user) {
        file.setUserEmail(user.getEmail()).setCreatedAt(new Date());

        return this.articleMapper.insertFile(file) > 0 ? UploadFileResult.SUCCESS : UploadFileResult.FAILURE;
    }

    public UploadImageResult uploadImage(ImageEntity image, UserEntity user) {
        image.setUserEmail(user.getEmail()).setCreatedAt(new Date());

        return this.articleMapper.insertImage(image) > 0 ? UploadImageResult.SUCCESS : UploadImageResult.FAILURE;
    }

    public FileEntity getFile(int index) {
        return this.articleMapper.selectFileByIndex(index);
    }

    public ArticleDto getArticleDto(int index) {
        ArticleDto article = this.articleMapper.selectArticleDtoByIndex(index);
        if (article != null) {
            article.setView(article.getView() + 1);
            this.articleMapper.updateArticle(article);
        }
        return article;
    }

    public FileEntity[] getFilesOf(ArticleEntity article) {
        return this.articleMapper.selectFilesByArticleIndexNoData(article.getIndex());
    }

    public WriteCommentResult writeComment(CommentEntity comment, UserEntity user) {
        if (!CommentRegex.CONTENT.matches(comment.getContent())) {
            return WriteCommentResult.FAILURE;
        }
        comment.setUserEmail(user.getEmail())
                .setWrittenAt(new Date())
                .setModifiedAt(null)
                .setDeleted(false);

        return this.articleMapper.insertComment(comment) > 0
                ? WriteCommentResult.SUCCESS
                : WriteCommentResult.FAILURE;
    }

    public CommentDto getCommentDto(int commentIndex, String userEmail) {
        return this.articleMapper.selectCommentDtoByPrimary(commentIndex, userEmail);
    }

    public CommentDto[] getCommentDtos(int articleIndex, String userEmail) {
        return this.articleMapper.selectCommentDtosByArticleIndex(articleIndex, userEmail);
    }

    public AlterCommentLikeResult alterCommentLike(int commentIndex, Boolean status, UserEntity user) {
        // commentIndex & user.email로 가져온 CommentLikeEntity가 없고(null 이고),
        // status 가 true라면 좋아요로 INSERT,
        // status 가 false 라면, 싫어요로 INSERT,
        // status 가 null 이라면, 논리적 오류

        // commentIndex & user.email로 가져온 CommentLikeEntity가 있고(null이 아니고),
        // status 가 true라면 좋아요로 수정,
        // status 가 false 라면, 싫어요로 수정,
        // status 가 null 이라면, DELETE
        CommentLikeEntity commentLike = this.articleMapper.selectCommentLikeByPrimary(user.getEmail(), commentIndex);
        if (commentLike == null) {
            commentLike = new CommentLikeEntity()
                    .setUserEmail(user.getEmail())
                    .setCommentIndex(commentIndex)
                    .setLike(status);
        } else {
            if (status == null) {
                return this.articleMapper.deleteCommentLikeByPrimary(user.getEmail(), commentIndex) > 0
                        ? AlterCommentLikeResult.SUCCESS
                        : AlterCommentLikeResult.FAILURE;
            }
            commentLike.setLike(status);
        }
        return this.articleMapper.insertCommentLike(commentLike) > 0
                ? AlterCommentLikeResult.SUCCESS
                : AlterCommentLikeResult.FAILURE;
    }

    public DeleteCommentResult deleteComment(int index, UserEntity user) {
        CommentEntity comment = this.articleMapper.selectCommentByIndex(index);
        if (!user.getEmail().equals(comment.getUserEmail()) && !user.isAdmin()) {
            return DeleteCommentResult.FAILURE;
        }
        comment.setDeleted(true);
        return this.articleMapper.updateComment(comment) > 0
                ? DeleteCommentResult.SUCCESS
                : DeleteCommentResult.FAILURE;
    }

    public ModifyCommentResult modifyComment(CommentEntity comment, UserEntity user) {
        if (!CommentRegex.CONTENT.matches(comment.getContent())) {
            return ModifyCommentResult.FAILURE;
        }
        CommentEntity dbComment = this.articleMapper.selectCommentByIndex(comment.getIndex());
        if (dbComment == null || dbComment.isDeleted()) {
            return ModifyCommentResult.FAILURE;
        }
        if (!dbComment.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
            return ModifyCommentResult.FAILURE;
        }
        dbComment.setContent(comment.getContent());
        dbComment.setModifiedAt(new Date());

        return this.articleMapper.updateComment(dbComment) > 0
                ? ModifyCommentResult.SUCCESS
                : ModifyCommentResult.FAILURE;
    }

    public DeleteResult delete(int index, UserEntity user) {
        ArticleEntity article = this.articleMapper.selectArticleByIndex(index);
        if (article == null) {
            return DeleteResult.FAILURE;
        }
        if (!article.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
            return DeleteResult.FAILURE;
        }
        article.setDeleted(true);
        return this.articleMapper.updateArticle(article) > 0
                ? DeleteResult.SUCCESS
                : DeleteResult.FAILURE;
    }

    public ModifyResult modify(ArticleEntity article, int[] fileIndexes, UserEntity user) {
        if (!ArticleRegex.TITLE.matches(article.getTitle())) {
            return ModifyResult.FAILURE;
        }
        ArticleEntity dbArticle = this.articleMapper.selectArticleByIndex(article.getIndex());
        if (dbArticle == null) {
            return ModifyResult.FAILURE;
        }
        if (!dbArticle.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
            return ModifyResult.FAILURE;
        }

        FileEntity[] originalFiles = this.getFilesOf(article);

        // 기존 파일 삭제
        for (FileEntity originalFile : originalFiles) {
            // 수정 할려는 게시글의 파일 인덱스 배열(fileIndexes)에서 원래 게시글의 파일목록 중 하나의 인덱스를 비교 했는데 아무것도 없을 때 == 파일을 삭제 했을 때
            if (Arrays.stream(fileIndexes).noneMatch(x -> x == originalFile.getIndex())) {
                this.articleMapper.deleteFileByIndex(originalFile.getIndex());
            }
        }

        // 새로운 파일 업로드
        for (int fileIndex : fileIndexes) {
            if (Arrays.stream(originalFiles).noneMatch(x -> x.getIndex() == fileIndex)) {
                FileEntity dbFile = this.articleMapper.selectFileByIndexNoData(fileIndex);
                dbFile.setArticleIndex(dbArticle.getIndex());
                this.articleMapper.updateFileNoData(dbFile);
            }
        }
        dbArticle.setTitle(article.getTitle())
                .setContent(article.getContent())
                .setModifiedAt(new Date());
        return this.articleMapper.updateArticle(dbArticle) > 0
                ? ModifyResult.SUCCESS
                : ModifyResult.FAILURE;
    }
}
