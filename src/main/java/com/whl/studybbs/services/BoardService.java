package com.whl.studybbs.services;

import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.entities.BoardEntity;
import com.whl.studybbs.mappers.BoardMapper;
import com.whl.studybbs.vos.PageVo;
import com.whl.studybbs.vos.SearchVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private final BoardMapper boardMapper;

    @Autowired
    public BoardService(BoardMapper boardMapper) {
        this.boardMapper = boardMapper;
    }

    public ArticleDto[] getArticles(BoardEntity board, PageVo page) {
        return this.boardMapper.selectArticleDtosByPage(board, page, null);
    }

    public ArticleDto[] getArticles(BoardEntity board, PageVo page, SearchVo search) {
        return this.boardMapper.selectArticleDtosByPage(board, page, search);
    }

    public int getArticleCount(BoardEntity board) { // 검색 X
        return this.boardMapper.selectArticleCountByBoard(board);
    }

    public int getArticleCount(BoardEntity board, SearchVo search) { // 검색 중
        return this.boardMapper.selectArticleCountByBoardSearch(board, search);
    }

    public BoardEntity[] getBoards() {
        return this.boardMapper.selectBoards();
    }
}
