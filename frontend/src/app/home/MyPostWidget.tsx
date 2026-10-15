"use client"

import React, { useState } from "react"
import { DeleteOutlined, EditOutlined, ImageOutlined } from "@mui/icons-material"
import { Box, Button, Divider, IconButton, InputBase, Typography, useTheme } from "@mui/material"
import { Formik, type FormikHelpers } from "formik"
import DropZone from "react-dropzone"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import FlexBetween from "@/components/FlexBetween"
import UserImage from "@/components/UserImage"
import WidgetWrapper from "@/components/WidgetWrapper"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { setPosts } from "@/state"
import type { CreatePostFormValues, Post } from "@/types/models"

import { useAppDispatch, useAppSelector } from "../hooks"

type MyPostWidgetProps = { url: string }

const createPostSchema: ObjectSchema<CreatePostFormValues> = yup.object({
  description: yup
    .string()
    .defined()
    .test("has-content", "Add text or a photo to post", function (value) {
      const picture = (this.parent as CreatePostFormValues).picture
      return Boolean(value?.trim()) || picture instanceof File
    }),
  picture: yup.mixed<File>().nullable().defined(),
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

      const { data } = await api.post<Post[]>("/posts", formData)
      dispatch(setPosts({ posts: data }))
      helpers.resetForm()
      setIsImage(false)
    } catch (e: unknown) {
      helpers.setStatus(getErrorMessage(e, "Failed to create post"))
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
          const descriptionError =
            (Boolean(touched.description) || submitCount > 0) && errors.description
              ? String(errors.description)
              : undefined

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
                  sx={{
                    width: "100%",
                    borderRadius: "2rem",
                    padding: "1rem 2rem",
                    backgroundColor: palette.neutral.light,
                    border: descriptionError ? `1px solid ${palette.error.main}` : undefined,
                  }}
                  value={values.description}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </FlexBetween>
              {descriptionError && (
                <Typography sx={{ color: "error.main", mt: "0.5rem", fontSize: "0.75rem", pl: "4.5rem" }} role="alert">
                  {descriptionError}
                </Typography>
              )}

              {isImage && (
                <Box sx={{ border: `1px solid ${medium}`, borderRadius: "4px", mt: "1rem", p: "1rem" }}>
                  <DropZone
                    multiple={false}
                    accept={{ "image/*": [] }}
                    disabled={isSubmitting}
                    onDrop={acceptedFiles => setFieldValue("picture", acceptedFiles[0] ?? null)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <FlexBetween>
                        <Box
                          {...getRootProps()}
                          sx={{
                            border: `2px dashed ${palette.primary.main}`,
                            p: "1rem",
                            width: "100%",
                            "&:hover": { cursor: isSubmitting ? "default" : "pointer" },
                          }}
                        >
                          <input {...getInputProps()} />
                          {!values.picture ? (
                            <p>Add photo here</p>
                          ) : (
                            <FlexBetween>
                              <Typography>{values.picture.name}</Typography>
                              <EditOutlined />
                            </FlexBetween>
                          )}
                        </Box>
                        {values.picture && (
                          <IconButton
                            onClick={() => setFieldValue("picture", null)}
                            sx={{ width: "15%" }}
                            disabled={isSubmitting}
                            aria-label="Remove photo"
                          >
                            <DeleteOutlined />
                          </IconButton>
                        )}
                      </FlexBetween>
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
                <FlexBetween
                  onClick={() => {
                    if (isSubmitting) return
                    setIsImage(prev => {
                      if (prev) void setFieldValue("picture", null)
                      return !prev
                    })
                  }}
                  sx={{ gap: "0.25rem", cursor: isSubmitting ? "default" : "pointer" }}
                >
                  <ImageOutlined sx={{ color: medMain }} />
                  <Typography
                    sx={{
                      color: medMain,
                      "&:hover": {
                        color: medium,
                      },
                    }}
                  >
                    Image
                  </Typography>
                </FlexBetween>
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
