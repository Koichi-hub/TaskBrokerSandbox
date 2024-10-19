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

        public bool AddTask(TaskModel taskModel)
        {
            return tasks.TryAdd(taskModel.Uid, taskModel);
        }
    }
}
