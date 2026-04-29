'use server'

import { revalidatePath } from 'next/cache'
import type { Team, TeamActionState } from '@/types/api'

import mockData from '@/data/data.json'

export async function getTeamsData(): Promise<{
  data: Team[]
  pageInfo?: { title: string; description: string }
} | null> {
  // Fallback to mock data exclusively as requested
  return {
    pageInfo: {
      title: mockData.screen.title,
      description: mockData.screen.description,
    },
    data: mockData.data.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      status: item.isActive,
      updated_at: item.updatedAt,
    })),
  }
}

export async function updateTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const statusValue = formData.get('status')
  const status = statusValue === 'true' || statusValue === 'on'

  if (!id || !name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        name: !name ? 'Required' : undefined,
      },
    }
  }

  // Simulate success with mock data
  console.log('Mock Update Team:', { id, name, icon, status })
  revalidatePath('/[lang]/[domain]/settings/teams', 'page')

  return {
    status: 'success',
    httpStatus: 200,
    notificationToken: crypto.randomUUID(),
  }
}

export async function deleteTeamAction(id: string): Promise<TeamActionState> {
  // Simulate success with mock data
  console.log('Mock Delete Team:', id)
  revalidatePath('/[lang]/[domain]/settings/teams', 'page')

  return {
    status: 'success',
    httpStatus: 200,
    notificationToken: crypto.randomUUID(),
  }
}
