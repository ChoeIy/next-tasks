'use client';

import { useState, useEffect, startTransition } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './actions/tasks';

export default function Home({ searchParams }: { searchParams?: { status?: string } }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState(searchParams?.status || '');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getTasks(statusFilter || undefined);
      setTasks(data);
    }
    load();
  }, [statusFilter]);

  async function handleCreate(formData: FormData) {
    const res = await createTask(formData);
    if (res?.success) {
      setMessage('✅ Tarefa adicionada com sucesso!');
      startTransition(async () => setTasks(await getTasks(statusFilter || undefined)));
    } else {
      setMessage('❌ Erro ao adicionar tarefa.');
    }
  }

  async function handleUpdate(formData: FormData) {
    const status = formData.get('status')?.toString();
    if (status === 'concluida') {
      const confirmar = confirm(
        'Tem certeza que deseja marcar esta tarefa como concluída? Após isso, ela não poderá mais ser editada.'
      );
      if (!confirmar) return;
    }

    const res = await updateTask(formData);
    if (res?.success) {
      setMessage('💾 Alterações salvas!');
      startTransition(async () => setTasks(await getTasks(statusFilter || undefined)));
    } else {
      setMessage('❌ Erro ao salvar alterações.');
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    const formData = new FormData();
    formData.append('id', String(id));
    const res = await deleteTask(formData);
    if (res?.success) {
      setMessage('🗑️ Tarefa excluída!');
      startTransition(async () => setTasks(await getTasks(statusFilter || undefined)));
    } else {
      setMessage('❌ Erro ao excluir tarefa.');
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Lista de Tarefas</h1>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded shadow text-sm">
          {message}
        </div>
      )}

      <form
        action={async (formData) => {
          await handleCreate(formData);
        }}
        className="flex flex-col gap-2 mb-6"
      >
        <input
          name="title"
          placeholder="Nova tarefa"
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Descrição da tarefa"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-fit">
          Adicionar
        </button>
      </form>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded ${!statusFilter ? 'bg-blue-200' : 'bg-gray-200'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setStatusFilter('pendente')}
          className={`px-3 py-1 rounded ${
            statusFilter === 'pendente' ? 'bg-blue-200' : 'bg-gray-200'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setStatusFilter('concluida')}
          className={`px-3 py-1 rounded ${
            statusFilter === 'concluida' ? 'bg-blue-200' : 'bg-gray-200'
          }`}
        >
          Concluídas
        </button>
      </div>

      <ul className="space-y-4">
        {tasks.map((t) => {
          const isCompleted = t.status === 'concluida';
          return (
            <li
              key={t.id}
              className={`border p-3 rounded flex flex-col gap-2 ${
                isCompleted ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <form
                action={async (formData) => {
                  await handleUpdate(formData);
                }}
                className="flex flex-col gap-2"
              >
                <input type="hidden" name="id" value={String(t.id)} />

                <input
                  name="title"
                  defaultValue={t.title}
                  disabled={isCompleted}
                  className={`border p-1 rounded ${
                    isCompleted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                />

                <textarea
                  name="description"
                  defaultValue={t.description}
                  disabled={isCompleted}
                  className={`border p-1 rounded ${
                    isCompleted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                />

                <select
                  name="status"
                  defaultValue={t.status || 'pendente'}
                  disabled={isCompleted}
                  className={`border p-1 rounded ${
                    isCompleted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluida">Concluída</option>
                </select>

                <div className="flex gap-2 items-center">
                  {!isCompleted && (
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Salvar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </div>

                <div
                  className={`text-sm ${
                    isCompleted ? 'text-green-600 font-semibold' : 'text-gray-600'
                  }`}
                >
                  Status atual: {isCompleted ? 'Concluída ✅' : 'Pendente'}
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
