
package com.example.backend.dto.response;

import java.io.Serializable;

public class PostFileDTO implements Serializable {
    private byte[] fileData;
    private String fileType;
    private String fileName;
    private long fileSize;

    public PostFileDTO(byte[] fileData, String fileType, String fileName, long fileSize) {
        this.fileData = fileData;
        this.fileType = fileType;
        this.fileName = fileName;
        this.fileSize = fileSize;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }
}
