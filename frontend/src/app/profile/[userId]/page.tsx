"use client"

import React, { use } from "react"

import ProfilePage from "../ProfilePage"

type OtherProfilePageProps = {
  params: Promise<{ userId: string }>
}

const OtherProfilePage = ({ params }: OtherProfilePageProps) => {
  const { userId } = use(params)
  return <ProfilePage id={userId} />
}

export default OtherProfilePage
