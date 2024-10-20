﻿using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using TaskBrokerSandbox.DataSource;
using TaskBrokerSandbox.Workers;
using WebAPI.Hubs;
using WebAPI.Types;

namespace WebAPI.Workers
{
    public class TaskMonitoring(
        IHubContext<TaskProcessorsMonitoringHub> taskProcessorsMonitoringHub,
        TaskBroker taskBroker,
        TaskCache taskCache
    ) : BackgroundService
    {
        private readonly TimeSpan monitoringInterval = TimeSpan.FromSeconds(1);

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                await SendMonitoringData(cancellationToken);
                await Task.Delay(monitoringInterval, cancellationToken);
            }
        }

        private Task SendMonitoringData(CancellationToken cancellationToken)
        {
            var monitoringData = new MonitoringDataType
            {
                TaskProcessorsMonitoringData = taskBroker.GetTaskProcessorMonitoringData(),
                TotalTasksCount = taskCache.GetTotalTasksCount(),
                ProcessingTasksCount = taskCache.GetProcessingTasksCount(),
                CompletedTasksCount = taskCache.GetCompletedTasksCount(),
            };
            return taskProcessorsMonitoringHub.Clients.All.SendAsync("ReceiveMonitoringData", JsonConvert.SerializeObject(monitoringData), cancellationToken);
        }
    }
}
