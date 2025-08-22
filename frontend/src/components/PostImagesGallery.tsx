import React from "react";

export interface PostImage {
  url: string;
  name?: string;
}

interface PostImagesGalleryProps {
  images: PostImage[];
}

const PostImagesGallery: React.FC<PostImagesGalleryProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="flex justify-center mb-3">
        <a href={images[0].url} target="_blank" rel="noreferrer">
          <img
            src={images[0].url}
            alt={images[0].name || "img-0"}
            className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
            loading="lazy"
          />
        </a>
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="flex gap-2 mb-3 justify-evenly">
        {images.slice(0, 2).map((img, idx) => (
          <a key={img.url} href={img.url} target="_blank" rel="noreferrer" className="flex justify-center flex-1">
            <img
              src={img.url}
              alt={img.name || `img-${idx}`}
              className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </a>
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="flex flex-col items-center gap-2 mb-3">
        <div className="flex justify-center w-full">
          <a href={images[0].url} target="_blank" rel="noreferrer" className="flex justify-center flex-1">
            <img
              src={images[0].url}
              alt={images[0].name || "img-0"}
              className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </a>
        </div>
        <div className="flex w-full gap-2">
          <a href={images[1].url} target="_blank" rel="noreferrer" className="flex justify-center flex-1">
            <img
              src={images[1].url}
              alt={images[1].name || "img-1"}
              className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </a>
          <a href={images[2].url} target="_blank" rel="noreferrer" className="flex justify-center flex-1">
            <img
              src={images[2].url}
              alt={images[2].name || "img-2"}
              className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </a>
        </div>
      </div>
    );
  }

  // 4+ images
  return (
    <div className="relative grid grid-cols-2 grid-rows-2 gap-2 mb-3">
      {images.slice(0, 4).map((img, idx) => (
        <a
          key={img.url}
          href={img.url}
          target="_blank"
          rel="noreferrer"
          className="relative"
        >
          <img
            src={img.url}
            alt={img.name || `img-${idx}`}
            className="object-cover w-full border border-gray-300 rounded-lg max-h-90"
            loading="lazy"
            style={{ aspectRatio: "1/1", minHeight: 0 }}
          />
          {idx === 3 && images.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
              <span className="text-2xl font-bold text-white">
                +{images.length - 3}
              </span>
            </div>
          )}
        </a>
      ))}
    </div>
  );
};

export default PostImagesGallery;
