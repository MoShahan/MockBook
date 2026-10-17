"use client"

import { type ReactNode } from "react"
import { Box, Link as MuiLink, Typography } from "@mui/material"
import NextLink from "next/link"

import InfoPageShell from "@/components/InfoPageShell"

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box component="section" sx={{ mb: 3.5 }}>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.25 }}>
      {title}
    </Typography>
    <Box sx={{ color: "text.secondary", lineHeight: 1.7, "& p": { mb: 1.25 } }}>{children}</Box>
  </Box>
)

const TermsPage = () => {
  const updated = "October 16, 2026"

  return (
    <InfoPageShell
      title="Terms & Conditions"
      subtitle={`Last updated: ${updated}. By using Xivi you agree to these terms.`}
    >
      <Section title="1. The service">
        <Typography component="p">
          Xivi is a social networking demo provided as-is for learning and portfolio purposes. Features may
          change, break, or be removed without notice. There is no guarantee of uptime, data durability, or
          commercial support.
        </Typography>
      </Section>

      <Section title="2. Accounts">
        <Typography component="p">
          You are responsible for your account credentials and for activity under your account. Provide accurate
          registration information. Do not share accounts or attempt to access another user’s account. We may
          disable accounts that abuse the service.
        </Typography>
      </Section>

      <Section title="3. Acceptable use">
        <Typography component="p">You agree not to:</Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, "& li": { mb: 0.75 } }}>
          <li>Post illegal, harassing, hateful, or sexually exploitative content.</li>
          <li>Upload malware, spam, or content that infringes others’ rights.</li>
          <li>Scrape, overload, or attack the API or infrastructure.</li>
          <li>Impersonate others or misrepresent your identity in a harmful way.</li>
        </Box>
      </Section>

      <Section title="4. Your content">
        <Typography component="p">
          You keep ownership of content you post. By posting, you grant Xivi a limited license to host,
          display, and distribute that content within the app so the social features can work. You can delete
          your own posts where the product allows; residual copies may remain in backups for a period.
        </Typography>
      </Section>

      <Section title="5. Third-party services">
        <Typography component="p">
          Sign-in with Google, GitHub, or Discord, and image hosting (e.g. ImageKit), are governed by those
          providers’ terms when you use them. Xivi is not responsible for third-party outages or policy
          changes.
        </Typography>
      </Section>

      <Section title="6. Disclaimers">
        <Typography component="p">
          THE SERVICE IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND. To the fullest extent allowed by law,
          Xivi and its contributors are not liable for damages arising from use of the demo, including data
          loss or unauthorized access.
        </Typography>
      </Section>

      <Section title="7. Changes & contact">
        <Typography component="p">
          We may update these terms; the date above will reflect material changes. Questions:{" "}
          <MuiLink href="mailto:support@xivi.app" underline="hover">
            support@xivi.app
          </MuiLink>{" "}
          or{" "}
          <MuiLink component={NextLink} href="/help#contact">
            Contact us
          </MuiLink>
          .
        </Typography>
      </Section>

      <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
        Also see{" "}
        <MuiLink component={NextLink} href="/privacy">
          Privacy Policy
        </MuiLink>{" "}
        and{" "}
        <MuiLink component={NextLink} href="/help">
          Help &amp; FAQ
        </MuiLink>
        .
      </Typography>
    </InfoPageShell>
  )
}

export default TermsPage
