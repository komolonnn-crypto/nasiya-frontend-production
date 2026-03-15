
import "./Uploader.css";

import type { ImageListType } from "react-images-uploading";

import React, { useState, useEffect } from "react";
import ImageUploading from "react-images-uploading";
import { MdImageNotSupported } from "react-icons/md";
import { RiImageAddLine, RiDeleteBin6Line } from "react-icons/ri";

import { Box, CircularProgress } from "@mui/material";

import { ImageUrl } from "@/utils/image-url"

import authApi from "@/server/auth"

interface UploadedImage {
  file?: File;
  data_url: string;
  isUploading?: boolean;
}

interface Iprops {
  count: number;
  defaultImages: string[] | [];
  onUploadComplete?: (urls: string[]) => void;
}

const Uploader: React.FC<Iprops> = ({
  count,
  defaultImages,
  onUploadComplete,
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [indexImage, setIndexImage] = useState(0);
  const urlImage: string = import.meta.env['VITE_SERVER_URL'];

  useEffect(() => {
    if (defaultImages.length > 0) {
      const initialImages = defaultImages.map((url) => ({
        data_url: url,
      }));
      setImages(initialImages);
      setIndexImage(defaultImages.length);
    }
  }, [defaultImages]);

  const onChange = async (imageList: ImageListType) => {
    if (imageList.length === 0) return;
    setIsUploading(true);
    try {
      const selectedImage = imageList[indexImage];

      if (selectedImage?.file) {
        const formData = new FormData();
        formData.append("file", selectedImage.file);

        const response = await authApi.post<{ url: string }>(
          `${urlImage}/api/upload/images`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const uploadedImage = { data_url: response.data.url };

        setImages((prev) => {
          const updatedImages = [...prev, uploadedImage];
          const imageUrls = updatedImages.map((img) => img.data_url);

          onUploadComplete && onUploadComplete(imageUrls);
          return updatedImages;
        });

        setIndexImage((prevIndex) => prevIndex + 1);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onImageRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUploadComplete &&
      onUploadComplete(updatedImages.map((img) => img.data_url));
  };

  return (
    <div>
      {isUploading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <CircularProgress size={50} />
        </Box>
      ) : (
        <ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={count}
          dataURLKey="data_url"
        >
          {({ imageList, onImageUpload, isDragging, dragProps }) => (
            <div className="upload__image-wrapper">
              {imageList.length === 0 ? (
                <div
                  {...dragProps}
                  onClick={onImageUpload}
                  className="upload__image-drag-image"
                  style={isDragging ? { color: "var(--palette-primary-main)" } : {}}
                >
                  <MdImageNotSupported size={100} />
                </div>
              ) : (
                <>
                  <div className="upload__image-grid">
                    {imageList.map((image, index) => (
                      <div key={index} className="upload__image-item">
                        <img
                          src={ImageUrl(image['data_url'])}
                          alt={`Uploaded ${index}`}
                        />
                        <button
                          type="button"
                          onClick={() => onImageRemove(index)}
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    ))}
                  </div>

                  {imageList.length < count && (
                    <button
                      type="button"
                      className={`upload__add-button ${
                        isDragging ? "dragging" : ""
                      }`}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      <RiImageAddLine />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </ImageUploading>
      )}
    </div>
  );
};

export default Uploader;
