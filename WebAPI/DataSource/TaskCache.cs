using System.Collections.Concurrent;
using TaskBrokerSandbox.Types;

namespace TaskBrokerSandbox.DataSource
{
    public class TaskCache
    {
        private readonly ConcurrentDictionary<Guid, TaskModel> tasks = new();

        public TaskModel GetTask(Guid taskUid)
        {
            return tasks[taskUid];
        }

        public List<TaskModel> GetTasks()
        {
            return tasks.Values.ToList();
        }

        public int GetTotalTasksCount()
        {
            return tasks.Count;
        }

        public int GetProcessingTasksCount()
        {
            return tasks.Values.Count(x => !x.IsCompleted);
        }

        public int GetCompletedTasksCount()
        {
            return tasks.Values.Count(x => x.IsCompleted);
        }

        public bool AddTask(TaskModel taskModel)
        {
            if (tasks.ContainsKey(taskModel.Uid))
            {
                throw new ArgumentException("You can't process task again");
            }
            return tasks.TryAdd(taskModel.Uid, taskModel);
        }
    }
}
