import React from "react";

export interface PostFile {
  url: string;
  name?: string;
}

interface PostFilesListProps {
  files: PostFile[];
}

const PostFilesList: React.FC<PostFilesListProps> = ({ files }) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="mb-3">
      {files.map((f, idx) => (
        <div key={f.url} className="flex items-center gap-2 text-sm">
          <a
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 break-all hover:underline"
          >
            {f.name || f.url}
          </a>
        </div>
      ))}
    </div>
  );
};

export default PostFilesList;
