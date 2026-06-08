const API_BASE_URL = import.meta.env.VITE_API_URL;

class TaskService {
  async getAllTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  }

  async deleteTask(taskId) {
    const url = `${API_BASE_URL}/tasks/${taskId}`;
    console.log(`[TaskService] Attempting to delete task at URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      console.log(`[TaskService] Delete response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[TaskService] Delete failed on server:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("[TaskService] Delete succeeded:", result);
      return result;
    } catch (error) {
      console.error("[TaskService] Network error or fetch exception:", error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
