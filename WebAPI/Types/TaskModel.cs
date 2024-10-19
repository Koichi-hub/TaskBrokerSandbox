namespace TaskBrokerSandbox.Types
{
    public class TaskModel
    {
        public Guid Uid { get; set; }

        public TaskProcessorTypeEnum TaskProcessorType { get; set; }

        public bool IsCompleted { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

        public DateTimeOffset CompletedAt { get; set; }
    }
}
