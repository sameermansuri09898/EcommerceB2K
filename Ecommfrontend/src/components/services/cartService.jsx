export const addToCart = async (product, variant) => {
  try {
    const token = localStorage.getItem("access");

    const productId =
      typeof product === "object" ? product.id : product;

    const variantId =
      typeof variant === "object" ? variant.id : variant;

    const response = await fetch(
      "http://127.0.0.1:8000/api/addcart/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_item: productId,
          product_varient: variantId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add to cart");
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};