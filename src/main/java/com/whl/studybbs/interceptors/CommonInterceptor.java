package com.whl.studybbs.interceptors;

import com.whl.studybbs.entities.BoardEntity;
import com.whl.studybbs.services.BoardService;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CommonInterceptor implements HandlerInterceptor {
    @Resource
    private BoardService boardService;

    @Override
    // controller로 요청이 가기 전
    // true = controller로 요청 가는 것을 허용
    // false = controller로 요청 가는 것을 거부
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 만약 HTTP 요청 메서드가 GET이나 POST가 아닌 경우에는 항상 true를 반환.
        if (!request.getMethod().equalsIgnoreCase("GET") && !request.getMethod().equalsIgnoreCase("POST")) {
            return true;
        }
        // HTTP 요청 메서드가 GET이나 POST인 경우, boardService.getBoards()로 `study_bbs`.`boards`에서 board 배열을 얻어와서 boards 배열에 저장.
        BoardEntity[] boards = this.boardService.getBoards();
        request.setAttribute("boards", boards); // HSR에 set 해줘서 @RequestAttribute로 controller에서 사용 가능. 또는 HTML에서 th:each로 바로 사용 가능
        return true;
    }
}
