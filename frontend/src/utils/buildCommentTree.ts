import type { Comment } from "../types/comment";

export function buildCommentTree(
  flatComments: Comment[]
): (Comment & { replies: Comment[] })[] {
  const map = new Map<number, Comment & { replies: Comment[] }>();
  const roots: (Comment & { replies: Comment[] })[] = [];

  // Tạo map với replies rỗng
  flatComments.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  // Tìm cha cấp 3 gần nhất
  function findLevel3Parent(
    comment: Comment
  ): (Comment & { replies: Comment[] }) | null {
    let cur = comment;
    while (cur.parent_id !== null) {
      const parent = map.get(cur.parent_id);
      if (!parent) break;
      if (parent.level === 3) return parent;
      cur = parent;
    }
    return null;
  }

  flatComments.forEach((c) => {
    if (c.parent_id !== null) {
      const parent = map.get(c.parent_id);
      if (!parent) return;
      // Nếu cha là cấp 3 hoặc sâu hơn, ép về cha cấp 3 gần nhất
      if (parent.level >= 3) {
        const level3Parent = findLevel3Parent(c) || parent;
        if (level3Parent) {
          const obj = map.get(c.id)!;
          obj.level = 3; // Ép level về 3
          level3Parent.replies.push(obj);
        }
      } else {
        parent.replies.push(map.get(c.id)!);
      }
    } else {
      roots.push(map.get(c.id)!);
    }
  });

  // Đảm bảo replies của cấp 3 không lồng tiếp cấp 3 khác
  function removeNestedLevel3(comments: (Comment & { replies: Comment[] })[]) {
    comments.forEach((c) => {
      if (c.level === 3) {
        c.replies = [];
      } else {
        removeNestedLevel3(c.replies as (Comment & { replies: Comment[] })[]);
      }
    });
  }

  return roots;
}
