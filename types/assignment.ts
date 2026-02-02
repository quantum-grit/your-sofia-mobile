import type {WasteContainer, ContainerState} from './wasteContainer'

export type AssignmentStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export interface Assignment {
  id: string
  title: string
  description?: string
  containers: WasteContainer[] | string[] // Can be populated or just IDs
  assignedTo:
    | {
        id: number
        name: string
        email: string
      }
    | number // Can be populated or just ID
  activities: ContainerState[]
  status: AssignmentStatus
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentInput {
  title: string
  description?: string
  containers: string[] // Array of container IDs
  assignedTo: number // User ID
  activities: ContainerState[]
  status?: AssignmentStatus
  dueDate?: string
}

export interface AssignmentProgress {
  assignmentId: string
  totalContainers: number
  completedContainers: number
  percentageComplete: number
  containerStatuses: {
    containerId: string
    publicNumber: string
    isComplete: boolean
    completedActivities: ContainerState[]
    pendingActivities: ContainerState[]
  }[]
}
