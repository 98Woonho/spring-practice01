package com.whl.studybbs.entities;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Objects;

public class FileEntity {
    private int index;
    private String name;
    private String type;
    private int size;
    private byte[] data;
    // Integer인 이유 : NULL을 담아야 하는데 참조 변수만 NULL을 담을 수 있음.
    // Articles보다 Files의 insert가 먼저 되는데 Files가 insert 되는 시점에서는 게시글의 index를 몰라서 file이 insert되는 시점에는 articleIndex에 NULL이 들어가고 게시글이 작성 되었을 때 생성된 게시글의 index가 articleIndex에 들어가는 방식이기 때문에 NULL이 될 수 있어야 해서 Integer로 멤버변수를 만들어 주어야 함.
    private Integer articleIndex;
    private String userEmail;
    private Date createdAt;

    public FileEntity() {
        super();
    }

    public FileEntity(MultipartFile file) throws IOException {
        super();
        this.name = file.getOriginalFilename();
        this.type = file.getContentType();
        this.size = (int) file.getSize();
        this.data = file.getBytes();
    }

    public int getIndex() {
        return index;
    }

    public FileEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public String getName() {
        return name;
    }

    public FileEntity setName(String name) {
        this.name = name;
        return this;
    }

    public String getType() {
        return type;
    }

    public FileEntity setType(String type) {
        this.type = type;
        return this;
    }

    public int getSize() {
        return size;
    }

    public FileEntity setSize(int size) {
        this.size = size;
        return this;
    }

    public byte[] getData() {
        return data;
    }

    public FileEntity setData(byte[] data) {
        this.data = data;
        return this;
    }

    public Integer getArticleIndex() {
        return articleIndex;
    }

    public FileEntity setArticleIndex(Integer articleIndex) {
        this.articleIndex = articleIndex;
        return this;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public FileEntity setUserEmail(String userEmail) {
        this.userEmail = userEmail;
        return this;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public FileEntity setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FileEntity)) return false;
        FileEntity that = (FileEntity) o;
        return Objects.equals(getUserEmail(), that.getUserEmail());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUserEmail());
    }
}
