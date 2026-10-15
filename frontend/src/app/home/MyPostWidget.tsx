"use client"

import React, { useState } from "react"
import {
  AttachFileOutlined,
  DeleteOutlined,
  EditOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material"
import { Box, Button, Divider, IconButton, InputBase, Typography, useMediaQuery, useTheme } from "@mui/material"
import DropZone from "react-dropzone"

import FlexBetween from "@/components/FlexBetween"
import UserImage from "@/components/UserImage"
import WidgetWrapper from "@/components/WidgetWrapper"
import { api, authHeaders } from "@/lib/api"
import { setPosts } from "@/state"

import { useAppDispatch, useAppSelector } from "../hooks"

type MyPostWidgetProps = { url: string }

const MyPostWidget = ({ url }: MyPostWidgetProps) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const user = useAppSelector((state: any) => state?.user)
  const accessToken = useAppSelector(state => state?.accessToken)
  const dispatch = useAppDispatch()
  const { palette }: any = useTheme()
  const medMain = palette.neutral.mediumMain
  const medium = palette.neutral.medium

  const [isImage, setIsImage] = useState<boolean>(false)
  const [image, setImage] = useState<any>(null)
  const [postDesc, setPostDesc] = useState<string>("")

  const handlePost = async () => {
    const formData = new FormData()
    formData.append("description", postDesc)
    formData.append("userId", user?._id)
    if (image) {
      formData.append("picture", image)
      formData.append("url", image?.name)
    }
    const { data } = await api.post("/posts", formData, {
      headers: authHeaders(accessToken),
    })
    dispatch(setPosts({ res: data }))
    setPostDesc("")
    setImage(null)
  }

  return (
    <WidgetWrapper>
      <FlexBetween sx={{ gap: "1.5rem" }}>
        <UserImage image={user?.picturePath} />
        <InputBase
          placeholder="What's on your mind?"
          sx={{
            width: "100%",
            borderRadius: "2rem",
            padding: "1rem 2rem",
            backgroundColor: palette.neutral.light,
          }}
          value={postDesc}
          onChange={e => setPostDesc(e.target.value)}
        />
      </FlexBetween>
      {isImage && (
        <Box sx={{ border: `1px solid ${medium}`, borderRadius: "4px", mt: "1rem", p: "1rem" }}>
          <DropZone multiple={false} onDrop={acceptedFiles => setImage(acceptedFiles[0])}>
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${palette.primary.main}`,
                    p: "1rem",
                    width: "100%",
                    "&:hover": { cursor: "pointer" },
                  }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add photo here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton onClick={() => setImage(null)} sx={{ width: "15%" }}>
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </DropZone>
        </Box>
      )}
      <Divider sx={{ margin: "1.25rem 0" }} />
      <FlexBetween>
        <FlexBetween onClick={() => setIsImage(prev => !prev)} sx={{ gap: "0.25rem", cursor: "pointer" }}>
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
        {isNonMobileScreens ? (
          <>
            <FlexBetween sx={{ gap: "0.25rem", cursor: "pointer" }}>
              <GifBoxOutlined sx={{ color: medMain }} />
              <Typography sx={{ color: medMain, "&:hover": { color: medium } }}>Clip</Typography>
            </FlexBetween>
            <FlexBetween sx={{ gap: "0.25rem", cursor: "pointer" }}>
              <AttachFileOutlined sx={{ color: medMain }} />
              <Typography sx={{ color: medMain, "&:hover": { color: medium } }}>Attachment</Typography>
            </FlexBetween>
            <FlexBetween sx={{ gap: "0.25rem", cursor: "pointer" }}>
              <MicOutlined sx={{ color: medMain }} />
              <Typography sx={{ color: medMain, "&:hover": { color: medium } }}>Audio</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween sx={{ gap: "0.25rem" }}>
            <MoreHorizOutlined sx={{ color: medMain }} />
          </FlexBetween>
        )}
      </FlexBetween>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "1rem" }}>
        <Button
          disabled={!postDesc}
          onClick={handlePost}
          sx={{ color: palette.background.alt, backgroundColor: palette.primary.main }}
        >
          POST
        </Button>
      </Box>
    </WidgetWrapper>
  )
}

export default MyPostWidget
