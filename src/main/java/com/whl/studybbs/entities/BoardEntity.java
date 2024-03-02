package com.whl.studybbs.entities;

import java.util.Objects;

public class BoardEntity {
    private String code;
    private String text;
    private int order;
    private boolean isAdminWrite;

    public String getCode() {
        return code;
    }

    public BoardEntity setCode(String code) {
        this.code = code;
        return this;
    }

    public String getText() {
        return text;
    }

    public BoardEntity setText(String text) {
        this.text = text;
        return this;
    }

    public int getOrder() {
        return order;
    }

    public BoardEntity setOrder(int order) {
        this.order = order;
        return this;
    }

    public boolean isAdminWrite() {
        return isAdminWrite;
    }

    public BoardEntity setAdminWrite(boolean adminWrite) {
        isAdminWrite = adminWrite;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BoardEntity that = (BoardEntity) o;
        return Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code);
    }
}

