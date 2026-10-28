// The photo that represents an item in lists and cards:
// an admin-set imageUrl wins, otherwise the first product-page gallery photo.
export const primaryPhoto = (item) => item?.imageUrl || item?.gallery?.[0]?.src || '';
