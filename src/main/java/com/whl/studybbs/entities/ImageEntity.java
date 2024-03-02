package com.whl.studybbs.entities;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Objects;

public class ImageEntity {
    private int index;
    private String name;
    private String type;
    private int size;
    private byte[] data;
    private String userEmail;
    private Date createdAt;

    public ImageEntity() {
        super();
    }

    public ImageEntity(MultipartFile file) throws IOException {
        super();
        this.name = file.getOriginalFilename();
        this.type = file.getContentType();
        this.size = (int) file.getSize();
        this.data = file.getBytes();
    }

    public int getIndex() {
        return index;
    }

    public ImageEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public String getName() {
        return name;
    }

    public ImageEntity setName(String name) {
        this.name = name;
        return this;
    }

    public String getType() {
        return type;
    }

    public ImageEntity setType(String type) {
        this.type = type;
        return this;
    }

    public int getSize() {
        return size;
    }

    public ImageEntity setSize(int size) {
        this.size = size;
        return this;
    }

    public byte[] getData() {
        return data;
    }

    public ImageEntity setData(byte[] data) {
        this.data = data;
        return this;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public ImageEntity setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public ImageEntity setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ImageEntity)) return false;
        ImageEntity that = (ImageEntity) o;
        return Objects.equals(getUserEmail(), that.getUserEmail());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUserEmail());
    }
}
