package com.whl.studybbs.vos;

import org.springframework.remoting.RemoteTimeoutException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SearchVo {
    public static final List<String> validCriteria;

    static {
        List<String> criteria = new ArrayList<>() {{
            add("content");
            add("title");
            add("nickname");
        }};
        validCriteria = Collections.unmodifiableList(criteria); // 더 이상 수정 불가능한 리스트가 됨.
    }

    private String boardCode;
    private String criterion;
    private String keyword;

    public String getBoardCode() {
        return boardCode;
    }

    public SearchVo setBoardCode(String boardCode) {
        this.boardCode = boardCode;
        return this;
    }

    public String getCriterion() {
        return criterion;
    }

    public SearchVo setCriterion(String criterion) {
        if (SearchVo.validCriteria.stream().noneMatch(x -> x.equals(criterion))) {
            // criterion = SearchVo.validCriteria.get(0);
            throw new RuntimeException("올바르지 않은 값 : " + criterion);
        }
        this.criterion = criterion;
        return this;
    }

    public String getKeyword() {
        return keyword;
    }

    public SearchVo setKeyword(String keyword) {
        this.keyword = keyword;
        return this;
    }
}
