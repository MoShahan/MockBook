import crypto from "crypto"

import bcrypt from "bcrypt"

import { roleForEmail } from "../lib/admins.js"
import {
  buildAuthorizeUrl,
  fetchOauthProfile,
  frontendOrigin,
  isProviderConfigured,
  listConfiguredOauthProviders,
  verifyOauthState,
} from "../lib/oauth.js"
import { issueAuthTokens } from "../lib/tokens.js"
import User from "../models/User.js"

/** Redirect to FE login with a short oauthError code (FE maps to fixed copy). */
function redirectError(res, code) {
  const url = new URL("/login", frontendOrigin())
  url.searchParams.set("oauthError", code)
  return res.redirect(url.toString())
}

export const listOauthProviders = (req, res) => {
  res.status(200).json({ providers: listConfiguredOauthProviders() })
}

export const startOauth = (req, res) => {
  const { provider } = req.params
  if (!isProviderConfigured(provider)) {
    return redirectError(res, "provider_not_configured")
  }
  const built = buildAuthorizeUrl(provider)
  if (!built) return redirectError(res, "unavailable")
  return res.redirect(built.url)
}

export const oauthCallback = async (req, res, next) => {
  const { provider } = req.params
  try {
    if (!isProviderConfigured(provider)) {
      return redirectError(res, "provider_not_configured")
    }

    const { code, state, error } = req.query
    if (error) {
      return redirectError(res, "cancelled")
    }
    if (typeof code !== "string" || !code || typeof state !== "string" || !state) {
      return redirectError(res, "invalid_response")
    }

    try {
      verifyOauthState(state, provider)
    } catch {
      return redirectError(res, "invalid_state")
    }

    const profile = await fetchOauthProfile(provider, code)
    if (!profile.providerId) {
      return redirectError(res, "provider_account")
    }

    let user = await User.findOne({
      oauthProviders: { $elemMatch: { provider, providerId: profile.providerId } },
    })

    if (!user && profile.email) {
      user = await User.findOne({ email: profile.email.toLowerCase() })
      if (user) {
        const already = (user.oauthProviders || []).some(
          p => p.provider === provider && p.providerId === profile.providerId
        )
        if (!already) {
          user.oauthProviders = user.oauthProviders || []
          user.oauthProviders.push({ provider, providerId: profile.providerId })
          if (!user.picturePath && profile.picturePath) {
            user.picturePath = profile.picturePath
          }
          await user.save()
        }
      }
    }

    if (!user) {
      if (!profile.email) {
        return redirectError(res, "no_email")
      }
      const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
      const email = profile.email.toLowerCase()
      user = await User.create({
        firstName: profile.firstName.slice(0, 50),
        lastName: profile.lastName.slice(0, 50),
        email,
        password: placeholderHash,
        picturePath: profile.picturePath || "",
        role: roleForEmail(email),
        isActive: true,
        friends: [],
        following: [],
        savedPosts: [],
        location: "",
        occupation: "",
        viewedProfile: 0,
        oauthProviders: [{ provider, providerId: profile.providerId }],
      })
    }

    const tokens = issueAuthTokens(user._id)

    // Handoff tokens in the URL fragment (not query) so Referer logs stay cleaner.
    // Frontend `/auth/callback` stores tokens then loads the user via GET /auth/me.
    const handoff = new URL("/auth/callback", frontendOrigin())
    const fragment = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    return res.redirect(`${handoff.toString()}#${fragment.toString()}`)
  } catch (e) {
    console.error("oauthCallback:", e.message)
    return redirectError(res, "failed")
  }
}
