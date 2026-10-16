"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material"
import { Formik } from "formik"
import * as yup from "yup"

import { useAppDispatch } from "@/app/hooks"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { SOCIAL_NETWORKS } from "@/lib/social"
import { useToast } from "@/providers/ToastProvider"
import { setUser } from "@/state"
import type { User } from "@/types/models"

import UserImage from "./UserImage"

type EditProfileDialogProps = {
  open: boolean
  onClose: () => void
  user: User
  onSaved?: (user: User) => void
}

type EditProfileValues = {
  firstName: string
  lastName: string
  location: string
  occupation: string
  facebook: string
  x: string
  linkedin: string
  instagram: string
  picture: File | null
}

const schema = yup.object({
  firstName: yup.string().trim().required("Required").max(50),
  lastName: yup.string().trim().required("Required").max(50),
  location: yup.string().trim().max(100),
  occupation: yup.string().trim().max(100),
  facebook: yup.string().trim().max(64),
  x: yup.string().trim().max(64),
  linkedin: yup.string().trim().max(64),
  instagram: yup.string().trim().max(64),
})

function valuesFromUser(user: User): EditProfileValues {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    location: user.location || "",
    occupation: user.occupation || "",
    facebook: user.facebook || "",
    x: user.x || "",
    linkedin: user.linkedin || "",
    instagram: user.instagram || "",
    picture: null,
  }
}

const EditProfileDialog = ({ open, onClose, user, onSaved }: EditProfileDialogProps) => {
  const dispatch = useAppDispatch()
  const { success, error: toastError } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="edit-profile-title">
      <Formik<EditProfileValues>
        initialValues={valuesFromUser(user)}
        enableReinitialize
        validationSchema={schema}
        onSubmit={async (vals, helpers) => {
          try {
            helpers.setStatus(undefined)
            const formData = new FormData()
            formData.append("firstName", vals.firstName.trim())
            formData.append("lastName", vals.lastName.trim())
            formData.append("location", vals.location.trim())
            formData.append("occupation", vals.occupation.trim())
            formData.append("facebook", vals.facebook.trim())
            formData.append("x", vals.x.trim())
            formData.append("linkedin", vals.linkedin.trim())
            formData.append("instagram", vals.instagram.trim())
            if (vals.picture instanceof File) {
              formData.append("picture", vals.picture)
            }

            const { data } = await api.patch<{ user: User }>("/users/me", formData)
            dispatch(setUser({ user: data.user }))
            onSaved?.(data.user)
            success("Profile updated")
            onClose()
          } catch (e: unknown) {
            const msg = getErrorMessage(e, "Could not update profile")
            helpers.setStatus(msg)
            toastError(msg)
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          status,
        }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle id="edit-profile-title">Edit profile</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <UserImage
                  image={previewUrl || user.picturePath || ""}
                  name={`${values.firstName} ${values.lastName}`}
                  size="72px"
                />
                <Button component="label" variant="outlined" size="small">
                  Change photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0] ?? null
                      setFieldValue("picture", file)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(file ? URL.createObjectURL(file) : null)
                    }}
                  />
                </Button>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField
                  label="First name"
                  name="firstName"
                  value={values.firstName}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.firstName && errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  fullWidth
                />
                <TextField
                  label="Last name"
                  name="lastName"
                  value={values.lastName}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.lastName && errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  fullWidth
                />
              </Box>

              <TextField
                label="Location"
                name="location"
                value={values.location}
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Occupation"
                name="occupation"
                value={values.occupation}
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Social profiles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optional usernames or handles (not full URLs).
              </Typography>
              {SOCIAL_NETWORKS.map(({ key, label }) => (
                <TextField
                  key={key}
                  label={label}
                  name={key}
                  value={values[key]}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="username"
                  fullWidth
                />
              ))}

              {status ? (
                <Typography color="error" role="alert">
                  {String(status)}
                </Typography>
              ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  )
}

export default EditProfileDialog
