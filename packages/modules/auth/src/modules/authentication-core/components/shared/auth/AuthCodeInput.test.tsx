// @vitest-environment jsdom
import React, { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import AuthCodeInput from './AuthCodeInput'

function Harness({
  onComplete,
  ...props
}: Partial<React.ComponentProps<typeof AuthCodeInput>> & { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <AuthCodeInput
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      label='Device Code'
      {...props}
    />
  )
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[]

describe('AuthCodeInput', () => {
  afterEach(() => cleanup())

  it('renders one box per character, grouped with a separator', () => {
    render(<Harness length={8} groups={[4, 4]} mode='alphanumeric' />)
    expect(boxes()).toHaveLength(8)
    expect(screen.getByRole('group', { name: 'Device Code' })).toBeTruthy()
  })

  it('advances focus as characters are typed', () => {
    render(<Harness length={6} />)
    const inputs = boxes()

    fireEvent.change(inputs[0], { target: { value: '1' } })
    expect(document.activeElement).toBe(inputs[1])

    fireEvent.change(inputs[1], { target: { value: '2' } })
    expect(document.activeElement).toBe(inputs[2])
  })

  it('rejects non-numeric input in numeric mode', () => {
    render(<Harness length={6} mode='numeric' />)
    const inputs = boxes()

    fireEvent.change(inputs[0], { target: { value: 'x' } })
    expect(inputs[0].value).toBe('')
  })

  it('upper-cases alphanumeric input', () => {
    render(<Harness length={8} groups={[4, 4]} mode='alphanumeric' />)
    const inputs = boxes()

    fireEvent.change(inputs[0], { target: { value: 'a' } })
    expect(inputs[0].value).toBe('A')
  })

  it('spreads a pasted code across the boxes and fires onComplete', () => {
    const onComplete = vi.fn()
    render(<Harness length={6} onComplete={onComplete} />)
    const inputs = boxes()

    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
    })

    expect(inputs.map((input) => input.value).join('')).toBe('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('ignores separators inside a pasted device code', () => {
    const onComplete = vi.fn()
    render(<Harness length={8} groups={[4, 4]} mode='alphanumeric' onComplete={onComplete} />)
    const inputs = boxes()

    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => 'ABCD-1234' },
    })

    expect(onComplete).toHaveBeenCalledWith('ABCD1234')
  })

  it('steps back and clears the previous box on backspace in an empty box', () => {
    render(<Harness length={6} />)
    const inputs = boxes()

    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.keyDown(inputs[1], { key: 'Backspace' })

    expect(inputs[0].value).toBe('')
    expect(document.activeElement).toBe(inputs[0])
  })

  it('moves focus with the arrow keys', () => {
    render(<Harness length={6} />)
    const inputs = boxes()

    inputs[2].focus()
    fireEvent.keyDown(inputs[2], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(inputs[1])

    fireEvent.keyDown(inputs[1], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(inputs[2])
  })

  it('falls back to a single group when the group sizes do not sum to the length', () => {
    render(<Harness length={6} groups={[4, 4]} />)
    expect(boxes()).toHaveLength(6)
  })

  it('does not fire onComplete until every box is filled', () => {
    const onComplete = vi.fn()
    render(<Harness length={4} onComplete={onComplete} />)
    const inputs = boxes()

    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '2' } })
    fireEvent.change(inputs[2], { target: { value: '3' } })
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.change(inputs[3], { target: { value: '4' } })
    expect(onComplete).toHaveBeenCalledWith('1234')
  })
})
