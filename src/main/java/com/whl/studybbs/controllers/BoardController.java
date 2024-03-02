package com.whl.studybbs.controllers;

import com.whl.studybbs.dtos.ArticleDto;
import com.whl.studybbs.entities.BoardEntity;
import com.whl.studybbs.services.BoardService;
import com.whl.studybbs.vos.PageVo;
import com.whl.studybbs.vos.SearchVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;

@Controller
@RequestMapping(value = "board")
public class BoardController {
    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @RequestMapping(value = "list",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ModelAndView getList(@RequestAttribute(value = "boards") BoardEntity[] boards,
                                @RequestParam(value = "code") String code,
                                @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                                SearchVo search) {
        ModelAndView modelAndView = new ModelAndView();
        BoardEntity board = Arrays.stream(boards).filter(x -> x.getCode().equals(code)).findFirst().orElse(null);
        if (board != null) {
            search.setBoardCode(code);
            // 검색을 제출하면 HTML에서 전송된 code와 criterion, keyword가 search에 저장이 됨. 그래서 현재 페이지가 검색중인 페이지인지 아닌지 boolean 형식으로 초기화 해줌.
            final boolean searching = search.getCriterion() != null && search.getKeyword() != null; // 검색 중인지 아닌지
            final int countPerPage = 20;
            final int pageButtonCount = 10;
            int totalCount = searching
                    ? this.boardService.getArticleCount(board, search)
                    : this.boardService.getArticleCount(board);
            PageVo pageVo = new PageVo(page, countPerPage, pageButtonCount, totalCount);
            System.out.println(pageVo.queryOffset);
            System.out.println(pageVo.countPerPage);
            ArticleDto[] articles = searching
                    ? this.boardService.getArticles(board, pageVo, search)
                    : this.boardService.getArticles(board, pageVo);
            modelAndView.addObject("articles", articles);
            modelAndView.addObject("page", pageVo);
            modelAndView.addObject("searching", searching);
            modelAndView.addObject("search", search);
        }
        modelAndView.addObject("board", board);
        modelAndView.setViewName("board/list");
        return modelAndView;
    }
}
