import React, { useCallback, useMemo, useRef } from 'react'
import { Box, TextField, Typography, alpha, useTheme } from '@mui/material'

export interface AuthCodeInputProps {
  /** Current value, without separators. Shorter than `length` is fine. */
  value: string
  onChange: (value: string) => void
  /** Fired once the value reaches `length` characters. */
  onComplete?: (value: string) => void
  length?: number
  /**
   * Segment sizes, e.g. `[4, 4]` renders `XXXX-XXXX` for an RFC 8628 device
   * code. Must sum to `length`. Defaults to one group of `length`.
   */
  groups?: number[]
  separator?: string
  mode?: 'numeric' | 'alphanumeric'
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
  /** Accessible name for the group, e.g. "Device activation code". */
  label: string
  /** Accessible per-box label builder; receives the 1-based position. */
  boxLabel?: (position: number, total: number) => string
  id?: string
}

const sanitize = (raw: string, mode: 'numeric' | 'alphanumeric') =>
  mode === 'numeric' ? raw.replace(/\D/g, '') : raw.replace(/[^a-z0-9]/gi, '').toUpperCase()

/**
 * Chunked single-character code entry.
 *
 * Replaces the free-text fields the device and MFA screens used, where the
 * user had to type a run of characters into one box with no chunking. Miller's
 * Law: the code is grouped so it can be held in working memory while it is
 * copied off another device.
 *
 * The boxes are pinned to `direction: ltr` on purpose. Verification codes are
 * transcribed left-to-right from another screen in every locale, so mirroring
 * them under RTL would show the code reversed relative to its source.
 */
const AuthCodeInput: React.FC<AuthCodeInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  groups,
  separator = '-',
  mode = 'numeric',
  disabled = false,
  error = false,
  autoFocus = false,
  label,
  boxLabel,
  id,
}) => {
  const theme = useTheme()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const resolvedGroups = useMemo(() => {
    if (!groups?.length) return [length]
    const total = groups.reduce((sum, size) => sum + size, 0)
    return total === length ? groups : [length]
  }, [groups, length])

  const chars = useMemo(
    () => Array.from({ length }, (_, index) => value[index] ?? ''),
    [value, length],
  )

  const focusBox = useCallback((index: number) => {
    const target = inputsRef.current[index]
    if (target) {
      target.focus()
      target.select()
    }
  }, [])

  const commit = useCallback(
    (nextChars: string[]) => {
      // Trailing blanks are dropped so `value.length` stays a truthful measure
      // of how much of the code has been entered.
      const next = nextChars.join('').replace(/\s+$/, '')
      onChange(next)
      if (next.length === length) onComplete?.(next)
    },
    [length, onChange, onComplete],
  )

  const handleChange = (index: number, raw: string) => {
    const cleaned = sanitize(raw, mode)
    const nextChars = [...chars]

    if (!cleaned) {
      nextChars[index] = ''
      commit(nextChars)
      return
    }

    // Typing into a box also accepts a run pasted or autofilled at that box.
    for (let offset = 0; offset < cleaned.length && index + offset < length; offset += 1) {
      nextChars[index + offset] = cleaned[offset]
    }
    commit(nextChars)
    focusBox(Math.min(index + cleaned.length, length - 1))
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace' && !chars[index] && index > 0) {
      event.preventDefault()
      const nextChars = [...chars]
      nextChars[index - 1] = ''
      commit(nextChars)
      focusBox(index - 1)
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusBox(index - 1)
      return
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const cleaned = sanitize(event.clipboardData.getData('text'), mode)
    if (!cleaned) return
    const nextChars = [...chars]
    for (let offset = 0; offset < cleaned.length && index + offset < length; offset += 1) {
      nextChars[index + offset] = cleaned[offset]
    }
    commit(nextChars)
    focusBox(Math.min(index + cleaned.length, length - 1))
  }

  let cursor = 0

  return (
    <Box
      id={id}
      role='group'
      aria-label={label}
      // The `dir` attribute rather than a CSS `direction` declaration:
      // stylis-plugin-rtl rewrites `direction: ltr` to `rtl` along with every
      // other physical property, which reversed the boxes and put the caret in
      // the last one under Arabic.
      dir='ltr'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      {resolvedGroups.map((size, groupIndex) => {
        const boxes = Array.from({ length: size }, () => cursor++)
        return (
          <React.Fragment key={`code-group-${groupIndex}`}>
            {groupIndex > 0 && (
              <Typography
                aria-hidden
                sx={{ color: 'text.disabled', fontWeight: 800, px: 0.5, userSelect: 'none' }}
              >
                {separator}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {boxes.map((boxIndex) => (
                <TextField
                  key={boxIndex}
                  inputRef={(el: HTMLInputElement | null) => {
                    inputsRef.current[boxIndex] = el
                  }}
                  value={chars[boxIndex]}
                  onChange={(event) => handleChange(boxIndex, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(boxIndex, event)}
                  onPaste={(event) => handlePaste(boxIndex, event)}
                  onFocus={(event) => event.target.select()}
                  disabled={disabled}
                  error={error}
                  autoFocus={autoFocus && boxIndex === 0}
                  autoComplete={boxIndex === 0 ? 'one-time-code' : 'off'}
                  slotProps={{
                    htmlInput: {
                      inputMode: mode === 'numeric' ? 'numeric' : 'text',
                      pattern: mode === 'numeric' ? '[0-9]*' : '[a-zA-Z0-9]*',
                      maxLength: length,
                      'aria-label': boxLabel
                        ? boxLabel(boxIndex + 1, length)
                        : `${label} ${boxIndex + 1}/${length}`,
                      style: {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        padding: 0,
                      },
                    },
                    input: {
                      sx: {
                        width: { xs: 44, sm: 52 },
                        height: 56,
                        // Matches AuthTextField's 12px so a code box and a
                        // text field read as the same control family.
                        borderRadius: 'var(--sf-radius-lg, 12px)',
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        '& fieldset': { borderWidth: 2 },
                        '&.Mui-focused': {
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                        },
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </React.Fragment>
        )
      })}
    </Box>
  )
}

export default AuthCodeInput
