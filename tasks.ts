'use server';

import API from '@/lib/API';
import { revalidatePath } from 'next/cache';

export async function getTasks(status?: string) {
  try {
    const endpoint = status ? `/tasks?status=${status}` : '/tasks';
    const { data } = await API.get(endpoint);
    return data;
  } catch {
    return [];
  }
}

export async function createTask(formData: FormData) {
  try {
    const title = formData.get('title');
    const description = formData.get('description');
    const payload = {
      title: String(title ?? ''),
      description: String(description ?? ''),
      status: 'pendente',
    };
    const { data } = await API.post('/tasks', payload);
    revalidatePath('/');
    return { success: true, task: data };
  } catch {
    return { success: false };
  }
}

export async function updateTask(formData: FormData) {
  try {
    const id = formData.get('id');
    const title = formData.get('title');
    const description = formData.get('description');
    const status = formData.get('status') || 'pendente';
    const idStr = typeof id === 'string' ? id : (id as any)?.toString?.();
    const payload = {
      title: String(title ?? ''),
      description: String(description ?? ''),
      status: String(status ?? 'pendente'),
    };
    await API.put(`/tasks/${idStr}`, payload);
    revalidatePath('/');
    return { success: true, task: { id: idStr, ...payload } };
  } catch {
    return { success: false };
  }
}

export async function deleteTask(formData: FormData) {
  try {
    const id = formData.get('id');
    const idStr = typeof id === 'string' ? id : (id as any)?.toString?.();
    await API.delete(`/tasks/${idStr}`);
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false };
  }
}
