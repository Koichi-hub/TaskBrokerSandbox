using System.Collections.Concurrent;
using TaskBrokerSandbox.DataSource;
using TaskBrokerSandbox.Types;

namespace TaskBrokerSandbox.Workers
{
    public class TaskProcessor(
        TaskCache taskCache    
    )
    {
        private TaskProcessorTypeEnum taskProcessorType;
        private readonly ConcurrentQueue<Guid> tasks = new();
        private readonly TimeSpan processInterval = TimeSpan.FromSeconds(1);

        public async Task Run(TaskProcessorTypeEnum taskProcessorType, CancellationToken cancellationToken)
        {
            this.taskProcessorType = taskProcessorType;
            Console.WriteLine($"Processor {taskProcessorType} has been started!");

            while (!cancellationToken.IsCancellationRequested)
            {
                if (!tasks.IsEmpty)
                {
                    await Process(cancellationToken);
                }
                await Task.Delay(processInterval, cancellationToken);
            }
        }

        private async Task Process(CancellationToken cancellationToken)
        {
            var random = new Random();
            while (!cancellationToken.IsCancellationRequested && tasks.TryPeek(out var taskUid))
            {
                var task = taskCache.GetTask(taskUid);
                await Task.Delay(TimeSpan.FromSeconds(random.Next(1, 10)), cancellationToken);
                task.IsCompleted = true;
                task.CompletedAt = DateTimeOffset.Now;
                tasks.TryDequeue(out var _);
            }
        }

        public void EnqueueTask(Guid taskUid)
        {
            tasks.Enqueue(taskUid);
        }

        public int GetTasksCount()
        {
            return tasks.Count;
        }
    }
}
