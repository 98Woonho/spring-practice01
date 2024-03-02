package com.whl.studybbs.entities;

import java.util.Date;
import java.util.Objects;

public class CommentEntity {
    private int index;
    private int articleIndex;
    private String userEmail;
    private Integer commentIndex;
    private String content;
    private Date writtenAt;
    private Date modifiedAt;
    private boolean isDeleted;

    public int getIndex() {
        return index;
    }

    public CommentEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public int getArticleIndex() {
        return articleIndex;
    }

    public CommentEntity setArticleIndex(int articleIndex) {
        this.articleIndex = articleIndex;
        return this;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public CommentEntity setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }

    public Integer getCommentIndex() {
        return commentIndex;
    }

    public CommentEntity setCommentIndex(Integer commentIndex) {
        this.commentIndex = commentIndex;
        return this;
    }

    public String getContent() {
        return content;
    }

    public CommentEntity setContent(String content) {
        this.content = content;
        return this;
    }

    public Date getWrittenAt() {
        return writtenAt;
    }

    public CommentEntity setWrittenAt(Date writtenAt) {
        this.writtenAt = writtenAt;
        return this;
    }

    public Date getModifiedAt() {
        return modifiedAt;
    }

    public CommentEntity setModifiedAt(Date modifiedAt) {
        this.modifiedAt = modifiedAt;
        return this;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public CommentEntity setDeleted(boolean deleted) {
        isDeleted = deleted;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommentEntity)) return false;
        CommentEntity that = (CommentEntity) o;
        return getIndex() == that.getIndex();
    }

    @Override
    public int hashCode() {
        return Objects.hash(getIndex());
    }
}
