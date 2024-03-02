package com.whl.studybbs.entities;

import java.util.Objects;

public class CommentLikeEntity {
    private String userEmail;
    private int commentIndex;
    private boolean isLike;

    public String getUserEmail() {
        return userEmail;
    }

    public CommentLikeEntity setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }

    public int getCommentIndex() {
        return commentIndex;
    }

    public CommentLikeEntity setCommentIndex(int commentIndex) {
        this.commentIndex = commentIndex;
        return this;
    }

    public boolean isLike() {
        return isLike;
    }

    public CommentLikeEntity setLike(boolean like) {
        this.isLike = like;
        return this;
    }

    // PK 기준으로 equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CommentLikeEntity that = (CommentLikeEntity) o;
        return commentIndex == that.commentIndex && Objects.equals(userEmail, that.userEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userEmail, commentIndex);
    }
}
