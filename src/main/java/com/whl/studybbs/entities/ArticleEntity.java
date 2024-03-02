package com.whl.studybbs.entities;

import java.util.Date;
import java.util.Objects;

public class ArticleEntity {
    private int index;
    private String boardCode;
    private String userEmail;
    private String title;
    private String content;
    private int view;
    private Date writtenAt;
    private Date modifiedAt;
    private boolean isDeleted;

    public int getIndex() {
        return index;
    }

    public ArticleEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public String getBoardCode() {
        return boardCode;
    }

    public ArticleEntity setBoardCode(String boardCode) {
        this.boardCode = boardCode;
        return this;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public ArticleEntity setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public ArticleEntity setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getContent() {
        return content;
    }

    public ArticleEntity setContent(String content) {
        this.content = content;
        return this;
    }

    public int getView() {
        return view;
    }

    public ArticleEntity setView(int view) {
        this.view = view;
        return this;
    }

    public Date getWrittenAt() {
        return writtenAt;
    }

    public ArticleEntity setWrittenAt(Date writtenAt) {
        this.writtenAt = writtenAt;
        return this;
    }

    public Date getModifiedAt() {
        return modifiedAt;
    }

    public ArticleEntity setModifiedAt(Date modifiedAt) {
        this.modifiedAt = modifiedAt;
        return this;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public ArticleEntity setDeleted(boolean deleted) {
        isDeleted = deleted;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ArticleEntity)) return false;
        ArticleEntity that = (ArticleEntity) o;
        return getIndex() == that.getIndex();
    }

    @Override
    public int hashCode() {
        return Objects.hash(getIndex());
    }
}
