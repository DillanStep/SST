import type { InventoryItem } from '../../types'

// Flatten all items for counting/searching
export function flattenInventory(items: InventoryItem[]): InventoryItem[] {
  const result: InventoryItem[] = []

  function addItem(item: InventoryItem) {
    result.push(item)

    if (item.attachments) {
      for (const attachment of item.attachments) {
        addItem(attachment)
      }
    }

    if (item.cargo) {
      for (const cargoItem of item.cargo) {
        addItem(cargoItem)
      }
    }
  }

  for (const item of items) {
    addItem(item)
  }

  return result
}
