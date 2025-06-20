/**
 * Type definitions for OmniFocus Omni Automation objects
 * Based on the official OmniFocus automation documentation
 */

export interface OmniFocusTask {
  id: string;
  name: string;
  note: string;
  completed: boolean;
  completionDate?: string | null;
  creationDate: string;
  modificationDate: string;
  dueDate?: string | null;
  deferDate?: string | null;
  estimatedMinutes?: number | null;
  flagged: boolean;
  repetitionRule?: string | null;
  sequential: boolean;
  project?: {
    id: string;
    name: string;
  } | null;
  context?: {
    id: string;
    name: string;
  } | null;
  containingProject?: {
    id: string;
    name: string;
  } | null;
}

export interface OmniFocusProject {
  id: string;
  name: string;
  note: string;
  status: 'active' | 'on-hold' | 'completed' | 'dropped';
  completionDate?: string;
  creationDate: string;
  modificationDate: string;
  dueDate?: string;
  deferDate?: string;
  sequential: boolean;
  singleton: boolean;
  containingFolder?: {
    id: string;
    name: string;
  };
}

export interface OmniFocusContext {
  id: string;
  name: string;
  allowsNextAction: boolean;
  available: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface OmniFocusFolder {
  id: string;
  name: string;
  status: 'active' | 'on-hold' | 'completed' | 'dropped';
}

export interface TaskFilters {
  completed?: boolean;
  flagged?: boolean;
  projectId?: string;
  contextId?: string;
  dueAfter?: string;
  dueBefore?: string;
  includeProjects?: boolean;
  limit?: number;
}

export interface CreateTaskOptions {
  name: string;
  note?: string;
  projectId?: string;
  contextId?: string;
  dueDate?: string;
  deferDate?: string;
  estimatedMinutes?: number;
  flagged?: boolean;
}