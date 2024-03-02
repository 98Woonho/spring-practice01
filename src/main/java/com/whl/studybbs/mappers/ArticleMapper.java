package com.whl.studybbs.mappers;

import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.dtos.CommentDto;
import com.whl.studybbs.entities.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleMapper {
    int deleteCommentLikeByPrimary(@Param(value = "userEmail") String userEmail,
                                   @Param(value = "commentIndex") int commentIndex);

    int deleteFileByIndex(@Param(value = "index") int index);

    int insertArticle(ArticleEntity article);

    int insertComment(CommentEntity comment);

    int insertCommentLike(CommentLikeEntity commentLike);

    int insertFile(FileEntity file);

    int insertImage(ImageEntity image);

    ArticleEntity selectArticleByIndex(@Param(value = "index") int index);

    ArticleDto selectArticleDtoByIndex(@Param(value = "index") int index);

    CommentDto selectCommentDtoByPrimary(@Param(value = "commentIndex") int commentIndex,
                                         @Param(value = "userEmail") String userEmail);

    CommentDto[] selectCommentDtosByArticleIndex(@Param(value = "articleIndex") int articleIndex,
                                                 @Param(value = "userEmail") String userEmail);

    CommentEntity selectCommentByIndex(@Param(value = "index") int index);

    CommentLikeEntity selectCommentLikeByPrimary(@Param(value = "userEmail") String userEmail,
                                                 @Param(value = "commentIndex") int commentIndex);

    FileEntity selectFileByIndex(@Param(value = "index") int index);

    FileEntity selectFileByIndexNoData(@Param(value = "index") int index);

    FileEntity[] selectFilesByArticleIndexNoData(@Param(value = "articleIndex") int articleIndex);

    ImageEntity selectImageByIndex(@Param(value = "index") int index);

    int updateArticle(ArticleEntity article);

    int updateComment(CommentEntity comment);

    int updateFileNoData(FileEntity file);
}
