package com.whl.studybbs;

import com.whl.studybbs.entities.UserEntity;
import com.whl.studybbs.results.article.DeleteCommentResult;
import com.whl.studybbs.services.ArticleService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ArticleTest {
    @Autowired
    private ArticleService articleService;

    @Test
    void testDeleteComment() {
        final int index = 3;
        final UserEntity user = new UserEntity() {{
            setEmail("9woonho8@gmail.com");
        }};
        System.out.println("=== 테스트 시작 ===");
        System.out.println("=== 사전 정의 변수 ===");
        System.out.printf("   index : %d\nuser.email: %s\n", index, user.getEmail());
        System.out.println("=== 테스트 내용 ===");
        DeleteCommentResult result = this.articleService.deleteComment(index, user);
        System.out.printf("result : %s\n", result.name().toLowerCase());
        System.out.println("=== 테스트 결과 ===");
        Assertions.assertEquals(result, DeleteCommentResult.SUCCESS);
        System.out.println("=== 테스트 종료 ===");
    }
}
