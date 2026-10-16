"use client"

import { useState } from "react"
import { SentimentSatisfiedAltOutlined } from "@mui/icons-material"
import { alpha, Box, IconButton, Popover, Tooltip, Typography, useTheme } from "@mui/material"

/** Curated set - covers common reactions without a heavy emoji library. */
const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "😉",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😋",
  "😜",
  "🤪",
  "😝",
  "🤑",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "🤐",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😣",
  "😥",
  "😮",
  "🤐",
  "😯",
  "😪",
  "😫",
  "🥱",
  "😴",
  "😌",
  "😛",
  "😒",
  "😓",
  "😔",
  "😕",
  "🙃",
  "🤑",
  "😲",
  "☹️",
  "🙁",
  "😖",
  "😞",
  "😟",
  "😤",
  "😢",
  "😭",
  "😦",
  "😧",
  "😨",
  "😩",
  "🤯",
  "😬",
  "😰",
  "😱",
  "🥵",
  "🥶",
  "😳",
  "🤪",
  "😵",
  "😡",
  "😠",
  "🤬",
  "😷",
  "🤒",
  "🤕",
  "🤢",
  "🤮",
  "🥴",
  "😎",
  "🤓",
  "🧐",
  "😕",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
  "🙏",
  "💪",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "👌",
  "🫶",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "🔥",
  "⭐",
  "✨",
  "💫",
  "🎉",
  "🎊",
  "🎈",
  "🎁",
  "🏆",
  "🥇",
  "🎯",
  "🚀",
  "💡",
  "📸",
  "🎵",
  "☕",
  "🍕",
  "🍔",
  "🍰",
  "🎂",
  "🌈",
  "☀️",
  "🌙",
  "⚡",
  "🌸",
  "🍀",
  "🐶",
  "🐱",
  "🦄",
  "✅",
  "❌",
  "💯",
] as const

/** Dedupe while preserving order (list above has a few repeats). */
const UNIQUE_EMOJIS = [...new Set(EMOJIS)]

type EmojiPickerButtonProps = {
  onSelect: (emoji: string) => void
  disabled?: boolean
  /** Optional label shown next to the icon (create-post toolbar). */
  showLabel?: boolean
  active?: boolean
}

/**
 * Lightweight emoji popover - no extra package; inserts via parent callback.
 */
const EmojiPickerButton = ({
  onSelect,
  disabled = false,
  showLabel = false,
  active = false,
}: EmojiPickerButtonProps) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const accent = active || open

  return (
    <>
      <Tooltip title="Add emoji">
        <Box
          component="button"
          type="button"
          disabled={disabled}
          aria-label="Add emoji"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            border: 0,
            background: accent ? alpha(theme.palette.primary.main, 0.1) : "transparent",
            cursor: disabled ? "default" : "pointer",
            px: showLabel ? 1 : 0.5,
            py: 0.5,
            borderRadius: 1.5,
            color: accent ? theme.palette.primary.main : theme.palette.neutral.mediumMain,
            font: "inherit",
            fontWeight: accent ? 600 : 500,
            "&:hover": {
              color: disabled ? undefined : theme.palette.primary.main,
            },
          }}
        >
          <SentimentSatisfiedAltOutlined sx={{ fontSize: 22 }} />
          {showLabel ? <Typography component="span">Emoji</Typography> : null}
        </Box>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 1.5,
              width: 380,
              maxWidth: "min(380px, 92vw)",
              overflowX: "hidden",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 12px 40px rgba(0,0,0,0.45)"
                  : "0 12px 36px rgba(28,25,23,0.12)",
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{ display: "block", px: 0.5, pb: 1, color: "text.secondary", fontWeight: 600 }}
        >
          Pick an emoji
        </Typography>
        <Box
          role="listbox"
          aria-label="Emoji list"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
            gap: 0.5,
            maxHeight: 260,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.25,
          }}
        >
          {UNIQUE_EMOJIS.map(emoji => (
            <IconButton
              key={emoji}
              role="option"
              aria-label={`Insert ${emoji}`}
              onClick={() => {
                onSelect(emoji)
                setAnchorEl(null)
              }}
              sx={{
                width: "100%",
                minWidth: 0,
                aspectRatio: "1",
                p: 0,
                fontSize: "1.4rem",
                lineHeight: 1,
                borderRadius: 1.5,
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </>
  )
}

export default EmojiPickerButton

/** Insert `emoji` at the caret (or append) and restore focus/selection. */
export function insertEmojiAtCursor(
  input: HTMLInputElement | HTMLTextAreaElement | null,
  current: string,
  emoji: string,
  setValue: (next: string) => void
) {
  if (!input) {
    setValue(`${current}${emoji}`)
    return
  }
  const start = input.selectionStart ?? current.length
  const end = input.selectionEnd ?? current.length
  const next = `${current.slice(0, start)}${emoji}${current.slice(end)}`
  setValue(next)
  const caret = start + emoji.length
  requestAnimationFrame(() => {
    input.focus()
    input.setSelectionRange(caret, caret)
  })
}
