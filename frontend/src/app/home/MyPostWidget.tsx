"use client"

import React, { useEffect, useRef, useState } from "react"
import { CloseOutlined, ImageOutlined } from "@mui/icons-material"
import {
  alpha,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material"
import { Formik, type FormikHelpers } from "formik"
import DropZone from "react-dropzone"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import EmojiPickerButton, { insertEmojiAtCursor } from "@/components/EmojiPickerButton"
import FlexBetween from "@/components/FlexBetween"
import UserImage from "@/components/UserImage"
import WidgetWrapper from "@/components/WidgetWrapper"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/providers/ToastProvider"
import { prependPost } from "@/state"
import type { CreatePostFormValues, Post } from "@/types/models"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

import { useAppDispatch, useAppSelector } from "../hooks"

type MyPostWidgetProps = { url: string }

type ImagePreviewProps = {
  file: File
  disabled?: boolean
  onRemove: () => void
}

const ImagePreview = ({ file, disabled, onRemove }: ImagePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <Box sx={{ position: "relative", width: "100%", bgcolor: "background.default" }}>
      <Box
        component="img"
        src={previewUrl}
        alt={file.name}
        sx={{
          display: "block",
          width: "100%",
          maxHeight: 320,
          objectFit: "contain",
          bgcolor: "background.default",
        }}
      />
      <IconButton
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        disabled={disabled}
        aria-label="Remove photo"
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "rgba(28,25,23,0.72)",
          color: "common.white",
          "&:hover": { bgcolor: "rgba(28,25,23,0.88)" },
        }}
      >
        <CloseOutlined fontSize="small" />
      </IconButton>
      <Typography
        sx={{
          px: 1.5,
          py: 0.75,
          fontSize: "0.75rem",
          color: "text.secondary",
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.alt",
        }}
        noWrap
        title={file.name}
      >
        {file.name} · click to replace
      </Typography>
    </Box>
  )
}

const POST_EMPTY_MESSAGE = "Add some text or a photo before posting."

const createPostSchema: ObjectSchema<CreatePostFormValues> = yup.object({
  description: yup
    .string()
    .default("")
    .test("has-content", POST_EMPTY_MESSAGE, function (value) {
      const picture = (this.parent as CreatePostFormValues).picture
      return Boolean(value?.trim()) || picture instanceof File
    }),
  picture: yup.mixed<File>().nullable().default(null),
})

const createPostInitVals: CreatePostFormValues = {
  description: "",
  picture: null,
}

const MyPostWidget = ({ url }: MyPostWidgetProps) => {
  const user = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()
  const { palette } = useTheme()
  const medMain = palette.neutral.mediumMain
  const medium = palette.neutral.medium

  const [isImage, setIsImage] = useState(false)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const { success, error: toastError } = useToast()

  const handleCreatePost = async (vals: CreatePostFormValues, helpers: FormikHelpers<CreatePostFormValues>) => {
    if (!user?._id) {
      helpers.setStatus("You must be logged in to post")
      return
    }

    try {
      helpers.setStatus(undefined)
      const formData = new FormData()
      formData.append("description", vals.description.trim())
      if (vals.picture instanceof File) {
        formData.append("picture", vals.picture)
      }

      const { data } = await api.post<{ post: Post }>("/posts", formData)
      dispatch(prependPost({ post: data.post }))
      helpers.resetForm()
      setIsImage(false)
      success("Post created")
    } catch (e: unknown) {
      const msg = getErrorMessage(e, "Failed to create post")
      helpers.setStatus(msg)
      toastError(msg)
    }
  }

  return (
    <WidgetWrapper>
      <Formik<CreatePostFormValues>
        initialValues={createPostInitVals}
        validationSchema={createPostSchema}
        onSubmit={handleCreatePost}
        validateOnBlur
        validateOnChange={false}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          status,
          submitCount,
          isSubmitting,
        }) => {
          const showContentError =
            submitCount > 0 && Boolean(errors.description || errors.picture)
          const contentErrorMessage = errors.description
            ? String(errors.description)
            : errors.picture
              ? String(errors.picture)
              : POST_EMPTY_MESSAGE

          return (
            <form onSubmit={handleSubmit} noValidate>
              <FlexBetween sx={{ gap: "1.5rem", alignItems: "center" }}>
                <UserImage
                  image={url}
                  name={[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
                />
                <InputBase
                  name="description"
                  placeholder="What's on your mind?"
                  inputRef={descriptionInputRef}
                  aria-invalid={showContentError}
                  aria-describedby={showContentError ? "create-post-error" : undefined}
                  sx={{
                    width: "100%",
                    borderRadius: "2rem",
                    padding: "1rem 2rem",
                    backgroundColor: palette.neutral.light,
                    border: showContentError ? `1px solid ${palette.error.main}` : undefined,
                  }}
                  value={values.description}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </FlexBetween>
              {showContentError && (
                <Typography
                  id="create-post-error"
                  role="alert"
                  sx={{
                    color: "error.main",
                    mt: "0.65rem",
                    ml: { xs: 0, sm: "4.5rem" },
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {contentErrorMessage}
                </Typography>
              )}

              {isImage && (
                <Box sx={{ mt: "1rem" }}>
                  <DropZone
                    multiple={false}
                    maxSize={MAX_IMAGE_BYTES}
                    accept={{ "image/jpeg": [], "image/png": [], "image/gif": [], "image/webp": [] }}
                    disabled={isSubmitting}
                    onDrop={(acceptedFiles, fileRejections) => {
                      if (fileRejections.length > 0) {
                        const code = fileRejections[0]?.errors?.[0]?.code
                        toastError(
                          code === "file-too-large"
                            ? "Image must be 5MB or smaller"
                            : "Use a JPEG, PNG, GIF, or WebP image"
                        )
                        return
                      }
                      void setFieldValue("picture", acceptedFiles[0] ?? null)
                    }}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <Box
                        {...getRootProps()}
                        sx={{
                          position: "relative",
                          width: "100%",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: `1px dashed ${
                            isDragActive ? palette.primary.main : alpha(palette.neutral.medium, 0.7)
                          }`,
                          bgcolor: isDragActive
                            ? alpha(palette.primary.main, 0.06)
                            : alpha(palette.neutral.light, 0.55),
                          cursor: isSubmitting ? "default" : "pointer",
                          transition: "border-color 0.15s ease, background-color 0.15s ease",
                          "&:hover": {
                            borderColor: isSubmitting ? undefined : palette.primary.main,
                            bgcolor: isSubmitting
                              ? undefined
                              : alpha(palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <input {...getInputProps()} />
                        {values.picture ? (
                          <ImagePreview
                            file={values.picture}
                            disabled={isSubmitting}
                            onRemove={() => setFieldValue("picture", null)}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.75,
                              py: 3.5,
                              px: 2,
                              textAlign: "center",
                            }}
                          >
                            <ImageOutlined sx={{ fontSize: 36, color: medMain }} />
                            <Typography sx={{ fontWeight: 600, color: palette.neutral.dark }}>
                              {isDragActive ? "Drop photo here" : "Add a photo"}
                            </Typography>
                            <Typography sx={{ fontSize: "0.85rem", color: medium }}>
                              Drag and drop, or click to browse · JPEG, PNG, GIF, WebP
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </DropZone>
                  {(touched.picture || submitCount > 0) && errors.picture && (
                    <Typography sx={{ color: "error.main", mt: "0.5rem", fontSize: "0.75rem" }} role="alert">
                      {String(errors.picture)}
                    </Typography>
                  )}
                </Box>
              )}

              <Divider sx={{ margin: "1.25rem 0" }} />
              <FlexBetween>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FlexBetween
                    onClick={() => {
                      if (isSubmitting) return
                      setIsImage(prev => {
                        if (prev) void setFieldValue("picture", null)
                        return !prev
                      })
                    }}
                    sx={{
                      gap: "0.35rem",
                      cursor: isSubmitting ? "default" : "pointer",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor: isImage ? alpha(palette.primary.main, 0.1) : "transparent",
                    }}
                  >
                    <ImageOutlined sx={{ color: isImage ? palette.primary.main : medMain }} />
                    <Typography
                      sx={{
                        color: isImage ? palette.primary.main : medMain,
                        fontWeight: isImage ? 600 : 500,
                        "&:hover": {
                          color: isImage ? palette.primary.main : medium,
                        },
                      }}
                    >
                      Image
                    </Typography>
                  </FlexBetween>
                  <EmojiPickerButton
                    showLabel
                    disabled={isSubmitting}
                    onSelect={emoji =>
                      insertEmojiAtCursor(
                        descriptionInputRef.current,
                        values.description,
                        emoji,
                        next => void setFieldValue("description", next)
                      )
                    }
                  />
                </Box>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ color: palette.background.alt, backgroundColor: palette.primary.main }}
                >
                  {isSubmitting ? "POSTING…" : "POST"}
                </Button>
              </FlexBetween>

              {status && (
                <Typography sx={{ color: "error.main", mt: "1rem", textAlign: "center" }} role="alert">
                  {String(status)}
                </Typography>
              )}
            </form>
          )
        }}
      </Formik>
    </WidgetWrapper>
  )
}

export default MyPostWidget
