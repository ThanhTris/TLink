// Xây cây comment generic, giữ nguyên các field của phần tử đầu vào (T)
export function buildCommentTree<T extends { id: number; parent_id: number | null; level: number }>(
  flatComments: T[]
): (T & { replies: T[] })[] {
  const map = new Map<number, T & { replies: T[] }>();
  const roots: (T & { replies: T[] })[] = [];

  // Tạo map với replies rỗng và giữ nguyên các field khác
  flatComments.forEach((c) => map.set(c.id, { ...(c as T), replies: [] }));

  // Tìm cha cấp 3 gần nhất
  function findLevel3Parent(comment: T): (T & { replies: T[] }) | null {
    let cur: T = comment;
    while (cur.parent_id !== null) {
      const parent = map.get(cur.parent_id);
      if (!parent) break;
      if (parent.level === 3) return parent;
      cur = parent as unknown as T;
    }
    return null;
  }

  flatComments.forEach((c) => {
    const current = map.get(c.id)!;
    if (c.parent_id !== null) {
      const parent = map.get(c.parent_id);
      if (!parent) return;

      // Nếu cha là cấp 3 hoặc sâu hơn, ép về cha cấp 3 gần nhất
      if (parent.level >= 3) {
        const level3Parent = findLevel3Parent(c) || parent;
        if (level3Parent) {
          current.level = 3 as T["level"]; // giới hạn level = 3
          level3Parent.replies.push(current as T & { replies: T[] });
        }
      } else {
        parent.replies.push(current as T & { replies: T[] });
      }
    } else {
      roots.push(current as T & { replies: T[] });
    }
  });

  return roots;
}
  
