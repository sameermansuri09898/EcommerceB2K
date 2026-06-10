export const addToWishlist = async (product, variant) => {

  try {
    const token = localStorage.getItem("access");

    const productId =
      typeof product === "object"
        ? product.id
        : product;

    const variantId =
      typeof variant === "object"
        ? variant.id
        : variant;

    const response = await fetch(
      "http://127.0.0.1:8000/api/add-to-wishlist/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
        }),
      }
    );

    const data = await response.json();

    console.log("Wishlist Status:", response.status);
    console.log("Wishlist Response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add to wishlist"
      );
    }

    return data;
  } catch (error) {
    console.error("Wishlist Error:", error);
    throw error;
  }
};
export const removeFromWishlist = async (
  product,
  variant
) => {
  try {
    const token = localStorage.getItem("access");

    const productId =
      typeof product === "object"
        ? product.id
        : product;

    const variantId =
      typeof variant === "object"
        ? variant.id
        : variant;

    const response = await fetch(
      "http://127.0.0.1:8000/api/remove-from-wishlist/",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "Remove Wishlist Status:",
      response.status
    );

    console.log(
      "Remove Wishlist Response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to remove from wishlist"
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Remove Wishlist Error:",
      error
    );

    throw error;
  }
};