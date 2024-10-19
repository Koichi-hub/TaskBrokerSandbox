using TaskBrokerSandbox.Types;

namespace TaskBrokerSandbox.Workers
{
    public class TaskBroker (
        IServiceScopeFactory serviceScopeFactory
    ) : BackgroundService
    {
        private readonly Dictionary<TaskProcessorTypeEnum, (TaskProcessor, IServiceScope)> taskProcessors = new();

        protected override Task ExecuteAsync(CancellationToken cancellationToken)
        {
            foreach (var taskProcessorType in Enum.GetValues(typeof(TaskProcessorTypeEnum)).Cast<TaskProcessorTypeEnum>())
            {
                var scope = serviceScopeFactory.CreateScope();
                var taskProcessor = scope.ServiceProvider.GetRequiredService<TaskProcessor>();
                taskProcessors.Add(taskProcessorType, (taskProcessor, scope));
                Task.Run(() => taskProcessor.Run(taskProcessorType, cancellationToken), cancellationToken);
            }
            return Task.CompletedTask;
        }

        public void AssignTaskToProcessor(Guid taskUid, TaskProcessorTypeEnum taskProcessorType)
        {
            taskProcessors[taskProcessorType].Item1.EnqueueTask(taskUid);
        }
    }
}
