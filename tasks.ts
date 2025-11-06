'use server';

import { revalidatePath } from 'next/cache';

let tasks: any[] = [];
let nextId = 1;

export async function getTasks(status?: string) {
  if (status) {
    return tasks.filter((t) => t.status === status);
  }
  return tasks;
}

export async function createTask(formData: FormData) {
  try {
    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    if (!title || !description) {
      return { success: false, message: 'Título e descrição são obrigatórios.' };
    }

    const newTask = {
      id: nextId++,
      title,
      description,
      status: 'pendente',
    };
    tasks.push(newTask);

    revalidatePath('/');
    return { success: true, task: newTask };
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    return { success: false, message: 'Erro ao criar tarefa.' };
  }
}

export async function updateTask(formData: FormData) {
  const id = Number(formData.get('id'));
  const title = formData.get('title')?.toString();
  const description = formData.get('description')?.toString();
  const status = formData.get('status')?.toString();

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return { success: false };

  tasks[index] = { ...tasks[index], title, description, status };
  revalidatePath('/');
  return { success: true };
}

export async function deleteTask(formData: FormData) {
  const id = Number(formData.get('id'));
  tasks = tasks.filter((t) => t.id !== id);
  revalidatePath('/');
  return { success: true };
}
