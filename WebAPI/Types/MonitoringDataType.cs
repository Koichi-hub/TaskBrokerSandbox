using TaskBrokerSandbox.Types;

namespace WebAPI.Types
{
    public class MonitoringDataType
    {
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

        public Dictionary<TaskProcessorTypeEnum, int> TaskProcessorsMonitoringData { get; set; } = null!;

        public int TotalTasksCount { get; set; }

        public int ProcessingTasksCount { get; set; }

        public int CompletedTasksCount { get; set; }
    }
}
