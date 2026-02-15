import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from '@/app/components/ui/Select'
import '@testing-library/jest-dom'
import React from 'react'

describe('Select Component', () => {
    it('renders select with options', () => {
        render(
            <Select>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </Select>
        )
        const select = screen.getByRole('combobox')
        expect(select).toBeInTheDocument()
        expect(screen.getAllByRole('option')).toHaveLength(2)
    })

    it('handles interactions', () => {
        const handleChange = jest.fn()
        render(
            <Select onChange={handleChange}>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </Select>
        )
        const select = screen.getByRole('combobox')

        fireEvent.change(select, { target: { value: '2' } })
        expect(handleChange).toHaveBeenCalled()
        expect(select).toHaveValue('2')
    })

    it('renders disabled state', () => {
        render(<Select disabled><option>Option</option></Select>)
        expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('applies custom className', () => {
        render(<Select className="custom-select"><option>Option</option></Select>)
        expect(screen.getByRole('combobox')).toHaveClass('custom-select')
    })

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLSelectElement>()
        render(<Select ref={ref}><option>Option</option></Select>)
        expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
})
