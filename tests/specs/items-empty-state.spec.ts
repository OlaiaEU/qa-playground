import { expect } from '@playwright/test'
import { test } from '../src/fixtures'
import { FilterOptions, ItemsFilters } from '../src/pages/items/types'

const emptyFilters: FilterOptions[] = [
  { type: ItemsFilters.MIN_PRICE, value: 300 },
  { type: ItemsFilters.TYPE, value: ['Home'] },
]
const emptyMessage = 'No items match the current filters.'

test.describe('Items empty state', () => {
  test('Status region is mounted and empty by default', async ({ itemsPage, page }) => {
    await expect(itemsPage.locators.itemCard()).not.toHaveCount(0)
    await expect(page.getByRole('status')).toHaveCount(1)
    await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    await expect(page.getByRole('status')).toBeEmpty()
    await expect(page.getByRole('button', { name: 'Reset all filters', exact: true })).toHaveCount(0)
  })

  test('Empty filters show a message and named reset button', async ({ itemsPage, page }) => {
    await itemsPage.filter(emptyFilters)
    await expect(itemsPage.locators.itemCard()).toHaveCount(0)
    const status = page.getByRole('status')
    await expect(status.getByText(emptyMessage, { exact: true })).toBeVisible()
    await expect(status.getByRole('button', { name: 'Reset all filters', exact: true })).toBeVisible()
  })

  for (const activation of ['pointer', 'Enter', 'Space']) {
    test(`${activation} reset restores items, defaults and filter focus`, async ({ itemsPage, page }) => {
      const before = await itemsPage.getItems()
      await itemsPage.filter(emptyFilters)
      const button = page.getByRole('button', { name: 'Reset all filters', exact: true })
      if (activation === 'pointer') {
        await button.click()
      } else {
        await button.focus()
        await page.keyboard.press(activation)
      }
      await expect(itemsPage.locators.itemCard()).toHaveCount(before.length)
      await itemsPage.validateFilterDefaultState()
      expect(await itemsPage.getItems()).toEqual(before)
      await expect(button).toHaveCount(0)
      await expect(page.getByRole('status')).toBeEmpty()
      await expect(itemsPage.locators.onlyDiscountCheckboxFilter()).toBeFocused()
    })
  }

  test('Discount and Home filters show an empty state and can be reset', async ({ itemsPage, page }) => {
    const before = await itemsPage.getItems()
    await itemsPage.filter([
      { type: ItemsFilters.ONLY_DISCOUNT, value: true },
      { type: ItemsFilters.TYPE, value: ['Home'] },
    ])
    await expect(itemsPage.locators.itemCard()).toHaveCount(0)
    await expect(page.getByRole('status').getByText(emptyMessage, { exact: true })).toBeVisible()
    const button = page.getByRole('button', { name: 'Reset all filters', exact: true })
    await button.click()
    await expect(itemsPage.locators.itemCard()).toHaveCount(before.length)
    await itemsPage.validateFilterDefaultState()
    expect(await itemsPage.getItems()).toEqual(before)
    await expect(button).toHaveCount(0)
    await expect(page.getByRole('status')).toBeEmpty()
  })

  test('Sidebar reset still restores items from the empty state', async ({ itemsPage, page }) => {
    const before = await itemsPage.getItems()
    await itemsPage.filter(emptyFilters)
    await expect(page.getByRole('status').getByText(emptyMessage, { exact: true })).toBeVisible()
    await itemsPage.locators.resetFiltersButton().click()
    await expect(itemsPage.locators.itemCard()).toHaveCount(before.length)
    await itemsPage.validateFilterDefaultState()
    expect(await itemsPage.getItems()).toEqual(before)
    await expect(page.getByRole('button', { name: 'Reset all filters', exact: true })).toHaveCount(0)
    await expect(page.getByRole('status')).toBeEmpty()
  })
})
