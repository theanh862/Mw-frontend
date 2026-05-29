import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, sku = null, quantity = 1) => {
        const currentItems = get().items
        const cartItemId = sku ? `${product.id}-${sku.id}` : String(product.id)
        const existingItem = currentItems.find((item) => item.id === cartItemId)
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          const newItem = {
            id: cartItemId,
            productId: product.id,
            skuId: sku ? sku.id : null,
            skuCode: sku ? sku.sku : null,
            skuName: sku ? sku.name : null,
            skuName_en: sku ? (sku.name_en || sku.name) : null,
            name: sku ? `${product.name} (${sku.name})` : product.name,
            name_en: sku
              ? `${product.name_en || product.name} (${sku.name_en || sku.name})`
              : (product.name_en || product.name),
            price: sku ? Number(sku.price) : Number(product.price),
            originalPrice: sku ? Number(sku.original_price || sku.price) : Number(product.originalPrice || product.price),
            image: (sku && sku.image) ? sku.image : product.image,
            quantity: quantity,
          }
          set({ items: [...currentItems, newItem] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
