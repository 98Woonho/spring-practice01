// Entity를 상속받는 패키지 : dtos
package com.whl.studybbs.dtos;

import com.whl.studybbs.entities.ArticleEntity;

public class ArticleDto extends ArticleEntity {
    private String userNickname;

    public String getUserNickname() {
        return userNickname;
    }

    public ArticleDto setUserNickname(String userNickname) {
        this.userNickname = userNickname;
        return this;
    }
}
