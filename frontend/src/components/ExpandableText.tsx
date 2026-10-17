"use client"

import React, { useState } from "react"
import { Box, Button, type SxProps, type Theme,Typography } from "@mui/material"

type ExpandableTextProps = {
  text: string
  /** Max words shown before “See more”. Default 40. */
  maxWords?: number
  typographySx?: SxProps<Theme>
  buttonSx?: SxProps<Theme>
}

function truncateByWords(text: string, maxWords: number): { preview: string; needsExpand: boolean } {
  const trimmed = text.trim()
  if (!trimmed) return { preview: "", needsExpand: false }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) {
    return { preview: trimmed, needsExpand: false }
  }

  return {
    preview: `${words.slice(0, maxWords).join(" ")}…`,
    needsExpand: true,
  }
}

const ExpandableText = ({
  text,
  maxWords = 40,
  typographySx,
  buttonSx,
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false)
  const { preview, needsExpand } = truncateByWords(text, maxWords)
  const display = expanded || !needsExpand ? text.trim() : preview

  if (!display) return null

  return (
    <Box>
      <Typography sx={typographySx}>{display}</Typography>
      {needsExpand && (
        <Button
          size="small"
          onClick={() => setExpanded(prev => !prev)}
          sx={{
            textTransform: "none",
            minWidth: 0,
            p: 0,
            mt: "0.15rem",
            fontSize: "0.8125rem",
            fontWeight: 600,
            ...((buttonSx || {}) as object),
          }}
        >
          {expanded ? "See less" : "See more"}
        </Button>
      )}
    </Box>
  )
}

export default ExpandableText
