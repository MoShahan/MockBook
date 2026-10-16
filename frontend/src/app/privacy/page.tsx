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

const PrivacyPage = () => {
  const updated = "October 16, 2026"

  return (
    <InfoPageShell
      title="Privacy Policy"
      subtitle={`Last updated: ${updated}. This policy explains how MockBook handles information in this demo application.`}
    >
      <Section title="1. Who we are">
        <Typography component="p">
          MockBook is a social networking demo / learning project. It is not a commercial consumer product.
          Contact:{" "}
          <MuiLink href="mailto:support@mockbook.app" underline="hover">
            support@mockbook.app
          </MuiLink>
          .
        </Typography>
      </Section>

      <Section title="2. Information we collect">
        <Typography component="p">Depending on how you use MockBook, we may store:</Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, "& li": { mb: 0.75 } }}>
          <li>Account details you provide (name, email, password hash — never your raw password).</li>
          <li>Profile fields you choose (location, occupation, avatar, social handles).</li>
          <li>Content you create (posts, images, comments, likes, saves, friend connections).</li>
          <li>OAuth identifiers if you sign in with Google, GitHub, or Discord.</li>
          <li>Basic technical data needed to run the app (e.g. session tokens in your browser).</li>
        </Box>
      </Section>

      <Section title="3. How we use information">
        <Typography component="p">We use this data to:</Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, "& li": { mb: 0.75 } }}>
          <li>Operate accounts, feeds, profiles, notifications, and friendships.</li>
          <li>Show your content to other signed-in users of this demo instance.</li>
          <li>Secure the service (authentication, abuse prevention).</li>
        </Box>
        <Typography component="p">
          We do not sell your personal information. This demo is not intended for advertising profiles or
          third-party marketing.
        </Typography>
      </Section>

      <Section title="4. Sharing">
        <Typography component="p">
          Content you post may be visible to other users of the same MockBook deployment (for example,
          friends or the Everyone feed). Media may be stored with our configured image provider (e.g.
          ImageKit). OAuth providers process sign-in according to their own policies when you choose those
          options.
        </Typography>
      </Section>

      <Section title="5. Retention & security">
        <Typography component="p">
          Data remains while your account exists on this deployment. Passwords are hashed; access uses Bearer
          JWTs. No system is perfectly secure — treat this as a demo and avoid sharing highly sensitive data.
        </Typography>
      </Section>

      <Section title="6. Your choices">
        <Typography component="p">
          You can edit profile fields, delete your own posts/comments (where the product allows), and sign out.
          For account deletion or privacy questions, contact{" "}
          <MuiLink href="mailto:support@mockbook.app" underline="hover">
            support@mockbook.app
          </MuiLink>{" "}
          or see{" "}
          <MuiLink component={NextLink} href="/help#contact">
            Contact us
          </MuiLink>
          .
        </Typography>
      </Section>

      <Section title="7. Changes">
        <Typography component="p">
          We may update this policy as the project evolves. The “Last updated” date at the top will change when
          we do. Continued use after updates means you accept the revised policy.
        </Typography>
      </Section>

      <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
        Also see{" "}
        <MuiLink component={NextLink} href="/terms">
          Terms &amp; Conditions
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

export default PrivacyPage
