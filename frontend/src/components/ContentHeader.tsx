import React from "react";
import Button from "./Button";
import { Plus } from "lucide-react";

interface ContentHeaderProps {
  title: string;
  onCreate?: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, onCreate }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-4xl font-semibold">{`Bài viết về ${title}`}</h2>
      <Button
        className="bg-blue-500 text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-blue-600 transition text-lg cursor-pointer"
        onClick={onCreate}
      >
        <Plus size={20} />
        Tạo bài viết mới
      </Button>
    </div>
  );
};

export default ContentHeader;