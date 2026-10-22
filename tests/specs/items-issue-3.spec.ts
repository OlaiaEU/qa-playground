import { expect } from '@playwright/test'
import { test } from '../src/fixtures'

const types = ['Electronics', 'Clothing', 'Home']
const allTypes = ['Electronics', 'Electronics', 'Clothing', 'Clothing', 'Home', 'Home']

test.describe('Issue 3: accessible item type labels', () => {
  test('type checkboxes have accessible names and preserve input names', async ({ itemsPage }) => {
    const filter = itemsPage.page.getByTestId('type-filter')

    for (const type of types) {
      const checkbox = filter.getByRole('checkbox', { name: type, exact: true })
      await expect(checkbox).toBeVisible()
      await expect(checkbox).not.toBeChecked()
      await expect(checkbox).toHaveAttribute('name', `include-${type.toLowerCase()}`)
    }
  })

  for (const type of types) {
    test(`clicking ${type} text toggles its checkbox and filters items`, async ({ itemsPage }) => {
      const page = itemsPage.page
      const filter = page.getByTestId('type-filter')
      const checkbox = filter.getByRole('checkbox', { name: type, exact: true })
      const text = filter.getByText(type, { exact: true })

      await text.click()
      await expect(checkbox).toBeChecked()
      await expect(page.getByTestId('item-card')).toHaveCount(2)
      await expect(page.getByTestId('item-type')).toHaveText([type, type])

      await text.click()
      await expect(checkbox).not.toBeChecked()
      await expect(page.getByTestId('item-card')).toHaveCount(6)
      await expect(page.getByTestId('item-type')).toHaveText(allTypes)
    })
  }

  test('selecting two types by text includes items from both', async ({ itemsPage }) => {
    const page = itemsPage.page
    const filter = page.getByTestId('type-filter')

    await filter.getByText('Electronics', { exact: true }).click()
    await filter.getByText('Home', { exact: true }).click()

    await expect(filter.getByRole('checkbox', { name: 'Electronics', exact: true })).toBeChecked()
    await expect(filter.getByRole('checkbox', { name: 'Home', exact: true })).toBeChecked()
    await expect(page.getByTestId('item-card')).toHaveCount(4)
    await expect(page.getByTestId('item-type')).toHaveText(['Electronics', 'Electronics', 'Home', 'Home'])
  })

  test('Space toggles the focused checkbox and filters items', async ({ itemsPage }) => {
    const page = itemsPage.page
    const checkbox = page.getByTestId('type-filter').getByRole('checkbox', { name: 'Clothing', exact: true })

    await checkbox.focus()
    await expect(checkbox).toBeFocused()
    await checkbox.press('Space')
    await expect(checkbox).toBeChecked()
    await expect(page.getByTestId('item-card')).toHaveCount(2)
    await expect(page.getByTestId('item-type')).toHaveText(['Clothing', 'Clothing'])

    await checkbox.press('Space')
    await expect(checkbox).not.toBeChecked()
    await expect(page.getByTestId('item-card')).toHaveCount(6)
    await expect(page.getByTestId('item-type')).toHaveText(allTypes)
  })

  test('reset clears a type selected by text and restores all items', async ({ itemsPage }) => {
    const page = itemsPage.page
    const filter = page.getByTestId('type-filter')

    await filter.getByText('Home', { exact: true }).click()
    await expect(filter.getByRole('checkbox', { name: 'Home', exact: true })).toBeChecked()
    await expect(page.getByTestId('item-type')).toHaveText(['Home', 'Home'])
    await page.getByTestId('reset-filters').click()

    for (const type of types) {
      await expect(filter.getByRole('checkbox', { name: type, exact: true })).not.toBeChecked()
    }
    await expect(page.getByTestId('item-card')).toHaveCount(6)
    await expect(page.getByTestId('item-type')).toHaveText(allTypes)
  })
})
