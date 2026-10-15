import "@mui/material/styles"

declare module "@mui/material/styles" {
  interface Palette {
    neutral: {
      dark: string
      main: string
      mediumMain: string
      medium: string
      light: string
    }
  }

  interface PaletteOptions {
    neutral?: {
      dark?: string
      main?: string
      mediumMain?: string
      medium?: string
      light?: string
    }
  }

  interface TypeBackground {
    alt: string
  }
}
