// Loại bỏ dấu tiếng Việt để hỗ trợ tìm kiếm không dấu
export const removeVietnameseDiacritics = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};