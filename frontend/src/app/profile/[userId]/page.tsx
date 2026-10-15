import React from "react"

import ProfilePage from "../ProfilePage"

type OtherProfilePageProps = {
  params: Promise<{ userId: string }>
}

const OtherProfilePage = async ({ params }: OtherProfilePageProps) => {
  const { userId } = await params
  return <ProfilePage id={userId} />
}

export default OtherProfilePage
