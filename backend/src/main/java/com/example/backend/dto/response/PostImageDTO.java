// Đây là DTO dùng cho Response (trả về dữ liệu ảnh cho client)
package com.example.backend.dto.response;

import java.io.Serializable;

public class PostImageDTO implements Serializable {
    private byte[] imageData;
    private String imageType;
    private String imageName;
   

    public PostImageDTO(byte[] imageData, String imageType, String imageName) {
        this.imageData = imageData;
        this.imageType = imageType;
        this.imageName = imageName;
    
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }


}
