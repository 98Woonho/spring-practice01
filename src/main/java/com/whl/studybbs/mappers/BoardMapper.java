package com.whl.studybbs.mappers;

import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.entities.BoardEntity;
import com.whl.studybbs.vos.PageVo;
import com.whl.studybbs.vos.SearchVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardMapper {
    ArticleDto[] selectArticleDtosByPage(@Param(value = "board") BoardEntity board,
                                         @Param(value = "page") PageVo page,
                                         @Param(value = "search") SearchVo search);

    int selectArticleCountByBoard(BoardEntity board);

    int selectArticleCountByBoardSearch(@Param(value = "board") BoardEntity board,
                                        @Param(value = "search") SearchVo search);

    BoardEntity selectBoardByCode(@Param(value = "code") String code);

    BoardEntity[] selectBoards();
}
