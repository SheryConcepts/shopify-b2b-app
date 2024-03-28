export function showAndHideShopifyToast(message: string, duration: number) {
  const id = shopify.toast.show(message);
  setTimeout(() => {
    shopify.toast.hide(id);
  }, duration);
}
