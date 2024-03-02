package com.whl.studybbs.dtos;

import com.whl.studybbs.entities.CommentEntity;

public class CommentDto extends CommentEntity {
    private String userNickname;
    private int likeCount;
    private int dislikeCount;
    private int likeStatus;

    public String getUserNickname() {
        return userNickname;
    }

    public CommentDto setUserNickname(String userNickname) {
        this.userNickname = userNickname;
        return this;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public CommentDto setLikeCount(int likeCount) {
        this.likeCount = likeCount;
        return this;
    }

    public int getDislikeCount() {
        return dislikeCount;
    }

    public CommentDto setDislikeCount(int dislikeCount) {
        this.dislikeCount = dislikeCount;
        return this;
    }

    public int getLikeStatus() {
        return likeStatus;
    }

    public CommentDto setLikeStatus(int likeStatus) {
        this.likeStatus = likeStatus;
        return this;
    }
}
