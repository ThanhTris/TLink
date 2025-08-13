// Parse chuỗi MySQL "YYYY-MM-DD HH:mm:ss[.SSSSSS]" thành Date (mặc định VN, UTC+7)
export function parseMySQLDateVN(input: string | Date): Date {
  if (input instanceof Date) return input;
  // Lấy tới giây, đổi space -> 'T', gắn timezone +07:00
  const base = input.slice(0, 19).replace(' ', 'T'); // "2025-08-12T20:33:07"
  return new Date(`${base}+07:00`);
}

// Hiển thị đúng chuẩn VN: dd/MM/yyyy HH:mm:ss
export function formatDateTimeVN(input: string | Date): string {
  const d = parseMySQLDateVN(input);
  if (isNaN(d.getTime())) return 'Thời gian không hợp lệ';
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// "Bao lâu trước" theo ngưỡng bạn yêu cầu
export function getTimeAgoStrict(input: string | Date): string {
  const date = parseMySQLDateVN(input);
  if (isNaN(date.getTime())) return 'Thời gian không hợp lệ';

  const now = new Date(); // thời điểm hiện tại (epoch)
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 0) return 'Trong tương lai';
  if (diffSec < 10) return 'vừa xong';
  if (diffSec < 60) return `${diffSec} giây trước`;

  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} phút trước`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} tuần trước`;

  // > 1 month => trả ngày chắc chắn (dd/MM/yyyy)
  // Nếu bạn muốn kèm giờ thì gọi formatDateTimeVN thay vì toLocaleDateString
  return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

// BACKWARD COMPATIBILITY EXPORTS
// Re-export với tên cũ để các component cũ không bị lỗi
export const getTimeAgo = getTimeAgoStrict;

// Function to get both display text and tooltip for UI components
export function getTimeDisplay(dateString: string | Date): { display: string; tooltip: string } {
  return {
    display: getTimeAgoStrict(dateString),
    tooltip: formatDateTimeVN(dateString)
  };
}

// Smart formatting function for backward compatibility
export function formatDateSmart(dateString: string | Date): string {
  return getTimeAgoStrict(dateString);
}


